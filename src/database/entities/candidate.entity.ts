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
import { Shift } from './shift.entity';
import { Center } from './center.entity';
import { PersonIdentity } from './person-identity.entity';



@Entity('candidates')


@Unique(
  [
    'rollNumber',
    'exam',
  ],
)


export class Candidate {


  @PrimaryGeneratedColumn('uuid')
  id: string;



  @Column()
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


  @ManyToOne(
    () => PersonIdentity,
    personIdentity => personIdentity.candidates,
    { nullable: true },
  )
  personIdentity: PersonIdentity;


  @CreateDateColumn()
  createdAt: Date;



  @UpdateDateColumn()
  updatedAt: Date;


}