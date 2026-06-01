import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';


import { AuthModule } from '../auth/auth.module';


import { Candidate } from '../../database/entities/candidate.entity';
import { Exam } from '../../database/entities/exam.entity';
import { Shift } from '../../database/entities/shift.entity';
import { Center } from '../../database/entities/center.entity';


import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';



@Module({

  imports: [

    TypeOrmModule.forFeature([
      Candidate,
      Exam,
      Shift,
      Center,
    ]),


    AuthModule,

  ],


  controllers: [
    CandidatesController,
  ],


  providers: [
    CandidatesService,
  ],

})
export class CandidatesModule {}