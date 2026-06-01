import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';


import { Exam } from './exam.entity';


@Entity('shifts')
export class Shift {


  @PrimaryGeneratedColumn('uuid')
  id: string;


  @Column()
  name: string;


  @Column({
    type: 'time',
  })
  startTime: string;


  @Column({
    type: 'time',
  })
  endTime: string;


  @ManyToOne(() => Exam)
  exam: Exam;


  @Column({
    default: true,
  })
  active: boolean;


  @CreateDateColumn()
  createdAt: Date;


  @UpdateDateColumn()
  updatedAt: Date;

}