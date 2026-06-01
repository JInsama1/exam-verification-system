import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';


import { Center } from './center.entity';


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

}