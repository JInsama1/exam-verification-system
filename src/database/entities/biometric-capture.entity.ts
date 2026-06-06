import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';


import {
  PersonIdentity,
} from './person-identity.entity';


import {
  Candidate,
} from './candidate.entity';


import {
  FieldOperator,
} from './field-operator.entity';


import {
  Device,
} from './device.entity';


import {
  OfflineSyncJob,
} from './offline-sync-job.entity';


export enum BiometricCaptureType {
  ENROLLMENT    = 'enrollment',
  VERIFICATION  = 'verification',
}


@Index(['fieldOperator', 'type', 'createdAt'])
@Index(['candidate', 'type', 'createdAt'])
@Index(['type', 'matchScore', 'createdAt'])
@Entity('biometric_captures')
export class BiometricCapture {


  @PrimaryGeneratedColumn('uuid')
  id: string;


  @Column({
    type: 'enum',
    enum: BiometricCaptureType,
  })
  type: BiometricCaptureType;


  @Column({
    nullable: true,
  })
  faceUrl: string;


  @Column({
    type: 'text',
    nullable: true,
  })
  fingerprintTemplate: string;


  @Column({
    type: 'text',
    nullable: true,
  })
  irisTemplate: string;


  @Column({
    type: 'float',
    nullable: true,
  })
  matchScore: number;


  @Column({
    default: false,
  })
  isManualOverride: boolean;


  @Column({
    nullable: true,
  })
  overrideReason: string;


  @Index()
  @ManyToOne(
    () => PersonIdentity,
    personIdentity => personIdentity.captures,
    { nullable: false },
  )
  personIdentity: PersonIdentity;


  @Index()
  @ManyToOne(
    () => Candidate,
    candidate => candidate.captures,
    { nullable: false },
  )
  candidate: Candidate;


  @Index()
  @ManyToOne(
    () => FieldOperator,
    fieldOperator => fieldOperator.captures,
    { nullable: false },
  )
  fieldOperator: FieldOperator;


  @ManyToOne(
    () => Device,
    device => device.captures,
    { nullable: true },
  )
  device: Device;


  // Set only for captures uploaded from offline sync; null means captured online
  @Index()
  @Column({ type: 'timestamp with time zone', nullable: true })
  capturedAt: Date;


  @Index()
  @ManyToOne(
    () => OfflineSyncJob,
    syncJob => syncJob.captures,
    { nullable: true },
  )
  syncJob: OfflineSyncJob;


  @Index()
  @CreateDateColumn()
  createdAt: Date;


}
