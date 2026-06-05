import { Module } from '@nestjs/common';


import {
  TypeOrmModule,
} from '@nestjs/typeorm';


import {
  MulterModule,
} from '@nestjs/platform-express';


import {
  FieldOperator,
} from '../../database/entities/field-operator.entity';


import {
  Device,
} from '../../database/entities/device.entity';


import {
  BiometricCapture,
} from '../../database/entities/biometric-capture.entity';


import {
  FieldOperatorsService,
} from './field-operators.service';


import {
  FieldOperatorsController,
} from './field-operators.controller';


@Module({

  imports: [

    TypeOrmModule.forFeature([
      FieldOperator,
      Device,
      BiometricCapture,
    ]),

    MulterModule.register({
      dest: './uploads',
    }),

  ],


  controllers: [
    FieldOperatorsController,
  ],


  providers: [
    FieldOperatorsService,
  ],


})
export class FieldOperatorsModule {}
