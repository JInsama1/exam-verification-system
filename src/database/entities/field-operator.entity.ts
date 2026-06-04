import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';


import {
  BiometricCapture,
} from './biometric-capture.entity';


export enum IdProofType {
  AADHAAR = 'aadhaar',
  PAN     = 'pan',
  OTHER   = 'other',
}


@Entity('field_operators')
export class FieldOperator {


  @PrimaryGeneratedColumn('uuid')
  id: string;


  @Column()
  name: string;


  @Column({
    unique: true,
  })
  phone: string;


  @Column({
    default: false,
  })
  phoneVerified: boolean;


  @Column({
    nullable: true,
  })
  selfieUrl: string;


  @Column({
    type: 'enum',
    enum: IdProofType,
  })
  idProofType: IdProofType;


  @Column({
    nullable: true,
  })
  idProofUrl: string;


  @Column({
    default: true,
  })
  isActive: boolean;


  @OneToMany(
    () => BiometricCapture,
    capture => capture.fieldOperator,
  )
  captures: BiometricCapture[];


  @CreateDateColumn()
  createdAt: Date;


  @UpdateDateColumn()
  updatedAt: Date;


}
