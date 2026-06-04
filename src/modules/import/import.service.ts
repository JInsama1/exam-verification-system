import {
  Injectable,
  NotImplementedException,
} from '@nestjs/common';


import {
  InjectRepository,
} from '@nestjs/typeorm';


import {
  Repository,
} from 'typeorm';


import {
  ImportJob,
} from '../../database/entities/import-job.entity';


import {
  Project,
} from '../../database/entities/project.entity';


@Injectable()
export class ImportService {


  constructor(

    @InjectRepository(ImportJob)
    private importJobRepository:
      Repository<ImportJob>,

    @InjectRepository(Project)
    private projectRepository:
      Repository<Project>,

  ) {}


  async create(
    projectId: string,
    file: Express.Multer.File,
  ): Promise<ImportJob> {

    throw new NotImplementedException();

  }


  async findOne(
    id: string,
  ): Promise<ImportJob> {

    throw new NotImplementedException();

  }


}
