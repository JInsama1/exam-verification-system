import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { Center } from '../../database/entities/center.entity';

import { CentersService } from './centers.service';
import { CentersController } from './centers.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Center,
    ]),

    JwtModule.register({
      secret:
        'exam_verification_super_secret_2026',
    }),
  ],

  controllers: [
    CentersController,
  ],

  providers: [
    CentersService,
  ],
})
export class CentersModule {}