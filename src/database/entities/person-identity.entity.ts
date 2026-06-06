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


import {
  BiometricCapture,
} from './biometric-capture.entity';


import {
  BiometricTemplate,
} from './biometric-template.entity';


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


  @OneToMany(
    () => BiometricCapture,
    capture => capture.personIdentity,
  )
  captures: BiometricCapture[];


  @OneToMany(
    () => BiometricTemplate,
    template => template.personIdentity,
  )
  biometricTemplates: BiometricTemplate[];


  @CreateDateColumn()
  createdAt: Date;


  @UpdateDateColumn()
  updatedAt: Date;


}
