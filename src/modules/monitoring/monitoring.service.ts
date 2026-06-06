import {
  Injectable,
} from '@nestjs/common';


import {
  InjectRepository,
} from '@nestjs/typeorm';


import {
  Repository,
} from 'typeorm';


import {
  Candidate,
} from '../../database/entities/candidate.entity';


import {
  BiometricCapture,
  BiometricCaptureType,
} from '../../database/entities/biometric-capture.entity';


import {
  Center,
} from '../../database/entities/center.entity';


import {
  Device,
  DeviceStatus,
} from '../../database/entities/device.entity';


import {
  FieldOperator,
} from '../../database/entities/field-operator.entity';


import { BIOMETRIC_MATCH_THRESHOLD } from '../../common/constants/biometric.constants';
const DEVICE_ANOMALY_MINUTES = 60;
const REPEATED_FAILURE_MIN   = 3;
const HIGH_FAILURE_RATE      = 0.5;
const MIN_VERIFICATIONS_RATE = 5;


@Injectable()
export class MonitoringService {


  constructor(

    @InjectRepository(Candidate)
    private candidateRepo: Repository<Candidate>,

    @InjectRepository(BiometricCapture)
    private captureRepo: Repository<BiometricCapture>,

    @InjectRepository(Center)
    private centerRepo: Repository<Center>,

    @InjectRepository(Device)
    private deviceRepo: Repository<Device>,

    @InjectRepository(FieldOperator)
    private fieldOperatorRepo: Repository<FieldOperator>,

  ) {}


  async overview() {

    const [
      totalCandidates,
      enrolledCount,
      verifiedCount,
      failedCount,
      activeDevices,
      activeOperators,
    ] = await Promise.all([

      // All candidates in the system
      this.candidateRepo.count(),

      // Candidates with a completed biometric enrollment
      this.candidateRepo
        .createQueryBuilder('c')
        .where('c.personIdentity IS NOT NULL')
        .getCount(),

      // Distinct candidates whose LATEST VERIFICATION capture passed threshold
      // Correlated MAX subquery — one row per candidate, avoids full in-memory dedup
      this.captureRepo
        .createQueryBuilder('cap')
        .where('cap.type = :type',           { type: BiometricCaptureType.VERIFICATION })
        .andWhere('cap.matchScore >= :threshold', { threshold: BIOMETRIC_MATCH_THRESHOLD })
        .andWhere(
          `cap."createdAt" = (
            SELECT MAX(c2."createdAt")
            FROM biometric_captures c2
            WHERE c2."candidateId" = cap."candidateId"
              AND c2.type = :type
          )`,
        )
        .getCount(),

      // Distinct candidates whose LATEST VERIFICATION capture failed threshold
      this.captureRepo
        .createQueryBuilder('cap')
        .where('cap.type = :type', { type: BiometricCaptureType.VERIFICATION })
        .andWhere(
          '(cap.matchScore IS NULL OR cap.matchScore < :threshold)',
          { threshold: BIOMETRIC_MATCH_THRESHOLD },
        )
        .andWhere(
          `cap."createdAt" = (
            SELECT MAX(c2."createdAt")
            FROM biometric_captures c2
            WHERE c2."candidateId" = cap."candidateId"
              AND c2.type = :type
          )`,
        )
        .getCount(),

      // Devices currently in ACTIVE status
      this.deviceRepo.count({
        where: { status: DeviceStatus.ACTIVE },
      }),

      // Field operators with active accounts
      this.fieldOperatorRepo.count({
        where: { isActive: true },
      }),

    ]);


    return {
      totalCandidates,
      enrolledCount,
      verifiedCount,
      failedCount,
      activeDevices,
      activeOperators,
    };

  }


  async centerStats() {

    // All GROUP BY queries run in parallel — one round-trip each
    const [
      centers,
      candidateRows,
      enrollmentRows,
      verificationRows,
      failureRows,
      deviceRows,
    ] = await Promise.all([

      this.centerRepo.find({ where: { active: true } }),

      // Candidates per center
      this.candidateRepo
        .createQueryBuilder('c')
        .innerJoin('c.center', 'cen')
        .select('cen.id', 'centerId')
        .addSelect('COUNT(c.id)', 'total')
        .groupBy('cen.id')
        .getRawMany<{ centerId: string; total: string }>(),

      // Enrolled candidates per center
      this.candidateRepo
        .createQueryBuilder('c')
        .innerJoin('c.center', 'cen')
        .select('cen.id', 'centerId')
        .addSelect('COUNT(c.id)', 'total')
        .where('c.personIdentity IS NOT NULL')
        .groupBy('cen.id')
        .getRawMany<{ centerId: string; total: string }>(),

      // Candidates per center whose LATEST VERIFICATION capture passed threshold
      this.captureRepo
        .createQueryBuilder('cap')
        .innerJoin('cap.candidate', 'c')
        .innerJoin('c.center', 'cen')
        .select('cen.id', 'centerId')
        .addSelect('COUNT(cap.id)', 'total')
        .where('cap.type = :type',               { type: BiometricCaptureType.VERIFICATION })
        .andWhere('cap.matchScore >= :threshold', { threshold: BIOMETRIC_MATCH_THRESHOLD })
        .andWhere(
          `cap."createdAt" = (SELECT MAX(c2."createdAt") FROM biometric_captures c2 WHERE c2."candidateId" = cap."candidateId" AND c2.type = :type)`,
        )
        .groupBy('cen.id')
        .getRawMany<{ centerId: string; total: string }>(),

      // Candidates per center whose LATEST VERIFICATION capture failed threshold
      this.captureRepo
        .createQueryBuilder('cap')
        .innerJoin('cap.candidate', 'c')
        .innerJoin('c.center', 'cen')
        .select('cen.id', 'centerId')
        .addSelect('COUNT(cap.id)', 'total')
        .where('cap.type = :type', { type: BiometricCaptureType.VERIFICATION })
        .andWhere(
          '(cap.matchScore IS NULL OR cap.matchScore < :threshold)',
          { threshold: BIOMETRIC_MATCH_THRESHOLD },
        )
        .andWhere(
          `cap."createdAt" = (SELECT MAX(c2."createdAt") FROM biometric_captures c2 WHERE c2."candidateId" = cap."candidateId" AND c2.type = :type)`,
        )
        .groupBy('cen.id')
        .getRawMany<{ centerId: string; total: string }>(),

      // Active devices per center
      this.deviceRepo
        .createQueryBuilder('d')
        .innerJoin('d.center', 'cen')
        .select('cen.id', 'centerId')
        .addSelect('COUNT(d.id)', 'total')
        .where('d.status = :status', { status: DeviceStatus.ACTIVE })
        .groupBy('cen.id')
        .getRawMany<{ centerId: string; total: string }>(),

    ]);


    const toMap = (
      rows: { centerId: string; total: string }[],
    ) => new Map(rows.map(r => [r.centerId, Number(r.total)]));

    const candidatesMap    = toMap(candidateRows);
    const enrollmentsMap   = toMap(enrollmentRows);
    const verificationsMap = toMap(verificationRows);
    const failuresMap      = toMap(failureRows);
    const devicesMap       = toMap(deviceRows);

    return centers.map(center => ({
      center: {
        id:         center.id,
        centerCode: center.centerCode,
        name:       center.name,
        city:       center.city,
        state:      center.state,
      },
      candidates:    candidatesMap.get(center.id)    ?? 0,
      enrollments:   enrollmentsMap.get(center.id)   ?? 0,
      verifications: verificationsMap.get(center.id) ?? 0,
      failures:      failuresMap.get(center.id)      ?? 0,
      activeDevices: devicesMap.get(center.id)       ?? 0,
    }));

  }


  async operatorStats() {

    // LEFT JOIN from operators — zero-capture operators included with zero counts
    const rows = await this.fieldOperatorRepo
      .createQueryBuilder('fo')
      .leftJoin('fo.captures', 'cap')
      .where('fo.isActive = :isActive', { isActive: true })
      .select('fo.id',    'operatorId')
      .addSelect('fo.name',  'name')
      .addSelect('fo.phone', 'phone')
      .addSelect(
        `SUM(CASE WHEN cap.type = '${BiometricCaptureType.ENROLLMENT}' THEN 1 ELSE 0 END)`,
        'totalEnrollments',
      )
      .addSelect(
        `SUM(CASE WHEN cap.type = '${BiometricCaptureType.VERIFICATION}' THEN 1 ELSE 0 END)`,
        'totalVerifications',
      )
      .addSelect(
        `SUM(CASE WHEN cap.type = '${BiometricCaptureType.VERIFICATION}' AND (cap."matchScore" IS NULL OR cap."matchScore" < ${BIOMETRIC_MATCH_THRESHOLD}) THEN 1 ELSE 0 END)`,
        'failedVerifications',
      )
      .addSelect('MAX(cap."createdAt")', 'lastActivityAt')
      .groupBy('fo.id')
      .addGroupBy('fo.name')
      .addGroupBy('fo.phone')
      .orderBy('MAX(cap."createdAt")', 'DESC')
      .getRawMany<{
        operatorId:          string;
        name:                string;
        phone:               string;
        totalEnrollments:    string;
        totalVerifications:  string;
        failedVerifications: string;
        lastActivityAt:      Date | null;
      }>();


    return rows.map(r => ({
      operatorId:          r.operatorId,
      name:                r.name,
      phone:               r.phone,
      totalEnrollments:    Number(r.totalEnrollments),
      totalVerifications:  Number(r.totalVerifications),
      failedVerifications: Number(r.failedVerifications),
      lastActivityAt:      r.lastActivityAt,
    }));

  }


  async suspicious() {

    const anomalyThreshold = new Date(
      Date.now() - DEVICE_ANOMALY_MINUTES * 60 * 1000,
    );


    const [
      repeatedFailureRows,
      operatorFailureRows,
      dormantDevices,
    ] = await Promise.all([

      // Candidates with REPEATED_FAILURE_MIN+ failed verification attempts
      this.captureRepo
        .createQueryBuilder('cap')
        .innerJoin('cap.candidate', 'c')
        .select('c.id',         'candidateId')
        .addSelect('c.rollNumber', 'rollNumber')
        .addSelect('c.name',       'candidateName')
        .addSelect('COUNT(cap.id)', 'failedAttempts')
        .where('cap.type = :type', { type: BiometricCaptureType.VERIFICATION })
        .andWhere(
          '(cap.matchScore IS NULL OR cap.matchScore < :threshold)',
          { threshold: BIOMETRIC_MATCH_THRESHOLD },
        )
        .groupBy('c.id')
        .addGroupBy('c.rollNumber')
        .addGroupBy('c.name')
        .having('COUNT(cap.id) >= :minAttempts', { minAttempts: REPEATED_FAILURE_MIN })
        .orderBy('COUNT(cap.id)', 'DESC')
        .limit(50)
        .getRawMany<{
          candidateId:    string;
          rollNumber:     string;
          candidateName:  string;
          failedAttempts: string;
        }>(),


      // Operators with MIN_VERIFICATIONS_RATE+ verifications — filtered for rate in JS
      this.captureRepo
        .createQueryBuilder('cap')
        .innerJoin('cap.fieldOperator', 'fo')
        .select('fo.id',    'operatorId')
        .addSelect('fo.name',  'operatorName')
        .addSelect('fo.phone', 'operatorPhone')
        .addSelect('COUNT(cap.id)', 'totalVerifications')
        .addSelect(
          `SUM(CASE WHEN cap."matchScore" IS NULL OR cap."matchScore" < ${BIOMETRIC_MATCH_THRESHOLD} THEN 1 ELSE 0 END)`,
          'failedVerifications',
        )
        .where('cap.type = :type', { type: BiometricCaptureType.VERIFICATION })
        .groupBy('fo.id')
        .addGroupBy('fo.name')
        .addGroupBy('fo.phone')
        .having('COUNT(cap.id) >= :minVerifications', { minVerifications: MIN_VERIFICATIONS_RATE })
        .getRawMany<{
          operatorId:          string;
          operatorName:        string;
          operatorPhone:       string;
          totalVerifications:  string;
          failedVerifications: string;
        }>(),


      // ACTIVE devices past the grace window that have stopped reporting heartbeats
      this.deviceRepo
        .createQueryBuilder('d')
        .leftJoinAndSelect('d.center',      'center')
        .leftJoinAndSelect('d.activatedBy', 'activatedBy')
        .where('d.status = :status', { status: DeviceStatus.ACTIVE })
        .andWhere('d.activatedAt < :threshold', { threshold: anomalyThreshold })
        .andWhere(
          '(d.lastSeenAt IS NULL OR d.lastSeenAt < :threshold)',
          { threshold: anomalyThreshold },
        )
        .getMany(),

    ]);


    // Apply rate filter in JS — avoids pushing complex arithmetic into HAVING
    const highFailureOperators = operatorFailureRows
      .filter(r =>
        Number(r.failedVerifications) / Number(r.totalVerifications) > HIGH_FAILURE_RATE,
      )
      .map(r => ({
        operatorId:          r.operatorId,
        operatorName:        r.operatorName,
        operatorPhone:       r.operatorPhone,
        totalVerifications:  Number(r.totalVerifications),
        failedVerifications: Number(r.failedVerifications),
        failureRate:         Math.round(
          (Number(r.failedVerifications) / Number(r.totalVerifications)) * 100,
        ),
      }));


    return {
      repeatedFailures: repeatedFailureRows.map(r => ({
        candidateId:    r.candidateId,
        rollNumber:     r.rollNumber,
        candidateName:  r.candidateName,
        failedAttempts: Number(r.failedAttempts),
      })),
      highFailureOperators,
      dormantDevices: dormantDevices.map(d => ({
        id:           d.id,
        deviceCode:   d.deviceCode,
        serialNumber: d.serialNumber,
        status:       d.status,
        lastSeenAt:   d.lastSeenAt,
        activatedAt:  d.activatedAt,
        center:       d.center,
        activatedBy:  d.activatedBy
          ? {
              id:    d.activatedBy.id,
              name:  d.activatedBy.name,
              phone: d.activatedBy.phone,
            }
          : null,
      })),
    };

  }


}
