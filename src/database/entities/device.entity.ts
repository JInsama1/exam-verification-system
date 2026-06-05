import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';


import { Center } from './center.entity';


import {
  BiometricCapture,
} from './biometric-capture.entity';


import {
  FieldOperator,
} from './field-operator.entity';


export enum DeviceStatus {
  PENDING = 'pending',
  ACTIVE  = 'active',
  BLOCKED = 'blocked',
}


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


  @Index()
  @Column({
    type:    'enum',
    enum:    DeviceStatus,
    default: DeviceStatus.PENDING,
  })
  status: DeviceStatus;


  // Nullable so existing rows without a secret are not broken on migration
  @Column({
    nullable: true,
    select:   false,
  })
  activationSecretHash: string;


  @Column({
    nullable: true,
    select:   false,
  })
  deviceTokenHash: string;


  @Column({
    nullable: true,
  })
  activatedAt: Date;


  @Index()
  @Column({
    nullable: true,
  })
  lastSeenAt: Date;


  @Index()
  @ManyToOne(
    () => FieldOperator,
    { nullable: true },
  )
  activatedBy: FieldOperator;


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
