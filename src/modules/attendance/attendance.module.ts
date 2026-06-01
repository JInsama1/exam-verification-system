import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';


import { Attendance } from '../../database/entities/attendance.entity';
import { Candidate } from '../../database/entities/candidate.entity';
import { Operator } from '../../database/entities/operator.entity';
import { Device } from '../../database/entities/device.entity';


import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';



@Module({
  imports: [

    TypeOrmModule.forFeature([
      Attendance,
      Candidate,
      Operator,
      Device,
    ]),


    JwtModule.register({
      secret:
        'exam_verification_super_secret_2026',
    }),

  ],


  controllers: [
    AttendanceController,
  ],


  providers: [
    AttendanceService,
  ],

})
export class AttendanceModule {}