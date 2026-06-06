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
  BiometricsService,
} from './biometrics.service';


import {
  BiometricsController,
} from './biometrics.controller';


import {
  BiometricMatcherService,
} from './biometric-matcher.service';


import {
  FingerprintMatcher,
} from './matchers/fingerprint.matcher';


import {
  IrisMatcher,
} from './matchers/iris.matcher';


@Module({

  imports: [

    TypeOrmModule.forFeature([
      PersonIdentity,
      BiometricCapture,
      Candidate,
      FieldOperator,
      Device,
    ]),

    MulterModule.register({
      dest: './uploads',
    }),

  ],


  controllers: [
    BiometricsController,
  ],


  providers: [
    FingerprintMatcher,
    IrisMatcher,
    BiometricMatcherService,
    BiometricsService,
  ],


})
export class BiometricsModule {}
