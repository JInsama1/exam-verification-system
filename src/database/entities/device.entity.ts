import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';


import { Center } from './center.entity';


import {
  BiometricCapture,
} from './biometric-capture.entity';


@Entity('devices')
export class Device {


  @PrimaryGeneratedColumn('uuid')
  id: string;


  @Column({
    unique: true,
  })
  deviceCode: string;


  @Column()
  serialNumber: string;


  @ManyToOne(() => Center)
  center: Center;


  @Column({
    default: true,
  })
  active: boolean;


  @Column({
    default: false,
  })
  locked: boolean;


  @CreateDateColumn()
  createdAt: Date;


  @UpdateDateColumn()
  updatedAt: Date;


  @OneToMany(
    () => BiometricCapture,
    capture => capture.device,
  )
  captures: BiometricCapture[];

}