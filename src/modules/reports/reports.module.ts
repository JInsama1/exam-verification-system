import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';


import { AuthModule } from '../auth/auth.module';


import { Candidate } from '../../database/entities/candidate.entity';
import { Attendance } from '../../database/entities/attendance.entity';
import { Center } from '../../database/entities/center.entity';
import { Device } from '../../database/entities/device.entity';
import { Operator } from '../../database/entities/operator.entity';


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