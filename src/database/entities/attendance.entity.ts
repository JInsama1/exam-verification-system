import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';


import { Candidate } from './candidate.entity';
import { Operator } from './operator.entity';
import { Device } from './device.entity';


@Entity('attendance')
export class Attendance {


  @PrimaryGeneratedColumn('uuid')
  id: string;


  @ManyToOne(() => Candidate)
  candidate: Candidate;


  @ManyToOne(() => Operator)
  operator: Operator;


  @ManyToOne(() => Device)
  device: Device;


  @Column({
    default: true,
  })
  verified: boolean;


  @Column({
    nullable: true,
  })
  remarks: string;


  @CreateDateColumn()
  verifiedAt: Date;

}