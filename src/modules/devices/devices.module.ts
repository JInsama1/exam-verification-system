import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';


import { Device } from '../../database/entities/device.entity';
import { Center } from '../../database/entities/center.entity';


import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';


@Module({
  imports: [

    TypeOrmModule.forFeature([
      Device,
      Center,
    ]),


    JwtModule.register({
      secret:
        'exam_verification_super_secret_2026',
    }),

  ],


  controllers: [
    DevicesController,
  ],


  providers: [
    DevicesService,
  ],

})
export class DevicesModule {}