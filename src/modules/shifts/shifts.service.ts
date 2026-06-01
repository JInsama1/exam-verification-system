import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';


import { InjectRepository } from '@nestjs/typeorm';


import { Repository } from 'typeorm';


import { Shift } from '../../database/entities/shift.entity';
import { Exam } from '../../database/entities/exam.entity';


import { CreateShiftDto } from './dto/create-shift.dto';



@Injectable()
export class ShiftsService {


  constructor(

    @InjectRepository(Shift)
    private shiftRepository:
      Repository<Shift>,


    @InjectRepository(Exam)
    private examRepository:
      Repository<Exam>,

  ) {}



  async create(dto: CreateShiftDto) {


    const exam =
      await this.examRepository.findOne({
        where: {
          id: dto.examId,
        },
      });


    if (!exam) {
      throw new NotFoundException(
        'Exam not found',
      );
    }



    const shift =
      this.shiftRepository.create({

        name: dto.name,

        startTime: dto.startTime,

        endTime: dto.endTime,

        exam,

      });



    return this.shiftRepository.save(
      shift,
    );

  }




  findAll() {


    return this.shiftRepository.find({
      relations: {
        exam: true,
      },
    });


  }


}