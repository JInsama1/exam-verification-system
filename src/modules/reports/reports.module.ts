import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';


import { Candidate } from '../../database/entities/candidate.entity';
import { Attendance } from '../../database/entities/attendance.entity';
import { Center } from '../../database/entities/center.entity';
import { Device } from '../../database/entities/device.entity';
import { Operator } from '../../database/entities/operator.entity';
import { BiometricCapture } from '../../database/entities/biometric-capture.entity';
import { AuditLog } from '../../database/entities/audit-log.entity';


import { AuthModule } from '../auth/auth.module';


import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';


@Module({

  imports: [

    TypeOrmModule.forFeature([
      Candidate,
      Attendance,
      Center,
      Device,
      Operator,
      BiometricCapture,
      AuditLog,
    ]),

    AuthModule,

  ],

  controllers: [
    ReportsController,
  ],

  providers: [
    ReportsService,
  ],

})
export class ReportsModule {}
