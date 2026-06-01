import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';


import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';


import { Candidate } from '../../database/entities/candidate.entity';
import { Exam } from '../../database/entities/exam.entity';
import { Shift } from '../../database/entities/shift.entity';
import { Center } from '../../database/entities/center.entity';


import { CreateCandidateDto } from './dto/create-candidate.dto';



@Injectable()
export class CandidatesService {


  constructor(

    @InjectRepository(Candidate)
    private candidateRepository:
      Repository<Candidate>,


    @InjectRepository(Exam)
    private examRepository:
      Repository<Exam>,


    @InjectRepository(Shift)
    private shiftRepository:
      Repository<Shift>,


    @InjectRepository(Center)
    private centerRepository:
      Repository<Center>,

  ) {}



  async create(dto: CreateCandidateDto) {


    const exam =
      await this.examRepository.findOne({
        where: {
          id: dto.examId,
        },
      });


    const shift =
      await this.shiftRepository.findOne({
        where: {
          id: dto.shiftId,
        },
      });


    const center =
      await this.centerRepository.findOne({
        where: {
          id: dto.centerId,
        },
      });



    if (!exam || !shift || !center) {

      throw new NotFoundException(
        'Invalid exam, shift, or center',
      );

    }



    const candidate =
      this.candidateRepository.create({

        rollNumber:
          dto.rollNumber,


        name:
          dto.name,


        photoUrl:
          dto.photoUrl,


        exam,

        shift,

        center,

      });



    return this.candidateRepository.save(
      candidate,
    );

  }




  findAll() {


    return this.candidateRepository.find({
      relations: {
        exam: true,
        shift: true,
        center: true,
      },
    });


  }


}