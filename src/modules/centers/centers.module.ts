import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';


import { Center } from '../../database/entities/center.entity';

import { CentersService } from './centers.service';
import { CentersController } from './centers.controller';

@Module({
  imports: [
  TypeOrmModule.forFeature([
    Center,
  ]),

  AuthModule,
],

  controllers: [
    CentersController,
  ],

  providers: [
    CentersService,
  ],
})
export class CentersModule {}