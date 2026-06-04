import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';


import {
  InjectRepository,
} from '@nestjs/typeorm';


import {
  Repository,
} from 'typeorm';


import {
  Exam,
} from '../../database/entities/exam.entity';


import {
  Project,
} from '../../database/entities/project.entity';


import {
  CreateExamDto,
} from './dto/create-exam.dto';


@Injectable()
export class ExamsService {


  constructor(

    @InjectRepository(Exam)
    private examRepository:
      Repository<Exam>,

    @InjectRepository(Project)
    private projectRepository:
      Repository<Project>,

  ) {}


  async create(dto: CreateExamDto) {


    const project =
      await this.projectRepository.findOne({

        where: {
          id: dto.projectId,
        },

      });


    if (!project) {

      throw new NotFoundException(
        'Project not found',
      );

    }


    const existing =
      await this.examRepository.findOne({

        where: {
          examCode: dto.examCode,
          project: { id: project.id },
        },

      });


    if (existing) {

      throw new ConflictException(
        'Exam code already exists in this project',
      );

    }


    const {
      projectId,
      ...examData
    } = dto;


    const exam =
      this.examRepository.create({
        ...examData,
        project,
      });


    return this.examRepository.save(exam);


  }


  findAll() {


    return this.examRepository.find({

      relations: {
        project: true,
      },

      order: {
        createdAt: 'DESC',
      },

    });


  }


}
