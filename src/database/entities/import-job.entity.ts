import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';


import {
  Project,
} from './project.entity';


export enum ImportJobStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}


@Entity('import_jobs')
export class ImportJob {


  @PrimaryGeneratedColumn('uuid')
  id: string;


  @ManyToOne(
    () => Project,
    { nullable: false },
  )
  project: Project;


  @Column({
    type: 'enum',
    enum: ImportJobStatus,
    default: ImportJobStatus.QUEUED,
  })
  status: ImportJobStatus;


  @Column()
  filePath: string;


  @Column({
    nullable: true,
    type: 'int',
  })
  totalRows: number;


  @Column({
    default: 0,
    type: 'int',
  })
  processedRows: number;


  @Column({
    default: 0,
    type: 'int',
  })
  createdCount: number;


  @Column({
    default: 0,
    type: 'int',
  })
  skippedCount: number;


  @Column({
    default: 0,
    type: 'int',
  })
  failedCount: number;


  @Column({
    type: 'jsonb',
    nullable: true,
  })
  errors: any;


  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  startedAt: Date;


  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  completedAt: Date;


  @CreateDateColumn()
  createdAt: Date;


}
