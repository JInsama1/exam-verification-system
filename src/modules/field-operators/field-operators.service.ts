import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';


import {
  InjectRepository,
} from '@nestjs/typeorm';


import {
  Repository,
} from 'typeorm';


import {
  createHash,
  randomBytes,
  timingSafeEqual,
} from 'crypto';


import {
  unlink,
} from 'fs/promises';


import {
  FieldOperator,
} from '../../database/entities/field-operator.entity';


import {
  Device,
  DeviceStatus,
} from '../../database/entities/device.entity';


import {
  BiometricCapture,
  BiometricCaptureType,
} from '../../database/entities/biometric-capture.entity';


import {
  RegisterFieldOperatorDto,
} from './dto/register-field-operator.dto';

import {
  LoginFieldOperatorDto,
} from './dto/login-field-operator.dto';

import {
  OperatorMeDto,
} from './dto/operator-me.dto';


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


function generateToken(): string {
  return randomBytes(32).toString('hex');
}


function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}


function secureCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, 'hex');
  const bBuf = Buffer.from(b, 'hex');
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}


@Injectable()
export class FieldOperatorsService {


  constructor(

    @InjectRepository(FieldOperator)
    private fieldOperatorRepository:
      Repository<FieldOperator>,

    @InjectRepository(Device)
    private deviceRepository:
      Repository<Device>,

    @InjectRepository(BiometricCapture)
    private captureRepository:
      Repository<BiometricCapture>,

  ) {}


  async register(
    dto: RegisterFieldOperatorDto,
    selfieFile: Express.Multer.File | undefined,
    idProofFile: Express.Multer.File | undefined,
  ): Promise<{
    fieldOperatorId: string;
    name: string;
    phone: string;
  }> {


    const existing =
      await this.fieldOperatorRepository.findOne({

        where: {
          phone:    dto.phone,
          isActive: true,
        },

      });


    if (existing) {

      await deleteFileSafe(selfieFile?.path);
      await deleteFileSafe(idProofFile?.path);

      return {
        fieldOperatorId: existing.id,
        name:            existing.name,
        phone:           existing.phone,
      };

    }


    const fieldOperator =
      this.fieldOperatorRepository.create({

        name:  dto.name,
        phone: dto.phone,

        phoneValid:          true,
        phoneValidationData: {
          source:  'format',
          country: 'IN',
        },

        idProofType: dto.idProofType,

      });


    if (selfieFile) {

      fieldOperator.selfieUrl =
        `/uploads/${selfieFile.filename}`;

    }


    if (idProofFile) {

      fieldOperator.idProofUrl =
        `/uploads/${idProofFile.filename}`;

    }


    try {


      const saved =
        await this.fieldOperatorRepository.save(
          fieldOperator,
        );


      return {
        fieldOperatorId: saved.id,
        name:            saved.name,
        phone:           saved.phone,
      };


    } catch (err: any) {


      if (err?.code === '23505') {


        const raceExisting =
          await this.fieldOperatorRepository.findOne({

            where: {
              phone:    dto.phone,
              isActive: true,
            },

          });


        await deleteFileSafe(selfieFile?.path);
        await deleteFileSafe(idProofFile?.path);


        if (!raceExisting) {
          throw err;
        }

        return {
          fieldOperatorId: raceExisting.id,
          name:            raceExisting.name,
          phone:           raceExisting.phone,
        };


      }


      throw err;


    }


  }


  async login(
    dto: LoginFieldOperatorDto,
  ): Promise<{
    operatorId:    string;
    operatorToken: string;
  }> {

    const operator =
      await this.fieldOperatorRepository.findOne({
        where: {
          phone:    dto.phone,
          isActive: true,
        },
      });

    if (!operator) {
      throw new UnauthorizedException(
        'Operator not found or inactive',
      );
    }

    const rawToken  = generateToken();
    const tokenHash = hashToken(rawToken);

    await this.fieldOperatorRepository.update(
      operator.id,
      {
        sessionTokenHash: tokenHash,
        lastLoginAt:      new Date(),
      },
    );

    // operatorToken is returned only here — never stored in plaintext
    return {
      operatorId:    operator.id,
      operatorToken: rawToken,
    };

  }


  async me(
    dto: OperatorMeDto,
  ) {

    // Load sessionTokenHash explicitly — it is select:false by default
    const operator = await this.fieldOperatorRepository
      .createQueryBuilder('fo')
      .addSelect('fo.sessionTokenHash')
      .where('fo.id = :id', { id: dto.operatorId })
      .getOne();

    if (!operator) {
      throw new NotFoundException('Operator not found');
    }

    if (!operator.isActive) {
      throw new ForbiddenException('Operator is inactive');
    }

    if (
      !operator.sessionTokenHash ||
      !secureCompare(
        hashToken(dto.operatorToken),
        operator.sessionTokenHash,
      )
    ) {
      throw new UnauthorizedException('Invalid operator token');
    }


    const [
      activatedDevices,
      totalEnrollments,
      totalVerifications,
      failedVerifications,
      lastActivityRow,
    ] = await Promise.all([

      // Devices activated by this operator that are currently ACTIVE
      this.deviceRepository.find({
        where: {
          activatedBy: { id: operator.id },
          status:      DeviceStatus.ACTIVE,
        },
        relations: { center: true },
      }),

      // All enrollment captures by this operator
      this.captureRepository
        .createQueryBuilder('cap')
        .innerJoin('cap.fieldOperator', 'operator')
        .where('operator.id = :opId', { opId: operator.id })
        .andWhere('cap.type = :type', { type: BiometricCaptureType.ENROLLMENT })
        .getCount(),

      // All verification captures by this operator
      this.captureRepository
        .createQueryBuilder('cap')
        .innerJoin('cap.fieldOperator', 'operator')
        .where('operator.id = :opId', { opId: operator.id })
        .andWhere('cap.type = :type', { type: BiometricCaptureType.VERIFICATION })
        .getCount(),

      // Verification captures that failed threshold
      this.captureRepository
        .createQueryBuilder('cap')
        .innerJoin('cap.fieldOperator', 'operator')
        .where('operator.id = :opId', { opId: operator.id })
        .andWhere('cap.type = :type', { type: BiometricCaptureType.VERIFICATION })
        .andWhere(
          '(cap.matchScore IS NULL OR cap.matchScore < :threshold)',
          { threshold: MATCH_THRESHOLD },
        )
        .getCount(),

      // Most recent capture timestamp — source of truth for last activity
      this.captureRepository
        .createQueryBuilder('cap')
        .select('MAX(cap.createdAt)', 'lastActivityAt')
        .innerJoin('cap.fieldOperator', 'operator')
        .where('operator.id = :opId', { opId: operator.id })
        .getRawOne<{ lastActivityAt: Date | null }>(),

    ]);


    return {
      operator: {
        id:          operator.id,
        name:        operator.name,
        phone:       operator.phone,
        phoneValid:  operator.phoneValid,
        selfieUrl:   operator.selfieUrl,
        idProofType: operator.idProofType,
        idProofUrl:  operator.idProofUrl,
        isActive:    operator.isActive,
        lastLoginAt: operator.lastLoginAt,
        createdAt:   operator.createdAt,
        updatedAt:   operator.updatedAt,
      },
      activatedDevices,
      stats: {
        totalEnrollments,
        totalVerifications,
        failedVerifications,
        lastActivityAt: lastActivityRow?.lastActivityAt ?? null,
      },
    };

  }


}
