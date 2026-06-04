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
  Center,
} from '../../database/entities/center.entity';


import {
  Project,
} from '../../database/entities/project.entity';


import {
  CreateCenterDto,
} from './dto/create-center.dto';


@Injectable()
export class CentersService {


  constructor(

    @InjectRepository(Center)
    private readonly centerRepository:
      Repository<Center>,

    @InjectRepository(Project)
    private readonly projectRepository:
      Repository<Project>,

  ) {}


  async create(dto: CreateCenterDto) {


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
      await this.centerRepository.findOne({

        where: {
          centerCode: dto.centerCode,
          project: { id: project.id },
        },

      });


    if (existing) {

      throw new ConflictException(
        'Center code already exists in this project',
      );

    }


    const center =
      this.centerRepository.create({
        centerCode: dto.centerCode,
        name: dto.name,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        project,
      });


    return this.centerRepository.save(center);


  }


  findAll() {


    return this.centerRepository.find({

      relations: {
        project: true,
      },

      order: {
        createdAt: 'DESC',
      },

    });


  }


}
