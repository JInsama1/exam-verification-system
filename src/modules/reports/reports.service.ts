import * as XLSX from 'xlsx';


import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';


import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


import { Candidate } from '../../database/entities/candidate.entity';
import { Attendance } from '../../database/entities/attendance.entity';
import { Center } from '../../database/entities/center.entity';
import { Device } from '../../database/entities/device.entity';
import { Operator } from '../../database/entities/operator.entity';
import {
  BiometricCapture,
  BiometricCaptureType,
} from '../../database/entities/biometric-capture.entity';
import { AuditLog } from '../../database/entities/audit-log.entity';


import { BIOMETRIC_MATCH_THRESHOLD } from '../../common/constants/biometric.constants';
import { CandidateReportQueryDto } from './dto/candidate-report-query.dto';


@Injectable()
export class ReportsService {


  constructor(

    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,

    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,

    @InjectRepository(Center)
    private centerRepository: Repository<Center>,

    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,

    @InjectRepository(Operator)
    private operatorRepository: Repository<Operator>,

    @InjectRepository(BiometricCapture)
    private captureRepository: Repository<BiometricCapture>,

    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,

  ) {}


  // ── existing ────────────────────────────────────────────────────────────────

  async dashboard() {

    const totalCandidates = await this.candidateRepository.count();
    const verified        = await this.attendanceRepository.count();
    const centers         = await this.centerRepository.count();
    const devices         = await this.deviceRepository.count();
    const operators       = await this.operatorRepository.count();

    return {
      totalCandidates,
      verified,
      pending: totalCandidates - verified,
      centers,
      devices,
      operators,
    };

  }


  async exportAttendance() {

    const attendance = await this.attendanceRepository.find({
      relations: {
        candidate: {
          exam: true,
          center: true,
        },
        operator: true,
        device: true,
      },
    });

    const rows = attendance.map(item => ({
      rollNumber:  item.candidate.rollNumber,
      candidate:   item.candidate.name,
      exam:        item.candidate.exam.name,
      center:      item.candidate.center.name,
      operator:    item.operator.employeeCode,
      device:      item.device.deviceCode,
      verified:    item.verified,
      verifiedAt:  item.verifiedAt
        ? item.verifiedAt.toLocaleString('en-IN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
          })
        : '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook  = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  }


  // ── Phase 6 ─────────────────────────────────────────────────────────────────

  async candidateReport(query: CandidateReportQueryDto) {

    const { projectId, examId, centerId, shiftId } = query;

    const qb = this.candidateRepository
      .createQueryBuilder('c')
      .innerJoinAndSelect('c.exam', 'exam')
      .innerJoin('exam.project', 'proj')
      .leftJoinAndSelect('c.center', 'center')
      .leftJoinAndSelect('c.shift', 'shift')
      .where('proj.id = :projectId', { projectId });

    if (examId)   qb.andWhere('exam.id = :examId',     { examId });
    if (centerId) qb.andWhere('center.id = :centerId', { centerId });
    if (shiftId)  qb.andWhere('shift.id = :shiftId',  { shiftId });

    const candidates = await qb.getMany();

    if (candidates.length === 0) return [];

    const ids = candidates.map(c => c.id);

    const latestCaptures = await this.captureRepository
      .createQueryBuilder('cap')
      .innerJoinAndSelect('cap.candidate', 'cand')
      .where('cap.type = :type', { type: BiometricCaptureType.VERIFICATION })
      .andWhere('cand.id IN (:...ids)', { ids })
      .andWhere(
        `cap."createdAt" = (
          SELECT MAX(c2."createdAt") FROM biometric_captures c2
          WHERE c2."candidateId" = cap."candidateId" AND c2.type = :type
        )`,
      )
      .getMany();

    const captureMap = new Map(latestCaptures.map(cap => [cap.candidate.id, cap]));

    return candidates.map(candidate => {
      const cap = captureMap.get(candidate.id);

      let verificationStatus: 'verified' | 'failed' | 'pending' | 'overridden';
      if (!cap) {
        verificationStatus = 'pending';
      } else if (cap.isManualOverride) {
        verificationStatus = 'overridden';
      } else if (cap.matchScore !== null && cap.matchScore >= BIOMETRIC_MATCH_THRESHOLD) {
        verificationStatus = 'verified';
      } else {
        verificationStatus = 'failed';
      }

      return {
        id:          candidate.id,
        rollNumber:  candidate.rollNumber,
        name:        candidate.name,
        photoUrl:    candidate.photoUrl,
        exam: candidate.exam
          ? { id: candidate.exam.id, code: candidate.exam.examCode, name: candidate.exam.name }
          : null,
        center: candidate.center
          ? { id: candidate.center.id, code: candidate.center.centerCode, name: candidate.center.name }
          : null,
        shift: candidate.shift
          ? { id: candidate.shift.id, name: candidate.shift.name }
          : null,
        verificationStatus,
        latestCapture: cap
          ? {
              id:                 cap.id,
              matchScore:         cap.matchScore,
              isManualOverride:   cap.isManualOverride,
              overrideReason:     cap.overrideReason,
              overriddenByUserId: cap.overriddenByUserId,
              capturedAt:         cap.capturedAt,
              createdAt:          cap.createdAt,
            }
          : null,
      };
    });

  }


  async centerReport(projectId: string) {

    const [
      centers,
      candidateRows,
      verifiedRows,
      failedRows,
    ] = await Promise.all([

      this.centerRepository.find({
        where: { active: true, project: { id: projectId } },
      }),

      this.candidateRepository
        .createQueryBuilder('c')
        .innerJoin('c.exam', 'exam')
        .innerJoin('exam.project', 'proj')
        .innerJoin('c.center', 'cen')
        .select('cen.id', 'centerId')
        .addSelect('COUNT(c.id)', 'total')
        .where('proj.id = :projectId', { projectId })
        .groupBy('cen.id')
        .getRawMany<{ centerId: string; total: string }>(),

      this.captureRepository
        .createQueryBuilder('cap')
        .innerJoin('cap.candidate', 'c')
        .innerJoin('c.exam', 'exam')
        .innerJoin('exam.project', 'proj')
        .innerJoin('c.center', 'cen')
        .select('cen.id', 'centerId')
        .addSelect('COUNT(cap.id)', 'total')
        .where('cap.type = :type', { type: BiometricCaptureType.VERIFICATION })
        .andWhere(
          '(cap.matchScore >= :threshold OR cap.isManualOverride = true)',
          { threshold: BIOMETRIC_MATCH_THRESHOLD },
        )
        .andWhere(
          `cap."createdAt" = (
            SELECT MAX(c2."createdAt") FROM biometric_captures c2
            WHERE c2."candidateId" = cap."candidateId" AND c2.type = :type
          )`,
        )
        .andWhere('proj.id = :projectId', { projectId })
        .groupBy('cen.id')
        .getRawMany<{ centerId: string; total: string }>(),

      this.captureRepository
        .createQueryBuilder('cap')
        .innerJoin('cap.candidate', 'c')
        .innerJoin('c.exam', 'exam')
        .innerJoin('exam.project', 'proj')
        .innerJoin('c.center', 'cen')
        .select('cen.id', 'centerId')
        .addSelect('COUNT(cap.id)', 'total')
        .where('cap.type = :type', { type: BiometricCaptureType.VERIFICATION })
        .andWhere(
          `(cap.matchScore IS NULL OR cap.matchScore < :threshold)
            AND cap."isManualOverride" = false`,
          { threshold: BIOMETRIC_MATCH_THRESHOLD },
        )
        .andWhere(
          `cap."createdAt" = (
            SELECT MAX(c2."createdAt") FROM biometric_captures c2
            WHERE c2."candidateId" = cap."candidateId" AND c2.type = :type
          )`,
        )
        .andWhere('proj.id = :projectId', { projectId })
        .groupBy('cen.id')
        .getRawMany<{ centerId: string; total: string }>(),

    ]);

    const toMap = (rows: { centerId: string; total: string }[]) =>
      new Map(rows.map(r => [r.centerId, Number(r.total)]));

    const candidatesMap = toMap(candidateRows);
    const verifiedMap   = toMap(verifiedRows);
    const failedMap     = toMap(failedRows);

    return centers.map(center => {
      const total    = candidatesMap.get(center.id) ?? 0;
      const verified = verifiedMap.get(center.id)   ?? 0;
      const failed   = failedMap.get(center.id)     ?? 0;

      return {
        center: {
          id:         center.id,
          centerCode: center.centerCode,
          name:       center.name,
          city:       center.city,
          state:      center.state,
        },
        totalCandidates: total,
        verified,
        failed,
        pending: total - verified - failed,
      };
    });

  }


  async operatorReport(projectId: string) {

    const rows = await this.captureRepository
      .createQueryBuilder('cap')
      .innerJoin('cap.fieldOperator', 'fo')
      .innerJoin('cap.candidate', 'c')
      .innerJoin('c.exam', 'exam')
      .innerJoin('exam.project', 'proj')
      .where('fo.isActive = :isActive', { isActive: true })
      .andWhere('proj.id = :projectId', { projectId })
      .select('fo.id',   'operatorId')
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
        `SUM(CASE WHEN cap.type = '${BiometricCaptureType.VERIFICATION}'
          AND (cap."matchScore" IS NULL OR cap."matchScore" < ${BIOMETRIC_MATCH_THRESHOLD})
          AND cap."isManualOverride" = false THEN 1 ELSE 0 END)`,
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

    return rows.map(r => {
      const totalV  = Number(r.totalVerifications);
      const failedV = Number(r.failedVerifications);

      return {
        operatorId:          r.operatorId,
        name:                r.name,
        phone:               r.phone,
        totalEnrollments:    Number(r.totalEnrollments),
        totalVerifications:  totalV,
        failedVerifications: failedV,
        successRate:         totalV > 0
          ? Math.round(((totalV - failedV) / totalV) * 100)
          : 0,
        lastActivityAt: r.lastActivityAt,
      };
    });

  }


  async exportCandidateReport(query: CandidateReportQueryDto): Promise<Buffer> {

    const data = await this.candidateReport(query);

    const rows = data.map(r => ({
      rollNumber:       r.rollNumber,
      name:             r.name,
      exam:             r.exam?.name ?? '',
      center:           r.center?.name ?? '',
      shift:            r.shift?.name ?? '',
      status:           r.verificationStatus,
      matchScore:       r.latestCapture?.matchScore ?? '',
      isManualOverride: r.latestCapture?.isManualOverride ? 'Yes' : 'No',
      overrideReason:   r.latestCapture?.overrideReason ?? '',
      verifiedAt:       r.latestCapture?.createdAt
        ? r.latestCapture.createdAt.toLocaleString('en-IN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
          })
        : '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook  = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Verification Report');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  }


  async manualOverride(
    candidateId: string,
    userId: string,
    reason: string,
  ) {

    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId },
      relations: { personIdentity: true },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    if (!candidate.personIdentity) {
      throw new BadRequestException(
        'Candidate has not been enrolled — cannot override an unenrolled candidate',
      );
    }

    const overrideCapture = this.captureRepository.create({
      type:               BiometricCaptureType.VERIFICATION,
      matchScore:         100,
      isManualOverride:   true,
      overrideReason:     reason,
      overriddenByUserId: userId,
      candidate:          { id: candidateId } as Candidate,
      personIdentity:     { id: candidate.personIdentity.id } as any,
      fieldOperator:      null,
    });

    const saved = await this.captureRepository.save(overrideCapture);

    await this.auditLogRepository.save(
      this.auditLogRepository.create({
        userId,
        action: 'MANUAL_OVERRIDE',
        details: {
          candidateId,
          rollNumber:  candidate.rollNumber,
          captureId:   saved.id,
          reason,
        },
      }),
    );

    return {
      captureId:          saved.id,
      candidateId,
      rollNumber:         candidate.rollNumber,
      overriddenByUserId: userId,
      reason,
      createdAt:          saved.createdAt,
    };

  }


}
