import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';


import * as XLSX from 'xlsx';


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


const REQUIRED_COLUMNS = [
  'rollNumber',
  'name',
  'examCode',
  'examName',
  'centerCode',
  'centerName',
  'shiftName',
];


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


    setImmediate(() => {

      this.processJob(saved.id).catch(
        () => {
          // processJob handles its own errors
          // via ImportJob status updates
        },
      );

    });


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


  private async processJob(
    jobId: string,
  ): Promise<void> {


    const job =
      await this.importJobRepository.findOne({

        where: {
          id: jobId,
        },

      });


    if (!job) {
      return;
    }


    await this.importJobRepository.update(
      jobId,
      {
        status: ImportJobStatus.PROCESSING,
        startedAt: new Date(),
      },
    );


    try {


      const workbook =
        XLSX.readFile(job.filePath);


      const sheet =
        workbook.Sheets[
          workbook.SheetNames[0]
        ];


      const rows =
        XLSX.utils.sheet_to_json(
          sheet,
        ) as any[];


      const totalRows = rows.length;


      await this.importJobRepository.update(
        jobId,
        {
          totalRows,
        },
      );


      if (totalRows === 0) {

        await this.importJobRepository.update(
          jobId,
          {
            status: ImportJobStatus.COMPLETED,
            processedRows: 0,
            completedAt: new Date(),
          },
        );

        return;

      }


      const firstRow =
        rows[0] as Record<string, unknown>;


      const missing =
        REQUIRED_COLUMNS.filter(
          col => !(col in firstRow),
        );


      if (missing.length > 0) {

        await this.importJobRepository.update(
          jobId,
          {
            status: ImportJobStatus.FAILED,
            completedAt: new Date(),
            errors: [{
              reason:
                `Missing required columns: ${missing.join(', ')}`,
            }],
          },
        );

        return;

      }


      // Steps 6–7: hierarchy upsert and
      // candidate batch insert go here.


      await this.importJobRepository.update(
        jobId,
        {
          status: ImportJobStatus.COMPLETED,
          processedRows: totalRows,
          completedAt: new Date(),
        },
      );


    } catch (err: any) {


      await this.importJobRepository.update(
        jobId,
        {
          status: ImportJobStatus.FAILED,
          completedAt: new Date(),
          errors: [{
            reason:
              err?.message ??
              'Failed to read Excel file',
          }],
        },
      );


    }


  }


}
