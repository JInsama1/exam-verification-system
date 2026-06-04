import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';


import {
  Candidate,
} from './candidate.entity';


@Entity('person_identities')
export class PersonIdentity {


  @PrimaryGeneratedColumn('uuid')
  id: string;


  @Column({
    nullable: true,
  })
  primaryPhotoUrl: string;


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


  @OneToMany(
    () => Candidate,
    candidate => candidate.personIdentity,
  )
  candidates: Candidate[];


  @CreateDateColumn()
  createdAt: Date;


  @UpdateDateColumn()
  updatedAt: Date;


}
