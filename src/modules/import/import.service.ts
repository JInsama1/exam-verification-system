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
  ImportJob,
  ImportJobStatus,
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
  ): Promise<{
    jobId: string;
    status: ImportJobStatus;
  }> {


    const project =
      await this.projectRepository.findOne({

        where: {
          id: projectId,
        },

      });


    if (!project) {

      throw new NotFoundException(
        'Project not found',
      );

    }


    const job =
      this.importJobRepository.create({
        project,
        filePath: file.path,
      });


    const saved =
      await this.importJobRepository.save(
        job,
      );


    return {
      jobId: saved.id,
      status: saved.status,
    };


  }


  async findOne(
    id: string,
  ): Promise<ImportJob> {


    const job =
      await this.importJobRepository.findOne({

        where: {
          id,
        },

      });


    if (!job) {

      throw new NotFoundException(
        'Import job not found',
      );

    }


    return job;


  }


}
