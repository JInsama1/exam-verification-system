import { Module } from '@nestjs/common';


import {
  TypeOrmModule,
} from '@nestjs/typeorm';


import {
  MulterModule,
} from '@nestjs/platform-express';


import {
  AuthModule,
} from '../auth/auth.module';


import {
  ImportJob,
} from '../../database/entities/import-job.entity';


import {
  Project,
} from '../../database/entities/project.entity';


import {
  Exam,
} from '../../database/entities/exam.entity';


import {
  Center,
} from '../../database/entities/center.entity';


import {
  Shift,
} from '../../database/entities/shift.entity';


import {
  ImportService,
} from './import.service';


import {
  ImportController,
} from './import.controller';


@Module({

  imports: [

    TypeOrmModule.forFeature([
      ImportJob,
      Project,
      Exam,
      Center,
      Shift,
    ]),

    MulterModule.register({
      dest: './imports',
    }),

    AuthModule,

  ],


  controllers: [
    ImportController,
  ],


  providers: [
    ImportService,
  ],


})
export class ImportModule {}
