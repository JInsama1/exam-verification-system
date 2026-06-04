import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';


import {
  PersonIdentity,
} from './person-identity.entity';


import {
  Candidate,
} from './candidate.entity';


import {
  Operator,
} from './operator.entity';


import {
  Device,
} from './device.entity';


export enum BiometricCaptureType {
  ENROLLMENT    = 'enrollment',
  VERIFICATION  = 'verification',
}


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


  @ManyToOne(
    () => PersonIdentity,
    personIdentity => personIdentity.captures,
    { nullable: true },
  )
  personIdentity: PersonIdentity;


  @ManyToOne(
    () => Candidate,
    candidate => candidate.captures,
    { nullable: false },
  )
  candidate: Candidate;


  @ManyToOne(
    () => Operator,
    operator => operator.captures,
    { nullable: false },
  )
  operator: Operator;


  @ManyToOne(
    () => Device,
    device => device.captures,
    { nullable: true },
  )
  device: Device;


  @CreateDateColumn()
  createdAt: Date;


}
