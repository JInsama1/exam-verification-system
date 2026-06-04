import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';


import * as XLSX from 'xlsx';


import {
  InjectRepository,
} from '@nestjs/typeorm';


import {
  In,
  Repository,
} from 'typeorm';


import {
  ImportJob,
  ImportJobStatus,
} from '../../database/entities/import-job.entity';


import {
  Project,
} from '../../database/entities/project.entity';


import {
  Exam,
} from '../../database/entities/exam.entity';


import {
  Center,
} from '../../database/entities/center.entity';


import {
  Shift,
} from '../../database/entities/shift.entity';


import {
  Candidate,
} from '../../database/entities/candidate.entity';


const CHUNK_SIZE = 5000;


type CandidateBatch = {
  rollNumber: string;
  name: string;
  photoUrl: string | null;
  exam: Exam;
  shift: Shift;
  center: Center;
};


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

    @InjectRepository(Exam)
    private examRepository:
      Repository<Exam>,

    @InjectRepository(Center)
    private centerRepository:
      Repository<Center>,

    @InjectRepository(Shift)
    private shiftRepository:
      Repository<Shift>,

    @InjectRepository(Candidate)
    private candidateRepository:
      Repository<Candidate>,

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


    try {


      const job =
        await this.importJobRepository.findOne({

          where: {
            id: jobId,
          },

          relations: {
            project: true,
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


      // ── Parse Excel ───────────────────────

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


      // ── Column validation ─────────────────

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


      // ── Extract unique hierarchy ──────────
      //
      // Single pass through rows.
      // No database queries inside this loop.

      const today =
        new Date().toISOString().split('T')[0];


      const uniqueExams = new Map<
        string,
        {
          examCode: string;
          name: string;
          startDate: string;
          endDate: string;
        }
      >();


      const uniqueCenters = new Map<
        string,
        {
          centerCode: string;
          name: string;
          address: string;
          city: string;
          state: string;
        }
      >();


      const uniqueShifts = new Map<
        string,
        {
          examCode: string;
          shiftName: string;
          startTime: string;
          endTime: string;
        }
      >();


      for (const row of rows) {


        if (
          !row.examCode    ||
          !row.examName    ||
          !row.centerCode  ||
          !row.centerName  ||
          !row.shiftName   ||
          !row.rollNumber  ||
          !row.name
        ) {
          continue;
        }


        if (!uniqueExams.has(row.examCode)) {

          uniqueExams.set(
            row.examCode,
            {
              examCode:  row.examCode,
              name:      row.examName,
              startDate: row.examStartDate || today,
              endDate:   row.examEndDate   || today,
            },
          );

        }


        if (!uniqueCenters.has(row.centerCode)) {

          uniqueCenters.set(
            row.centerCode,
            {
              centerCode: row.centerCode,
              name:       row.centerName,
              address:    row.centerAddress || '',
              city:       row.centerCity    || '',
              state:      row.centerState   || '',
            },
          );

        }


        const shiftKey =
          `${row.examCode}\x00${row.shiftName}`;


        if (!uniqueShifts.has(shiftKey)) {

          uniqueShifts.set(
            shiftKey,
            {
              examCode:  row.examCode,
              shiftName: row.shiftName,
              startTime: row.shiftStartTime || '00:00',
              endTime:   row.shiftEndTime   || '23:59',
            },
          );

        }


      }


      // ── Upsert Exams ──────────────────────

      const existingExams =
        await this.examRepository.find({

          where: {
            project: { id: job.project.id },
          },

        });


      const examsMap = new Map<string, Exam>(
        existingExams.map(
          e => [e.examCode, e],
        ),
      );


      const examsToCreate =
        [...uniqueExams.values()]
          .filter(e => !examsMap.has(e.examCode))
          .map(e =>
            this.examRepository.create({
              examCode:  e.examCode,
              name:      e.name,
              startDate: e.startDate,
              endDate:   e.endDate,
              project:   job.project,
            }),
          );


      if (examsToCreate.length > 0) {

        const created =
          await this.examRepository.save(
            examsToCreate,
          );

        created.forEach(
          e => examsMap.set(e.examCode, e),
        );

      }


      // ── Upsert Centers ────────────────────

      const existingCenters =
        await this.centerRepository.find({

          where: {
            project: { id: job.project.id },
          },

        });


      const centersMap = new Map<string, Center>(
        existingCenters.map(
          c => [c.centerCode, c],
        ),
      );


      const centersToCreate =
        [...uniqueCenters.values()]
          .filter(c => !centersMap.has(c.centerCode))
          .map(c =>
            this.centerRepository.create({
              centerCode: c.centerCode,
              name:       c.name,
              address:    c.address,
              city:       c.city,
              state:      c.state,
              project:    job.project,
            }),
          );


      if (centersToCreate.length > 0) {

        const created =
          await this.centerRepository.save(
            centersToCreate,
          );

        created.forEach(
          c => centersMap.set(c.centerCode, c),
        );

      }


      // ── Upsert Shifts ─────────────────────

      const examIds =
        [...examsMap.values()].map(e => e.id);


      const existingShifts =
        examIds.length > 0
          ? await this.shiftRepository.find({

              where: {
                exam: { id: In(examIds) },
              },

              relations: {
                exam: true,
              },

            })
          : [];


      const shiftsMap = new Map<string, Shift>(
        existingShifts.map(
          s => [`${s.exam.examCode}\x00${s.name}`, s],
        ),
      );


      const newShiftDrafts =
        [...uniqueShifts.entries()]
          .filter(([key]) => !shiftsMap.has(key))
          .map(([, s]) => ({
            draft: s,
            exam:  examsMap.get(s.examCode),
          }))
          .filter(
            (item): item is {
              draft: typeof item.draft;
              exam: Exam;
            } => item.exam !== undefined,
          );


      if (newShiftDrafts.length > 0) {

        const entities =
          newShiftDrafts.map(({ draft, exam }) =>
            this.shiftRepository.create({
              name:      draft.shiftName,
              startTime: draft.startTime,
              endTime:   draft.endTime,
              exam,
            }),
          );


        const created =
          await this.shiftRepository.save(
            entities,
          );


        created.forEach((shift, i) => {

          const { draft } = newShiftDrafts[i];

          shiftsMap.set(
            `${draft.examCode}\x00${draft.shiftName}`,
            shift,
          );

        });

      }


      // ── Load existing candidate keys ──────
      //
      // One query to pre-build a duplicate Set.
      // All checks during the row loop are O(1).

      const existingKeys = new Set<string>();


      if (examIds.length > 0) {

        const existing =
          await this.candidateRepository
            .createQueryBuilder('c')
            .innerJoin('c.exam', 'exam')
            .where(
              'exam.id IN (:...examIds)',
              { examIds },
            )
            .select('c.rollNumber', 'rollNumber')
            .addSelect('exam.id', 'examId')
            .getRawMany<{
              rollNumber: string;
              examId: string;
            }>();

        existing.forEach(r =>
          existingKeys.add(
            `${r.rollNumber}|${r.examId}`,
          ),
        );

      }


      // ── Candidate batch insert ────────────
      //
      // No database queries inside this loop.
      // Rows are accumulated into chunks of
      // CHUNK_SIZE and bulk-inserted together.

      let createdCount = 0;
      let skippedCount = 0;
      let failedCount  = 0;

      const chunk: CandidateBatch[] = [];


      for (const row of rows) {


        if (
          !row.rollNumber  ||
          !row.name        ||
          !row.examCode    ||
          !row.examName    ||
          !row.centerCode  ||
          !row.centerName  ||
          !row.shiftName
        ) {
          failedCount++;
          continue;
        }


        const exam   = examsMap.get(row.examCode);
        const center = centersMap.get(row.centerCode);
        const shift  = shiftsMap.get(
          `${row.examCode}\x00${row.shiftName}`,
        );


        if (!exam || !center || !shift) {
          failedCount++;
          continue;
        }


        const key =
          `${row.rollNumber}|${exam.id}`;


        if (existingKeys.has(key)) {
          skippedCount++;
          continue;
        }


        existingKeys.add(key);


        chunk.push({
          rollNumber: row.rollNumber,
          name:       row.name,
          photoUrl:   row.photoUrl || null,
          exam,
          shift,
          center,
        });


        if (chunk.length >= CHUNK_SIZE) {

          await this.insertCandidateChunk(chunk);

          createdCount += chunk.length;
          chunk.length = 0;

          await this.importJobRepository.update(
            jobId,
            {
              processedRows:
                createdCount +
                skippedCount +
                failedCount,
              createdCount,
              skippedCount,
              failedCount,
            },
          );

        }


      }


      if (chunk.length > 0) {

        await this.insertCandidateChunk(chunk);

        createdCount += chunk.length;

      }


      // ── Mark completed ────────────────────

      await this.importJobRepository.update(
        jobId,
        {
          status:       ImportJobStatus.COMPLETED,
          processedRows: totalRows,
          createdCount,
          skippedCount,
          failedCount,
          completedAt:  new Date(),
        },
      );


    } catch (err: any) {


      try {

        await this.importJobRepository.update(
          jobId,
          {
            status: ImportJobStatus.FAILED,
            completedAt: new Date(),
            errors: [{
              reason:
                err?.message ??
                'Failed to process import',
            }],
          },
        );

      } catch {
        // Database unavailable — cannot persist failure state.
      }


    }


  }


  private async insertCandidateChunk(
    chunk: CandidateBatch[],
  ): Promise<void> {

    await this.candidateRepository
      .createQueryBuilder()
      .insert()
      .into(Candidate)
      .values(
        chunk.map(c => ({
          rollNumber: c.rollNumber,
          name:       c.name,
          photoUrl:   c.photoUrl ?? undefined,
          exam:       { id: c.exam.id },
          shift:      { id: c.shift.id },
          center:     { id: c.center.id },
        })),
      )
      .execute();

  }


}
