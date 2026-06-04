import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Unique,
} from 'typeorm';


import { Exam } from './exam.entity';


@Entity('shifts')
@Unique([
  'name',
  'exam',
])
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