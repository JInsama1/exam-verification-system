import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';


import {
  InjectDataSource,
  InjectRepository,
} from '@nestjs/typeorm';


import {
  DataSource,
  Repository,
} from 'typeorm';


import {
  unlink,
} from 'fs/promises';


import {
  PersonIdentity,
} from '../../database/entities/person-identity.entity';


import {
  BiometricCapture,
  BiometricCaptureType,
} from '../../database/entities/biometric-capture.entity';


import {
  Candidate,
} from '../../database/entities/candidate.entity';


import {
  FieldOperator,
} from '../../database/entities/field-operator.entity';


import {
  Device,
} from '../../database/entities/device.entity';


import {
  EnrollBiometricDto,
} from './dto/enroll-biometric.dto';


import {
  VerifyBiometricDto,
} from './dto/verify-biometric.dto';


const MATCH_THRESHOLD = 80;


async function deleteFileSafe(
  filePath: string | undefined,
): Promise<void> {

  if (!filePath) return;

  try {
    await unlink(filePath);
  } catch {
    // ignore cleanup errors
  }

}


function computeMatchScore(
  submittedFingerprint: string | undefined,
  storedFingerprint:   string | null | undefined,
  submittedIris:       string | undefined,
  storedIris:          string | null | undefined,
): number {

  const scores: number[] = [];

  if (submittedFingerprint && storedFingerprint) {
    scores.push(
      submittedFingerprint === storedFingerprint ? 100 : 30,
    );
  }

  if (submittedIris && storedIris) {
    scores.push(
      submittedIris === storedIris ? 100 : 30,
    );
  }

  if (scores.length === 0) return 0;

  return Math.round(
    scores.reduce((sum, s) => sum + s, 0) / scores.length,
  );

}


@Injectable()
export class BiometricsService {


  constructor(

    @InjectRepository(FieldOperator)
    private fieldOperatorRepository:
      Repository<FieldOperator>,

    @InjectDataSource()
    private dataSource: DataSource,

  ) {}


  async enroll(
    dto: EnrollBiometricDto,
    faceFile: Express.Multer.File | undefined,
  ): Promise<{
    enrollmentId: string;
    personIdentityId: string;
    candidateId: string;
    status: string;
  }> {


    try {


      const fieldOperator =
        await this.fieldOperatorRepository.findOne({
          where: {
            id:       dto.fieldOperatorId,
            isActive: true,
          },
        });

      if (!fieldOperator) {
        throw new NotFoundException(
          `FieldOperator ${dto.fieldOperatorId} not found`,
        );
      }


      return await this.dataSource.transaction(
        async (manager) => {


          const candidateRepo =
            manager.getRepository(Candidate);

          const personIdentityRepo =
            manager.getRepository(PersonIdentity);

          const biometricCaptureRepo =
            manager.getRepository(BiometricCapture);


          const candidate =
            await candidateRepo.findOne({
              where: { id: dto.candidateId },
              relations: { personIdentity: true },
              lock: { mode: 'pessimistic_write' },
            });

          if (!candidate) {
            throw new NotFoundException(
              `Candidate ${dto.candidateId} not found`,
            );
          }


          let device: Device | null = null;

          if (dto.deviceId) {
            device =
              await manager.getRepository(Device).findOne({
                where: { id: dto.deviceId },
              });

            if (!device) {
              throw new NotFoundException(
                `Device ${dto.deviceId} not found`,
              );
            }
          }


          let identity: PersonIdentity;

          if (candidate.personIdentity) {

            identity = candidate.personIdentity;

          } else {

            identity = personIdentityRepo.create();

            if (faceFile) {
              identity.primaryPhotoUrl =
                `/uploads/${faceFile.filename}`;
            }

            if (dto.fingerprintTemplate) {
              identity.fingerprintTemplate =
                dto.fingerprintTemplate;
            }

            if (dto.irisTemplate) {
              identity.irisTemplate = dto.irisTemplate;
            }

            identity =
              await personIdentityRepo.save(identity);

            candidate.personIdentity = identity;
            await candidateRepo.save(candidate);

          }


          const capture =
            biometricCaptureRepo.create({

              type:           BiometricCaptureType.ENROLLMENT,
              personIdentity: identity,
              candidate:      candidate,
              fieldOperator:  fieldOperator,

              ...(device && { device }),

              ...(faceFile && {
                faceUrl: `/uploads/${faceFile.filename}`,
              }),

              ...(dto.fingerprintTemplate && {
                fingerprintTemplate: dto.fingerprintTemplate,
              }),

              ...(dto.irisTemplate && {
                irisTemplate: dto.irisTemplate,
              }),

            });

          const saved =
            await biometricCaptureRepo.save(capture);


          return {
            enrollmentId:     saved.id,
            personIdentityId: identity.id,
            candidateId:      candidate.id,
            status:           'enrolled',
          };


        },
      );


    } catch (err) {

      await deleteFileSafe(faceFile?.path);
      throw err;

    }


  }


  async verify(
    dto: VerifyBiometricDto,
    faceFile: Express.Multer.File | undefined,
  ): Promise<{
    status: 'VERIFIED' | 'FAILED' | 'NOT_ENROLLED';
    matchScore?: number;
    candidateId: string;
  }> {


    try {


      const fieldOperator =
        await this.fieldOperatorRepository.findOne({
          where: {
            id:       dto.fieldOperatorId,
            isActive: true,
          },
        });

      if (!fieldOperator) {
        throw new NotFoundException(
          `FieldOperator ${dto.fieldOperatorId} not found`,
        );
      }


      const result =
        await this.dataSource.transaction(
          async (manager): Promise<{
            status: 'VERIFIED' | 'FAILED' | 'NOT_ENROLLED';
            matchScore?: number;
            candidateId: string;
          }> => {


            const candidateRepo =
              manager.getRepository(Candidate);

            const biometricCaptureRepo =
              manager.getRepository(BiometricCapture);


            const candidate =
              await candidateRepo.findOne({
                where: { id: dto.candidateId },
                relations: { personIdentity: true },
              });

            if (!candidate) {
              throw new NotFoundException(
                `Candidate ${dto.candidateId} not found`,
              );
            }


            if (!candidate.personIdentity) {
              return {
                status:      'NOT_ENROLLED',
                candidateId: candidate.id,
              };
            }


            const matchScore = computeMatchScore(
              dto.fingerprintTemplate,
              candidate.personIdentity.fingerprintTemplate,
              dto.irisTemplate,
              candidate.personIdentity.irisTemplate,
            );


            let device: Device | null = null;

            if (dto.deviceId) {
              device =
                await manager.getRepository(Device).findOne({
                  where: { id: dto.deviceId },
                });

              if (!device) {
                throw new NotFoundException(
                  `Device ${dto.deviceId} not found`,
                );
              }
            }


            const capture =
              biometricCaptureRepo.create({

                type:           BiometricCaptureType.VERIFICATION,
                personIdentity: candidate.personIdentity,
                candidate:      candidate,
                fieldOperator:  fieldOperator,
                matchScore,

                ...(device && { device }),

                ...(faceFile && {
                  faceUrl: `/uploads/${faceFile.filename}`,
                }),

                ...(dto.fingerprintTemplate && {
                  fingerprintTemplate: dto.fingerprintTemplate,
                }),

                ...(dto.irisTemplate && {
                  irisTemplate: dto.irisTemplate,
                }),

              });

            await biometricCaptureRepo.save(capture);


            return {
              status:      matchScore >= MATCH_THRESHOLD
                ? 'VERIFIED'
                : 'FAILED',
              matchScore,
              candidateId: candidate.id,
            };


          },
        );


      if (result.status === 'NOT_ENROLLED') {
        await deleteFileSafe(faceFile?.path);
      }

      return result;


    } catch (err) {

      await deleteFileSafe(faceFile?.path);
      throw err;

    }


  }


}
