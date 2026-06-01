import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';


import { Exam } from '../../database/entities/exam.entity';


import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';


@Module({
  imports: [

  TypeOrmModule.forFeature([
    Exam,
  ]),

  AuthModule,

],


  controllers: [
    ExamsController,
  ],


  providers: [
    ExamsService,
  ],

})
export class ExamsModule {}