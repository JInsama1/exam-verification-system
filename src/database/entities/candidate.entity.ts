import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';


import { Exam } from './exam.entity';
import { Shift } from './shift.entity';
import { Center } from './center.entity';



@Entity('candidates')
export class Candidate {


  @PrimaryGeneratedColumn('uuid')
  id: string;


  @Column({
    unique: true,
  })
  rollNumber: string;


  @Column()
  name: string;


  @Column({
    nullable: true,
  })
  photoUrl: string;


  @ManyToOne(() => Exam)
  exam: Exam;


  @ManyToOne(() => Shift)
  shift: Shift;


  @ManyToOne(() => Center)
  center: Center;


  @Column({
    default: false,
  })
  verified: boolean;


  @CreateDateColumn()
  createdAt: Date;


  @UpdateDateColumn()
  updatedAt: Date;

}