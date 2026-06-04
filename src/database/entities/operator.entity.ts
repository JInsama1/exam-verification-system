import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';


import { User } from './user.entity';
import { Center } from './center.entity';
import { BiometricCapture } from './biometric-capture.entity';


@Entity('operators')
export class Operator {


  @PrimaryGeneratedColumn('uuid')
  id: string;


  @Column({
    unique: true,
  })
  employeeCode: string;


  @OneToOne(() => User)
  @JoinColumn()
  user: User;


  @ManyToOne(() => Center)
  center: Center;


  @Column({
    default: true,
  })
  active: boolean;


  @CreateDateColumn()
  createdAt: Date;


  @UpdateDateColumn()
  updatedAt: Date;


  @OneToMany(
    () => BiometricCapture,
    capture => capture.operator,
  )
  captures: BiometricCapture[];

}