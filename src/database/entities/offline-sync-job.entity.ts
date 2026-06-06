import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';


import { Device } from './device.entity';
import { Exam } from './exam.entity';
import { Shift } from './shift.entity';
import { Center } from './center.entity';
import { BiometricCapture } from './biometric-capture.entity';


export enum SyncJobStatus {
  DOWNLOADED = 'downloaded',
  UPLOADED   = 'uploaded',
}


@Entity('offline_sync_jobs')
export class OfflineSyncJob {


  @PrimaryGeneratedColumn('uuid')
  id: string;


  @Index()
  @ManyToOne(() => Device, { nullable: false })
  device: Device;


  @Index()
  @ManyToOne(() => Exam, { nullable: false })
  exam: Exam;


  @ManyToOne(() => Shift, { nullable: true })
  shift: Shift;


  @ManyToOne(() => Center, { nullable: false })
  center: Center;


  @Index()
  @Column({
    type: 'enum',
    enum: SyncJobStatus,
    default: SyncJobStatus.DOWNLOADED,
  })
  status: SyncJobStatus;


  @Column({ type: 'int', default: 0 })
  candidateCount: number;


  @Column({ type: 'timestamp with time zone', nullable: true })
  uploadedAt: Date;


  @Column({ type: 'int', default: 0 })
  uploadedCount: number;


  @Column({ type: 'int', default: 0 })
  conflictCount: number;


  @OneToMany(
    () => BiometricCapture,
    capture => capture.syncJob,
  )
  captures: BiometricCapture[];


  @CreateDateColumn()
  createdAt: Date;


}
