import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';


import { Exam } from '../../database/entities/exam.entity';


import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';


@Module({
  imports: [

    TypeOrmModule.forFeature([
      Exam,
    ]),


    JwtModule.register({
      secret:
        'exam_verification_super_secret_2026',
    }),

  ],


  controllers: [
    ExamsController,
  ],


  providers: [
    ExamsService,
  ],

})
export class ExamsModule {}