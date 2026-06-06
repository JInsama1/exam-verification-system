import { Module } from '@nestjs/common';


import {
  TypeOrmModule,
} from '@nestjs/typeorm';


import {
  MulterModule,
} from '@nestjs/platform-express';


import {
  PersonIdentity,
} from '../../database/entities/person-identity.entity';


import {
  BiometricCapture,
} from '../../database/entities/biometric-capture.entity';


import {
  Candidate,
} from '../../database/entities/candidate.entity';


import {
  FieldOperator,
} from '../../database/entities/field-operator.entity';


import {
  Device,
} from '../../database/entities/device.entity';

import {
  BiometricDeviceModel,
} from '../../database/entities/biometric-device-model.entity';

import {
  BiometricTemplate,
} from '../../database/entities/biometric-template.entity';

import {
  BiometricPolicy,
} from '../../database/entities/biometric-policy.entity';


import {
  BiometricsService,
} from './biometrics.service';

import {
  BiometricPolicyService,
} from './services/biometric-policy.service';


import {
  BiometricsController,
} from './biometrics.controller';


import {
  BiometricMatcherModule,
} from './biometric-matcher.module';

import {
  AuditModule,
} from '../audit/audit.module';


import {
  MantraAdapter,
} from './devices/adapters/mantra.adapter';

import {
  MorphoAdapter,
} from './devices/adapters/morpho.adapter';

import {
  StartekAdapter,
} from './devices/adapters/startek.adapter';

import {
  IrisAdapter,
} from './devices/adapters/iris.adapter';


@Module({

  imports: [

    TypeOrmModule.forFeature([
      PersonIdentity,
      BiometricCapture,
      Candidate,
      FieldOperator,
      Device,
      BiometricDeviceModel,
      BiometricTemplate,
      BiometricPolicy,
    ]),

    MulterModule.register({
      dest: './uploads',
    }),

    BiometricMatcherModule,

    AuditModule,

  ],


  controllers: [
    BiometricsController,
  ],


  providers: [
    BiometricsService,
    BiometricPolicyService,
    MantraAdapter,
    MorphoAdapter,
    StartekAdapter,
    IrisAdapter,
  ],

  exports: [
    BiometricPolicyService,
  ],


})
export class BiometricsModule {}
