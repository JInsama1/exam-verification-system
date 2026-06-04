import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';


import {
  InjectRepository,
} from '@nestjs/typeorm';


import {
  Repository,
} from 'typeorm';


import {
  Project,
} from '../../database/entities/project.entity';


import {
  CreateProjectDto,
} from './dto/create-project.dto';


@Injectable()
export class ProjectsService {


  constructor(

    @InjectRepository(Project)
    private projectRepository:
      Repository<Project>,

  ) {}


  create(dto: CreateProjectDto) {

    const project =
      this.projectRepository.create(dto);

    return this.projectRepository.save(
      project,
    );

  }


  findAll() {

    return this.projectRepository.find({

      order: {
        createdAt: 'DESC',
      },

    });

  }


  async findOne(id: string) {

    const project =
      await this.projectRepository.findOne({

        where: {
          id,
        },

      });


    if (!project) {

      throw new NotFoundException(
        'Project not found',
      );

    }


    return project;

  }


}
