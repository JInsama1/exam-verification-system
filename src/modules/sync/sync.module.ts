import { Module } from '@nestjs/common';


import { TypeOrmModule } from '@nestjs/typeorm';


import { Device } from '../../database/entities/device.entity';
import { Exam } from '../../database/entities/exam.entity';
import { Shift } from '../../database/entities/shift.entity';
import { Candidate } from '../../database/entities/candidate.entity';
import { FieldOperator } from '../../database/entities/field-operator.entity';
import { BiometricCapture } from '../../database/entities/biometric-capture.entity';
import { OfflineSyncJob } from '../../database/entities/offline-sync-job.entity';
import { BiometricPolicy } from '../../database/entities/biometric-policy.entity';


import { BiometricMatcherModule } from '../biometrics/biometric-matcher.module';


import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';


@Module({

  imports: [
    TypeOrmModule.forFeature([
      Device,
      Exam,
      Shift,
      Candidate,
      FieldOperator,
      BiometricCapture,
      OfflineSyncJob,
      BiometricPolicy,
    ]),
    BiometricMatcherModule,
  ],

  controllers: [SyncController],

  providers: [SyncService],

})
export class SyncModule {}
