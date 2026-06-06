import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
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
  createCipheriv,
  createHash,
  randomBytes,
  timingSafeEqual,
} from 'crypto';


import {
  Device,
  DeviceStatus,
} from '../../database/entities/device.entity';


import {
  Exam,
} from '../../database/entities/exam.entity';


import {
  Shift,
} from '../../database/entities/shift.entity';


import {
  Candidate,
} from '../../database/entities/candidate.entity';


import {
  FieldOperator,
} from '../../database/entities/field-operator.entity';


import {
  BiometricCapture,
  BiometricCaptureType,
} from '../../database/entities/biometric-capture.entity';


import {
  OfflineSyncJob,
  SyncJobStatus,
} from '../../database/entities/offline-sync-job.entity';


import {
  BiometricMatcherService,
} from '../biometrics/biometric-matcher.service';

import {
  BiometricModality,
  BiometricPosition,
  TemplateFormat,
} from '../../common/enums/biometric-modality.enum';

import {
  BiometricPolicy,
  DEFAULT_BIOMETRIC_POLICY,
} from '../../database/entities/biometric-policy.entity';


import {
  DownloadPackageDto,
} from './dto/download-package.dto';


import {
  UploadSyncDto,
} from './dto/upload-sync.dto';


import { BIOMETRIC_MATCH_THRESHOLD } from '../../common/constants/biometric.constants';
const SCORER_CONCURRENCY = 20;


// ── Encryption helpers ────────────────────────────────────────────────────────

export type EncryptedTemplate = {
  iv:      string;   // 12-byte GCM IV, hex-encoded
  authTag: string;   // 16-byte GCM auth tag, hex-encoded
  data:    string;   // AES-256-GCM ciphertext, base64-encoded
} | null;


// Key is derived from the device's own token so only that device can decrypt.
// A domain prefix prevents the same token being used as a key for other purposes.
function derivePackageKey(deviceToken: string): Buffer {
  return createHash('sha256')
    .update('evs-package-v1:')
    .update(deviceToken)
    .digest();
}


function encryptTemplate(
  plaintext: string,
  key: Buffer,
): { iv: string; authTag: string; data: string } {

  const iv     = randomBytes(12);  // 96-bit IV required by AES-GCM
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const enc    = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  return {
    iv:      iv.toString('hex'),
    authTag: cipher.getAuthTag().toString('hex'),
    data:    enc.toString('base64'),
  };

}


// ── Auth helpers ──────────────────────────────────────────────────────────────

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}


function secureCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, 'hex');
  const bBuf = Buffer.from(b, 'hex');
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}


// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class SyncService {


  constructor(

    @InjectRepository(Device)
    private deviceRepo: Repository<Device>,

    @InjectRepository(Exam)
    private examRepo: Repository<Exam>,

    @InjectRepository(Shift)
    private shiftRepo: Repository<Shift>,

    @InjectRepository(Candidate)
    private candidateRepo: Repository<Candidate>,

    @InjectRepository(FieldOperator)
    private fieldOperatorRepo: Repository<FieldOperator>,

    @InjectRepository(OfflineSyncJob)
    private syncJobRepo: Repository<OfflineSyncJob>,

    @InjectRepository(BiometricPolicy)
    private policyRepo: Repository<BiometricPolicy>,

    @InjectDataSource()
    private dataSource: DataSource,

    private readonly biometricMatcherService: BiometricMatcherService,

  ) {}


  // Also loads center.project so requestPackage can verify exam project scope.
  private async validateDevice(
    deviceId:    string,
    deviceToken: string,
  ): Promise<Device> {

    const device = await this.deviceRepo
      .createQueryBuilder('device')
      .addSelect('device.deviceTokenHash')
      .leftJoinAndSelect('device.center',  'center')
      .leftJoinAndSelect('center.project', 'project')
      .where('device.id = :id', { id: deviceId })
      .getOne();

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    if (device.status === DeviceStatus.BLOCKED) {
      throw new ForbiddenException('Device is blocked');
    }

    if (device.status === DeviceStatus.PENDING) {
      throw new ForbiddenException('Device is not activated');
    }

    if (
      !device.deviceTokenHash ||
      !secureCompare(hashToken(deviceToken), device.deviceTokenHash)
    ) {
      throw new UnauthorizedException('Invalid device token');
    }

    return device;

  }


  async requestPackage(dto: DownloadPackageDto): Promise<{
    syncJobId:      string;
    generatedAt:    Date;
    exam:           { id: string; name: string; examCode: string };
    shift:          { id: string; name: string } | null;
    center:         { id: string; centerCode: string; name: string };
    candidateCount: number;
    policy: {
      fingerprints: BiometricPosition[];
      iris:         BiometricPosition[];
    };
    candidates: {
      id:                  string;
      rollNumber:          string;
      name:                string;
      photoUrl:            string | null;
      fingerprintTemplate: EncryptedTemplate;
      irisTemplate:        EncryptedTemplate;
      templates: {
        modality:          BiometricModality;
        position:          BiometricPosition | null;
        templateFormat:    TemplateFormat;
        encryptedTemplate: EncryptedTemplate;
        qualityScore:      number | null;
      }[];
    }[];
  }> {

    const device = await this.validateDevice(dto.deviceId, dto.deviceToken);

    const exam = await this.examRepo.findOne({
      where:     { id: dto.examId },
      relations: { project: true },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    // Exam must belong to the same project as the device's center
    if (exam.project.id !== device.center.project.id) {
      throw new ForbiddenException(
        'Exam does not belong to this device\'s project',
      );
    }

    // Load the biometric capture policy for this project, falling back to the
    // built-in default if none has been configured yet.
    const policyRow = await this.policyRepo.findOne({
      where: { project: { id: exam.project.id } },
    });
    const policy = policyRow ?? DEFAULT_BIOMETRIC_POLICY;

    let shift: Shift | null = null;

    if (dto.shiftId) {
      shift = await this.shiftRepo.findOne({
        where: { id: dto.shiftId },
      });

      if (!shift) {
        throw new NotFoundException('Shift not found');
      }
    }

    const centerId  = device.center.id;
    const packageKey = derivePackageKey(dto.deviceToken);

    const qb = this.candidateRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.personIdentity', 'pi')
      .leftJoinAndSelect(
        'pi.biometricTemplates', 'bt',
        'bt.active = :btActive', { btActive: true },
      )
      .innerJoin('c.center', 'center')
      .innerJoin('c.exam',   'exam')
      .where('center.id = :centerId', { centerId })
      .andWhere('exam.id = :examId',  { examId: dto.examId });

    if (dto.shiftId) {
      qb.innerJoin('c.shift', 'shift')
        .andWhere('shift.id = :shiftId', { shiftId: dto.shiftId });
    }

    const candidates = await qb.getMany();

    const job = this.syncJobRepo.create({
      device,
      exam,
      center:         device.center,
      candidateCount: candidates.length,
      status:         SyncJobStatus.DOWNLOADED,
      ...(shift && { shift }),
    });

    const savedJob = await this.syncJobRepo.save(job);

    return {
      syncJobId:      savedJob.id,
      generatedAt:    savedJob.createdAt,
      exam: {
        id:       exam.id,
        name:     exam.name,
        examCode: exam.examCode,
      },
      shift: shift
        ? { id: shift.id, name: shift.name }
        : null,
      center: {
        id:         device.center.id,
        centerCode: device.center.centerCode,
        name:       device.center.name,
      },
      candidateCount: candidates.length,
      policy: {
        fingerprints: policy.requiredFingerprints,
        iris:         policy.requiredIris,
      },
      candidates: candidates.map(c => ({
        id:         c.id,
        rollNumber: c.rollNumber,
        name:       c.name,
        photoUrl:   c.photoUrl ?? null,
        // Legacy single-template fields — kept for backward compatibility
        // with tablet app versions that do not yet consume the templates array.
        fingerprintTemplate: c.personIdentity?.fingerprintTemplate
          ? encryptTemplate(c.personIdentity.fingerprintTemplate, packageKey)
          : null,
        irisTemplate: c.personIdentity?.irisTemplate
          ? encryptTemplate(c.personIdentity.irisTemplate, packageKey)
          : null,
        // Universal multi-template array — empty for candidates enrolled before
        // Phase 8.2; tablet should prefer this over the legacy fields when non-empty.
        templates: (c.personIdentity?.biometricTemplates ?? []).map(bt => ({
          modality:          bt.modality,
          position:          bt.position  ?? null,
          templateFormat:    bt.templateFormat,
          encryptedTemplate: bt.templateData
            ? encryptTemplate(bt.templateData, packageKey)
            : null,
          qualityScore:      bt.qualityScore ?? null,
        })),
      })),
    };

  }


  async uploadCaptures(dto: UploadSyncDto): Promise<{
    accepted:  number;
    skipped:   number;
    conflicts: number;
  }> {

    const device = await this.validateDevice(dto.deviceId, dto.deviceToken);

    // Fast-fail pre-check (authoritative check is the pessimistic lock inside tx)
    const syncJobPre = await this.syncJobRepo.findOne({
      where:     { id: dto.syncJobId },
      relations: { device: true },
    });

    if (!syncJobPre) {
      throw new NotFoundException('Sync job not found');
    }

    if (syncJobPre.device.id !== device.id) {
      throw new ForbiddenException(
        'Sync job does not belong to this device',
      );
    }

    if (syncJobPre.status === SyncJobStatus.UPLOADED) {
      throw new BadRequestException('Sync job already uploaded');
    }

    const syncJobCreatedAt = syncJobPre.createdAt;


    // ── Bulk load operators ───────────────────────────────────────────────
    const operatorIds = [
      ...new Set(dto.captures.map(c => c.fieldOperatorId)),
    ];

    const operators = await this.fieldOperatorRepo
      .createQueryBuilder('fo')
      .where('fo.id IN (:...ids)', { ids: operatorIds })
      .andWhere('fo.isActive = true')
      .getMany();

    const operatorMap = new Map(
      operators.map(fo => [fo.id, fo]),
    );


    // ── Bulk load candidates + personIdentity ─────────────────────────────
    const candidateIds = [
      ...new Set(dto.captures.map(c => c.candidateId)),
    ];

    const candidates = await this.candidateRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.personIdentity', 'pi')
      .where('c.id IN (:...ids)', { ids: candidateIds })
      .getMany();

    const candidateMap = new Map(
      candidates.map(c => [c.id, c]),
    );


    // ── Bulk conflict detection (one query) ───────────────────────────────
    // Conflict: candidate was successfully verified online (capturedAt IS NULL)
    // AFTER this sync job was created — offline result is stale but still saved.
    const conflictRows = await this.dataSource
      .getRepository(BiometricCapture)
      .createQueryBuilder('cap')
      .innerJoin('cap.candidate', 'cand')
      .select('cand.id', 'candidateId')
      .where('cand.id IN (:...ids)',            { ids: candidateIds })
      .andWhere('cap.type = :type',             { type: BiometricCaptureType.VERIFICATION })
      .andWhere('cap.capturedAt IS NULL')
      .andWhere('cap.createdAt > :since',       { since: syncJobCreatedAt })
      .andWhere('cap.matchScore >= :threshold', { threshold: BIOMETRIC_MATCH_THRESHOLD })
      .groupBy('cand.id')
      .getRawMany<{ candidateId: string }>();

    const conflictedIds = new Set(conflictRows.map(r => r.candidateId));


    // ── Compute server-side match scores with bounded concurrency ─────────
    // Matcher calls run OUTSIDE the transaction (architecture rule: no SDK
    // calls while holding DB locks). Concurrency is capped at SCORER_CONCURRENCY
    // so a large batch does not open an unbounded number of parallel SDK calls.

    type PreparedCapture = {
      candidate:           Candidate;
      personIdentityId:    string;
      fieldOperator:       FieldOperator;
      matchScore:          number;
      capturedAt:          Date;
      fingerprintTemplate: string | undefined;
      irisTemplate:        string | undefined;
      isConflict:          boolean;
    };

    const prepared: PreparedCapture[] = [];
    let skipped   = 0;
    let queueIdx  = 0;

    const processOne = async (): Promise<void> => {
      while (true) {
        const i = queueIdx++;
        if (i >= dto.captures.length) return;

        const item          = dto.captures[i];
        const candidate     = candidateMap.get(item.candidateId);
        const fieldOperator = operatorMap.get(item.fieldOperatorId);

        if (!candidate || !candidate.personIdentity || !fieldOperator) {
          skipped++;
          continue;
        }

        // Device-reported score (deviceMatchScore) is ignored — server
        // recomputes from submitted templates against stored identity.
        const matchScore = await this.biometricMatcherService.computeScore({
          submittedFingerprint: item.fingerprintTemplate,
          storedFingerprint:    candidate.personIdentity.fingerprintTemplate,
          submittedIris:        item.irisTemplate,
          storedIris:           candidate.personIdentity.irisTemplate,
        });

        prepared.push({
          candidate,
          personIdentityId:    candidate.personIdentity.id,
          fieldOperator,
          matchScore,
          capturedAt:          new Date(item.capturedAt),
          fingerprintTemplate: item.fingerprintTemplate,
          irisTemplate:        item.irisTemplate,
          isConflict:          conflictedIds.has(item.candidateId),
        });
      }
    };

    const workerCount = Math.min(SCORER_CONCURRENCY, dto.captures.length);
    await Promise.all(Array.from({ length: workerCount }, processOne));


    // ── Bulk write inside transaction with pessimistic lock ───────────────
    let accepted  = 0;
    let conflicts = 0;

    await this.dataSource.transaction(async (manager) => {

      const captureRepo = manager.getRepository(BiometricCapture);
      const syncJobRepo = manager.getRepository(OfflineSyncJob);

      // Pessimistic write lock serialises concurrent duplicate upload attempts
      // for the same sync job — both would otherwise pass the pre-check above.
      const lockedJob = await syncJobRepo.findOne({
        where: { id: dto.syncJobId },
        lock:  { mode: 'pessimistic_write' },
      });

      if (!lockedJob || lockedJob.status === SyncJobStatus.UPLOADED) {
        throw new BadRequestException('Sync job already uploaded');
      }

      if (prepared.length > 0) {
        await captureRepo.insert(
          prepared.map(p => ({
            type:           BiometricCaptureType.VERIFICATION,
            personIdentity: { id: p.personIdentityId },
            candidate:      { id: p.candidate.id },
            fieldOperator:  { id: p.fieldOperator.id },
            device:         { id: device.id },
            syncJob:        { id: lockedJob.id },
            matchScore:     p.matchScore,
            capturedAt:     p.capturedAt,
            fingerprintTemplate: p.fingerprintTemplate ?? undefined,
            irisTemplate:        p.irisTemplate        ?? undefined,
          })),
        );
      }

      accepted  = prepared.filter(p => !p.isConflict).length;
      conflicts = prepared.filter(p =>  p.isConflict).length;

      lockedJob.status        = SyncJobStatus.UPLOADED;
      lockedJob.uploadedAt    = new Date();
      lockedJob.uploadedCount = accepted + conflicts;
      lockedJob.conflictCount = conflicts;

      await syncJobRepo.save(lockedJob);

    });

    return { accepted, skipped, conflicts };

  }


  async listJobsForDevice(
    deviceId:    string,
    deviceToken: string,
  ): Promise<{
    id:             string;
    status:         SyncJobStatus;
    candidateCount: number;
    uploadedCount:  number;
    conflictCount:  number;
    createdAt:      Date;
    uploadedAt:     Date | null;
    exam:           { id: string; examCode: string; name: string };
    shift:          { id: string; name: string } | null;
  }[]> {

    const device = await this.validateDevice(deviceId, deviceToken);

    const jobs = await this.syncJobRepo.find({
      where:     { device: { id: device.id } },
      relations: { exam: true, shift: true },
      order:     { createdAt: 'DESC' },
      take:       50,
    });

    return jobs.map(j => ({
      id:             j.id,
      status:         j.status,
      candidateCount: j.candidateCount,
      uploadedCount:  j.uploadedCount,
      conflictCount:  j.conflictCount,
      createdAt:      j.createdAt,
      uploadedAt:     j.uploadedAt ?? null,
      exam: {
        id:       j.exam.id,
        examCode: j.exam.examCode,
        name:     j.exam.name,
      },
      shift: j.shift
        ? { id: j.shift.id, name: j.shift.name }
        : null,
    }));

  }


}
