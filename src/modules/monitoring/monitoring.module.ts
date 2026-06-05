import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';


import { AuthModule } from '../auth/auth.module';


import { Candidate } from '../../database/entities/candidate.entity';
import { BiometricCapture } from '../../database/entities/biometric-capture.entity';
import { Center } from '../../database/entities/center.entity';
import { Device } from '../../database/entities/device.entity';
import { FieldOperator } from '../../database/entities/field-operator.entity';


import { MonitoringService } from './monitoring.service';
import { MonitoringController } from './monitoring.controller';


@Module({

  imports: [

    TypeOrmModule.forFeature([
      Candidate,
      BiometricCapture,
      Center,
      Device,
      FieldOperator,
    ]),

    AuthModule,

  ],


  controllers: [
    MonitoringController,
  ],


  providers: [
    MonitoringService,
  ],

})
export class MonitoringModule {}
