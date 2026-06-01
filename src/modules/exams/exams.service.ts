import { Injectable } from '@nestjs/common';


import { InjectRepository } from '@nestjs/typeorm';


import { Repository } from 'typeorm';


import { Exam } from '../../database/entities/exam.entity';


import { CreateExamDto } from './dto/create-exam.dto';



@Injectable()
export class ExamsService {


  constructor(

    @InjectRepository(Exam)
    private examRepository:
      Repository<Exam>,

  ) {}



  create(dto: CreateExamDto) {


    const exam =
      this.examRepository.create(
        dto,
      );


    return this.examRepository.save(
      exam,
    );

  }




  findAll() {


    return this.examRepository.find();


  }


}