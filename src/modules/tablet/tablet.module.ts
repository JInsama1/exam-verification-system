import { Module } from '@nestjs/common';


import { TypeOrmModule } from '@nestjs/typeorm';


import {
  Device,
} from '../../database/entities/device.entity';


import {
  Candidate,
} from '../../database/entities/candidate.entity';


import {
  BiometricCapture,
} from '../../database/entities/biometric-capture.entity';


import { TabletService } from './tablet.service';

import { TabletController } from './tablet.controller';


@Module({

  imports: [
    TypeOrmModule.forFeature([
      Device,
      Candidate,
      BiometricCapture,
    ]),
  ],


  controllers: [
    TabletController,
  ],


  providers: [
    TabletService,
  ],

})
export class TabletModule {}
