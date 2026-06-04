import { Module } from '@nestjs/common';


import {
  TypeOrmModule,
} from '@nestjs/typeorm';


import {
  AuthModule,
} from '../auth/auth.module';


import {
  Project,
} from '../../database/entities/project.entity';


import {
  ProjectsService,
} from './projects.service';


import {
  ProjectsController,
} from './projects.controller';


@Module({

  imports: [

    TypeOrmModule.forFeature([
      Project,
    ]),

    AuthModule,

  ],


  controllers: [
    ProjectsController,
  ],


  providers: [
    ProjectsService,
  ],


  exports: [
    ProjectsService,
  ],


})
export class ProjectsModule {}
