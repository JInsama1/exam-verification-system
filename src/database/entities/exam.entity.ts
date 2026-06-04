import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Unique,
} from 'typeorm';


import {
  Project,
} from './project.entity';


@Entity('exams')
@Unique([
  'examCode',
  'project',
])
export class Exam {


  @PrimaryGeneratedColumn('uuid')
  id: string;


  @Column()
  examCode: string;


  @Column()
  name: string;


  @ManyToOne(
    () => Project,
    { nullable: false },
  )
  project: Project;


  @Column({
    type: 'date',
  })
  startDate: string;


  @Column({
    type: 'date',
  })
  endDate: string;


  @Column({
    default: true,
  })
  active: boolean;


  @CreateDateColumn()
  createdAt: Date;


  @UpdateDateColumn()
  updatedAt: Date;


}
