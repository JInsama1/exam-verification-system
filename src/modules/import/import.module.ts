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
