import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';


import { InjectRepository } from '@nestjs/typeorm';


import { Repository } from 'typeorm';


import {
  createHash,
  timingSafeEqual,
} from 'crypto';


import {
  Device,
  DeviceStatus,
} from '../../database/entities/device.entity';


import {
  Candidate,
} from '../../database/entities/candidate.entity';


import {
  BiometricCapture,
  BiometricCaptureType,
} from '../../database/entities/biometric-capture.entity';


import { DashboardDto } from './dto/dashboard.dto';
import { CandidateSearchDto } from './dto/candidate-search.dto';


import { BIOMETRIC_MATCH_THRESHOLD } from '../../common/constants/biometric.constants';


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
export class TabletService {


  constructor(

    @InjectRepository(Device)
    private deviceRepo: Repository<Device>,

    @InjectRepository(Candidate)
    private candidateRepo: Repository<Candidate>,

    @InjectRepository(BiometricCapture)
    private captureRepo: Repository<BiometricCapture>,

  ) {}


  private async validateDevice(
    deviceId:    string,
    deviceToken: string,
  ): Promise<Device> {

    const device = await this.deviceRepo
      .createQueryBuilder('device')
      .addSelect('device.deviceTokenHash')
      .leftJoinAndSelect('device.center',      'center')
      .leftJoinAndSelect('device.activatedBy', 'activatedBy')
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
      !secureCompare(
        hashToken(deviceToken),
        device.deviceTokenHash,
      )
    ) {
      throw new UnauthorizedException('Invalid device token');
    }

    return device;

  }


  async dashboard(dto: DashboardDto) {

    const device   = await this.validateDevice(dto.deviceId, dto.deviceToken);
    const centerId = device.center.id;
    const today    = new Date().toISOString().split('T')[0];


    // Distinct (exam, shift) pairs at this center today — no candidate rows loaded
    const rawShifts = await this.candidateRepo
      .createQueryBuilder('c')
      .select('exam.id',        'examId')
      .addSelect('exam.name',      'examName')
      .addSelect('exam.examCode',  'examCode')
      .addSelect('exam.startDate', 'startDate')
      .addSelect('exam.endDate',   'endDate')
      .addSelect('shift.id',       'shiftId')
      .addSelect('shift.name',     'shiftName')
      .addSelect('shift.startTime','startTime')
      .addSelect('shift.endTime',  'endTime')
      .innerJoin('c.exam',   'exam')
      .innerJoin('c.shift',  'shift')
      .innerJoin('c.center', 'center')
      .where('center.id = :centerId',       { centerId })
      .andWhere('exam.startDate <= :today', { today })
      .andWhere('exam.endDate   >= :today', { today })
      .andWhere('exam.active = true')
      .distinct(true)
      .getRawMany<{
        examId:    string;
        examName:  string;
        examCode:  string;
        startDate: string;
        endDate:   string;
        shiftId:   string;
        shiftName: string;
        startTime: string;
        endTime:   string;
      }>();

    const todayShifts = rawShifts.map(r => ({
      exam: {
        id:        r.examId,
        name:      r.examName,
        examCode:  r.examCode,
        startDate: r.startDate,
        endDate:   r.endDate,
      },
      shift: {
        id:        r.shiftId,
        name:      r.shiftName,
        startTime: r.startTime,
        endTime:   r.endTime,
      },
    }));


    // Run enrolled and verification capture queries in parallel
    const [enrolledCount, captureRows] = await Promise.all([

      // Candidates at this center with a biometric enrollment
      this.candidateRepo
        .createQueryBuilder('c')
        .innerJoin('c.center', 'center')
        .where('center.id = :centerId', { centerId })
        .andWhere('c.personIdentity IS NOT NULL')
        .getCount(),

      // All VERIFICATION captures for candidates at this center, latest first
      this.captureRepo
        .createQueryBuilder('cap')
        .select('c.id',          'candidateId')
        .addSelect('cap.matchScore', 'matchScore')
        .innerJoin('cap.candidate', 'c')
        .innerJoin('c.center',      'center')
        .where('center.id = :centerId', { centerId })
        .andWhere('cap.type = :type',   { type: BiometricCaptureType.VERIFICATION })
        .orderBy('cap.createdAt', 'DESC')
        .getRawMany<{ candidateId: string; matchScore: number | null }>(),

    ]);


    // Keep only the latest capture per candidate, then count pass/fail
    const latestScore = new Map<string, number | null>();
    for (const row of captureRows) {
      if (!latestScore.has(row.candidateId)) {
        latestScore.set(row.candidateId, row.matchScore ?? null);
      }
    }

    const scores   = [...latestScore.values()];
    const verified = scores.filter(s => s != null && s >= BIOMETRIC_MATCH_THRESHOLD).length;
    const failed   = scores.filter(s => s == null || s  < BIOMETRIC_MATCH_THRESHOLD).length;


    return {
      operator: {
        id:    device.activatedBy?.id    ?? null,
        name:  device.activatedBy?.name  ?? null,
        phone: device.activatedBy?.phone ?? null,
      },
      device: {
        id:           device.id,
        deviceCode:   device.deviceCode,
        serialNumber: device.serialNumber,
        status:       device.status,
        activatedAt:  device.activatedAt,
        lastSeenAt:   device.lastSeenAt,
      },
      center:     device.center,
      todayShifts,
      counts: {
        enrolled: enrolledCount,
        verified,
        failed,
      },
    };

  }


  async candidateSearch(dto: CandidateSearchDto) {

    const device   = await this.validateDevice(dto.deviceId, dto.deviceToken);
    const centerId = device.center.id;

    const candidate = await this.candidateRepo.findOne({
      where: {
        rollNumber: dto.rollNumber,
        exam:       { id: dto.examId },
        center:     { id: centerId },
      },
      relations: {
        exam:           true,
        shift:          true,
        center:         true,
        personIdentity: true,
      },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    // Latest VERIFICATION capture is the source of truth for verification status
    const lastVerification = await this.captureRepo.findOne({
      where: {
        candidate: { id: candidate.id },
        type:      BiometricCaptureType.VERIFICATION,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    const captureVerified =
      lastVerification != null &&
      lastVerification.matchScore != null &&
      lastVerification.matchScore >= BIOMETRIC_MATCH_THRESHOLD;


    return {
      candidate: {
        id:         candidate.id,
        rollNumber: candidate.rollNumber,
        name:       candidate.name,
        photoUrl:   candidate.photoUrl,
        exam:       candidate.exam,
        shift:      candidate.shift,
        center:     candidate.center,
      },
      enrollmentStatus:   candidate.personIdentity != null,
      verificationStatus: {
        verified:    captureVerified,
        lastCapture: lastVerification
          ? {
              id:         lastVerification.id,
              matchScore: lastVerification.matchScore,
              createdAt:  lastVerification.createdAt,
            }
          : null,
      },
    };

  }


}
