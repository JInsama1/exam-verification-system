import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';


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

  AuthModule,

],


  controllers: [
    DevicesController,
  ],


  providers: [
    DevicesService,
  ],

})
export class DevicesModule {}