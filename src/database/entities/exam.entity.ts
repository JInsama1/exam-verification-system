import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';


@Entity('exams')
export class Exam {


  @PrimaryGeneratedColumn('uuid')
  id: string;


  @Column({
    unique: true,
  })
  examCode: string;


  @Column()
  name: string;


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