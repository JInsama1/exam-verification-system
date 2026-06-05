import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';


import { Device } from '../../database/entities/device.entity';
import { Center } from '../../database/entities/center.entity';
import {
  FieldOperator,
} from '../../database/entities/field-operator.entity';


import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import {
  DeviceTabletController,
} from './device-tablet.controller';


@Module({
  imports: [

  TypeOrmModule.forFeature([
    Device,
    Center,
    FieldOperator,
  ]),

  AuthModule,

],


  controllers: [
    DevicesController,
    DeviceTabletController,
  ],


  providers: [
    DevicesService,
  ],

})
export class DevicesModule {}
