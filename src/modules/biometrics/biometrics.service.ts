import {
  BadRequestException,
  ConflictException,
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
  BiometricTemplate,
} from '../../database/entities/biometric-template.entity';

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
  BiometricModality,
  BiometricPosition,
  TemplateFormat,
} from '../../common/enums/biometric-modality.enum';


import {
  EnrollBiometricDto,
} from './dto/enroll-biometric.dto';

import {
  VerifyBiometricDto,
} from './dto/verify-biometric.dto';


import {
  BiometricMatcherService,
} from './biometric-matcher.service';

import {
  BiometricTemplateNormalizerService,
} from './services/biometric-template-normalizer.service';

import {
  BiometricPolicyService,
} from './services/biometric-policy.service';

import {
  AuditService,
} from '../audit/audit.service';


import {
  BIOMETRIC_MATCH_THRESHOLD,
  MIN_FINGERPRINT_QUALITY,
  MIN_IRIS_QUALITY,
} from '../../common/constants/biometric.constants';

import {
  DEFAULT_BIOMETRIC_POLICY,
  PolicyShape,
} from '../../database/entities/biometric-policy.entity';


// ── Internal types ────────────────────────────────────────────────────────────

interface TemplateDraft {
  modality:       BiometricModality;
  position:       BiometricPosition | null;
  templateFormat: TemplateFormat;
  templateData:   string;
  qualityScore:   number | null;
}

const DEDUP_BATCH_SIZE = 500;


async function deleteFileSafe(
  filePath: string | undefined,
): Promise<void> {
  if (!filePath) return;
  try { await unlink(filePath); } catch { /* ignore cleanup errors */ }
}


// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class BiometricsService {


  constructor(

    @InjectRepository(FieldOperator)
    private readonly fieldOperatorRepository:
      Repository<FieldOperator>,

    @InjectRepository(BiometricTemplate)
    private readonly biometricTemplateRepository:
      Repository<BiometricTemplate>,

    @InjectDataSource()
    private readonly dataSource: DataSource,

    private readonly biometricMatcherService:
      BiometricMatcherService,

    private readonly normalizerService:
      BiometricTemplateNormalizerService,

    private readonly biometricPolicyService:
      BiometricPolicyService,

    private readonly auditService:
      AuditService,

  ) {}


  // ── Public: enroll ──────────────────────────────────────────────────────────

  async enroll(
    dto:      EnrollBiometricDto,
    faceFile: Express.Multer.File | undefined,
  ): Promise<{
    enrollmentId:     string;
    personIdentityId: string;
    candidateId:      string;
    status:           string;
    templatesAdded:   number;
  }> {

    try {

      // 1. Validate operator
      const fieldOperator =
        await this.fieldOperatorRepository.findOne({
          where: { id: dto.fieldOperatorId, isActive: true },
        });

      if (!fieldOperator) {
        throw new NotFoundException(
          `FieldOperator ${dto.fieldOperatorId} not found`,
        );
      }


      // 2. Load candidate — project for policy, personIdentity for dedup exclusion
      const policyCandidate =
        await this.dataSource
          .getRepository(Candidate)
          .findOne({
            where:     { id: dto.candidateId },
            relations: {
              exam:           { project: true },
              personIdentity: true,
            },
          });

      if (!policyCandidate) {
        throw new NotFoundException(
          `Candidate ${dto.candidateId} not found`,
        );
      }


      // 3. Resolve policy
      const projectId = policyCandidate.exam?.project?.id;
      const policy    = projectId
        ? await this.biometricPolicyService.getForProject(projectId)
        : DEFAULT_BIOMETRIC_POLICY;


      // 4. Build normalized template drafts (new path takes precedence over legacy)
      const isNewPath = !!(dto.biometricTemplates?.length);
      const drafts    = this.buildTemplateDrafts(dto);


      // 5. Quality validation
      this.enforceQuality(drafts);


      // 6. Policy validation
      this.enforcePolicyOnEnrollment(drafts, policy, isNewPath);


      // 7. Duplicate biometric detection — runs outside transaction per arch rule
      if (drafts.length > 0) {
        const existingIdentityId =
          policyCandidate.personIdentity?.id ?? null;

        await this.detectDuplicates(
          drafts, existingIdentityId, dto.candidateId,
        );
      }


      // 8. Persist inside transaction
      return await this.dataSource.transaction(async (manager) => {

        const candidateRepo         = manager.getRepository(Candidate);
        const personIdentityRepo    = manager.getRepository(PersonIdentity);
        const biometricCaptureRepo  = manager.getRepository(BiometricCapture);
        const biometricTemplateRepo = manager.getRepository(BiometricTemplate);

        const candidate =
          await candidateRepo.findOne({
            where:     { id: dto.candidateId },
            relations: { personIdentity: true },
            lock:      { mode: 'pessimistic_write' },
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


        let identity:       PersonIdentity;
        let templatesAdded: number = 0;


        if (candidate.personIdentity) {

          identity = candidate.personIdentity;

          if (isNewPath) {
            // Re-enrollment via new path: append provided templates to existing identity
            for (const draft of drafts) {
              await biometricTemplateRepo.save(
                biometricTemplateRepo.create({
                  personIdentity: identity,
                  modality:       draft.modality,
                  position:       draft.position,
                  templateFormat: draft.templateFormat,
                  templateData:   draft.templateData,
                  qualityScore:   draft.qualityScore,
                  active:         true,
                }),
              );
              templatesAdded++;
            }
          }
          // Legacy path re-enrollment: no template mutation (existing behavior)


        } else {

          // New enrollment — create PersonIdentity
          identity = personIdentityRepo.create();

          if (faceFile) {
            identity.primaryPhotoUrl = `/uploads/${faceFile.filename}`;
          }

          // Legacy single-template columns — kept for backward compatibility
          if (dto.fingerprintTemplate) {
            identity.fingerprintTemplate = dto.fingerprintTemplate;
          }
          if (dto.irisTemplate) {
            identity.irisTemplate = dto.irisTemplate;
          }

          identity  = await personIdentityRepo.save(identity);
          candidate.personIdentity = identity;
          await candidateRepo.save(candidate);

          for (const draft of drafts) {
            await biometricTemplateRepo.save(
              biometricTemplateRepo.create({
                personIdentity: identity,
                modality:       draft.modality,
                position:       draft.position,
                templateFormat: draft.templateFormat,
                templateData:   draft.templateData,
                qualityScore:   draft.qualityScore,
                active:         true,
              }),
            );
            templatesAdded++;
          }

        }


        const capture =
          biometricCaptureRepo.create({
            type:           BiometricCaptureType.ENROLLMENT,
            personIdentity: identity,
            candidate,
            fieldOperator,
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

        const saved = await biometricCaptureRepo.save(capture);

        return {
          enrollmentId:     saved.id,
          personIdentityId: identity.id,
          candidateId:      candidate.id,
          status:           'enrolled',
          templatesAdded,
        };

      });


    } catch (err) {
      await deleteFileSafe(faceFile?.path);
      throw err;
    }

  }


  // ── Public: verify ──────────────────────────────────────────────────────────

  async verify(
    dto:      VerifyBiometricDto,
    faceFile: Express.Multer.File | undefined,
  ): Promise<{
    status: 'VERIFIED' | 'FAILED' | 'NOT_ENROLLED';
    matchScore?: number;
    candidateId: string;
  }> {

    try {

      const fieldOperator =
        await this.fieldOperatorRepository.findOne({
          where: { id: dto.fieldOperatorId, isActive: true },
        });

      if (!fieldOperator) {
        throw new NotFoundException(
          `FieldOperator ${dto.fieldOperatorId} not found`,
        );
      }


      // Load with templates — scorer runs outside transaction (arch rule)
      const candidateForMatching =
        await this.dataSource
          .getRepository(Candidate)
          .findOne({
            where:     { id: dto.candidateId },
            relations: {
              personIdentity: { biometricTemplates: true },
            },
          });

      if (!candidateForMatching) {
        throw new NotFoundException(
          `Candidate ${dto.candidateId} not found`,
        );
      }

      if (!candidateForMatching.personIdentity) {
        await deleteFileSafe(faceFile?.path);
        return {
          status:      'NOT_ENROLLED',
          candidateId: candidateForMatching.id,
        };
      }


      const identity =
        candidateForMatching.personIdentity;

      const activeTemplates =
        identity.biometricTemplates?.filter(t => t.active) ?? [];


      let matchScore: number;

      if (activeTemplates.length > 0) {

        // ── Multi-template path ───────────────────────────────────────────
        const storedRefs = activeTemplates.map(t => ({
          templateData:   t.templateData,
          modality:       t.modality,
          templateFormat: t.templateFormat,
        }));

        const modalityScores: number[] = [];

        if (dto.fingerprintTemplate) {
          modalityScores.push(
            await this.biometricMatcherService.computeScoreMultiTemplate({
              submittedTemplate: dto.fingerprintTemplate,
              modality:          BiometricModality.FINGERPRINT,
              format:            TemplateFormat.ISO_19794_2,
              storedTemplates:   storedRefs,
            }),
          );
        }

        if (dto.irisTemplate) {
          modalityScores.push(
            await this.biometricMatcherService.computeScoreMultiTemplate({
              submittedTemplate: dto.irisTemplate,
              modality:          BiometricModality.IRIS,
              format:            TemplateFormat.ISO_19794_6,
              storedTemplates:   storedRefs,
            }),
          );
        }

        matchScore = modalityScores.length > 0
          ? Math.round(
              modalityScores.reduce((sum, s) => sum + s, 0) /
              modalityScores.length,
            )
          : 0;

      } else {

        // ── Legacy fallback ───────────────────────────────────────────────
        matchScore =
          await this.biometricMatcherService.computeScore({
            submittedFingerprint: dto.fingerprintTemplate,
            storedFingerprint:    identity.fingerprintTemplate,
            submittedIris:        dto.irisTemplate,
            storedIris:           identity.irisTemplate,
          });

      }


      return await this.dataSource.transaction(
        async (manager): Promise<{
          status: 'VERIFIED' | 'FAILED' | 'NOT_ENROLLED';
          matchScore?: number;
          candidateId: string;
        }> => {

          const candidateRepo        = manager.getRepository(Candidate);
          const biometricCaptureRepo = manager.getRepository(BiometricCapture);

          const candidate =
            await candidateRepo.findOne({
              where:     { id: dto.candidateId },
              relations: { personIdentity: true },
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

          const capture =
            biometricCaptureRepo.create({
              type:           BiometricCaptureType.VERIFICATION,
              personIdentity: candidate.personIdentity,
              candidate,
              fieldOperator,
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
            status:      matchScore >= BIOMETRIC_MATCH_THRESHOLD
              ? 'VERIFIED'
              : 'FAILED',
            matchScore,
            candidateId: candidate.id,
          };

        },
      );


    } catch (err) {
      await deleteFileSafe(faceFile?.path);
      throw err;
    }

  }


  // ── Private: build normalized drafts ────────────────────────────────────────

  private buildTemplateDrafts(dto: EnrollBiometricDto): TemplateDraft[] {
    const drafts: TemplateDraft[] = [];

    if (dto.biometricTemplates?.length) {

      for (const item of dto.biometricTemplates) {
        drafts.push({
          modality:       item.modality,
          position:       item.position,
          templateFormat: item.templateFormat,
          templateData:   this.normalizerService.normalize(
            item.templateData, item.templateFormat,
          ),
          qualityScore: item.qualityScore ?? null,
        });
      }

    } else {

      // Legacy path — default positions
      if (dto.fingerprintTemplate) {
        drafts.push({
          modality:       BiometricModality.FINGERPRINT,
          position:       BiometricPosition.RIGHT_THUMB,
          templateFormat: TemplateFormat.ISO_19794_2,
          templateData:   this.normalizerService.normalize(
            dto.fingerprintTemplate, TemplateFormat.ISO_19794_2,
          ),
          qualityScore:   null,
        });
      }

      if (dto.irisTemplate) {
        drafts.push({
          modality:       BiometricModality.IRIS,
          position:       BiometricPosition.RIGHT_EYE,
          templateFormat: TemplateFormat.ISO_19794_6,
          templateData:   this.normalizerService.normalize(
            dto.irisTemplate, TemplateFormat.ISO_19794_6,
          ),
          qualityScore:   null,
        });
      }

    }

    return drafts;
  }


  // ── Private: quality enforcement ────────────────────────────────────────────

  private enforceQuality(drafts: TemplateDraft[]): void {

    for (const draft of drafts) {

      // Nullable quality score — some SDKs do not provide it
      if (draft.qualityScore === null) continue;

      const threshold =
        draft.modality === BiometricModality.FINGERPRINT
          ? MIN_FINGERPRINT_QUALITY
          : MIN_IRIS_QUALITY;

      if (draft.qualityScore < threshold) {
        const label = draft.position ?? draft.modality;
        throw new BadRequestException(
          `${label} ${draft.modality.toLowerCase()} quality too low: ` +
          `${draft.qualityScore} (minimum: ${threshold})`,
        );
      }

    }

  }


  // ── Private: policy enforcement ─────────────────────────────────────────────

  private enforcePolicyOnEnrollment(
    drafts:    TemplateDraft[],
    policy:    PolicyShape,
    isNewPath: boolean,
  ): void {

    if (isNewPath) {

      // Position-aware validation for the multi-template path
      const submittedFp =
        drafts
          .filter(d => d.modality === BiometricModality.FINGERPRINT && d.position)
          .map(d => d.position as BiometricPosition);

      const submittedIris =
        drafts
          .filter(d => d.modality === BiometricModality.IRIS && d.position)
          .map(d => d.position as BiometricPosition);

      // Count positions that satisfy the policy list
      const validFp   = submittedFp.filter(p =>
        policy.requiredFingerprints.includes(p));
      const validIris = submittedIris.filter(p =>
        policy.requiredIris.includes(p));

      if (validFp.length < policy.minimumFingerprintsRequired) {
        const missing = policy.requiredFingerprints.filter(
          p => !submittedFp.includes(p),
        );
        throw new BadRequestException(
          `Missing required biometric: ${missing.join(', ')}. ` +
          `Need at least ${policy.minimumFingerprintsRequired} from ` +
          `[${policy.requiredFingerprints.join(', ')}]`,
        );
      }

      if (validIris.length < policy.minimumIrisRequired) {
        const missing = policy.requiredIris.filter(
          p => !submittedIris.includes(p),
        );
        throw new BadRequestException(
          `Missing required biometric: ${missing.join(', ')}. ` +
          `Need at least ${policy.minimumIrisRequired} from ` +
          `[${policy.requiredIris.join(', ')}]`,
        );
      }

      // Extra-capture gate
      if (!policy.allowExtraCapture) {
        for (const pos of submittedFp) {
          if (!policy.requiredFingerprints.includes(pos)) {
            throw new BadRequestException(
              `Fingerprint position ${pos} is not allowed by enrollment policy`,
            );
          }
        }
        for (const pos of submittedIris) {
          if (!policy.requiredIris.includes(pos)) {
            throw new BadRequestException(
              `Iris position ${pos} is not allowed by enrollment policy`,
            );
          }
        }
      }


    } else {

      // Legacy count-based validation
      const fpCount   =
        drafts.filter(d => d.modality === BiometricModality.FINGERPRINT).length;
      const irisCount =
        drafts.filter(d => d.modality === BiometricModality.IRIS).length;

      if (fpCount < policy.minimumFingerprintsRequired) {
        throw new BadRequestException(
          `Enrollment policy requires at least ` +
          `${policy.minimumFingerprintsRequired} fingerprint(s). ` +
          `Required positions: ${policy.requiredFingerprints.join(', ')}`,
        );
      }

      if (irisCount < policy.minimumIrisRequired) {
        throw new BadRequestException(
          `Enrollment policy requires at least ` +
          `${policy.minimumIrisRequired} iris scan(s). ` +
          `Required positions: ${policy.requiredIris.join(', ')}`,
        );
      }

    }

  }


  // ── Private: duplicate detection ────────────────────────────────────────────

  private async detectDuplicates(
    drafts:                  TemplateDraft[],
    excludePersonIdentityId: string | null,
    currentCandidateId:      string,
  ): Promise<void> {

    for (const draft of drafts) {

      const match =
        await this.findDuplicateInBatches(draft, excludePersonIdentityId);

      if (match) {

        // Audit asynchronously — never let an audit write block or suppress the error
        this.auditService
          .log('system', 'BIOMETRIC_DUPLICATE_DETECTED', {
            currentCandidateId,
            matchedPersonIdentityId: match.matchedPersonIdentityId,
            matchedCandidateId:      match.matchedCandidateId,
            modality:                draft.modality,
            position:                draft.position,
            score:                   match.score,
          })
          .catch(() => {});

        throw new ConflictException(
          'Biometric already enrolled with another candidate',
        );

      }

    }

  }


  private async findDuplicateInBatches(
    draft:                   TemplateDraft,
    excludePersonIdentityId: string | null,
  ): Promise<{
    matchedPersonIdentityId: string | null;
    matchedCandidateId:      string | null;
    score:                   number;
  } | null> {

    let offset = 0;

    while (true) {

      // Partial-column select to avoid loading legacy TEXT template blobs from PersonIdentity
      const qb =
        this.biometricTemplateRepository
          .createQueryBuilder('bt')
          .select([
            'bt.id',
            'bt.templateData',
            'bt.modality',
            'bt.templateFormat',
          ])
          .leftJoin('bt.personIdentity', 'pi')
          .addSelect('pi.id')
          .where('bt.modality = :modality', { modality: draft.modality })
          .andWhere('bt.active = :active',  { active: true })
          .skip(offset)
          .take(DEDUP_BATCH_SIZE);

      if (excludePersonIdentityId) {
        qb.andWhere('pi.id != :excludeId', {
          excludeId: excludePersonIdentityId,
        });
      }

      const batch = await qb.getMany();
      if (batch.length === 0) break;


      // Fast-discard: check max score across entire batch with a single call
      const batchRefs = batch.map(t => ({
        templateData:   t.templateData,
        modality:       t.modality,
        templateFormat: t.templateFormat,
      }));

      const maxScore =
        await this.biometricMatcherService.computeScoreMultiTemplate({
          submittedTemplate: draft.templateData,
          modality:          draft.modality,
          format:            draft.templateFormat,
          storedTemplates:   batchRefs,
        });

      if (maxScore >= BIOMETRIC_MATCH_THRESHOLD) {

        // Find the specific matching template for the audit log
        for (const existing of batch) {
          const score =
            await this.biometricMatcherService.computeScoreMultiTemplate({
              submittedTemplate: draft.templateData,
              modality:          draft.modality,
              format:            draft.templateFormat,
              storedTemplates:   [{
                templateData:   existing.templateData,
                modality:       existing.modality,
                templateFormat: existing.templateFormat,
              }],
            });

          if (score >= BIOMETRIC_MATCH_THRESHOLD) {

            const piId: string | null =
              existing.personIdentity?.id ?? null;

            // Resolve a candidate ID for the audit log (best-effort)
            let matchedCandidateId: string | null = null;
            if (piId) {
              const cand =
                await this.dataSource
                  .getRepository(Candidate)
                  .findOne({
                    where:  { personIdentity: { id: piId } },
                    order:  { createdAt: 'ASC' },
                    select: { id: true },
                  });
              matchedCandidateId = cand?.id ?? null;
            }

            return { matchedPersonIdentityId: piId, matchedCandidateId, score };

          }
        }

      }

      if (batch.length < DEDUP_BATCH_SIZE) break;
      offset += DEDUP_BATCH_SIZE;

    }

    return null;

  }


}
