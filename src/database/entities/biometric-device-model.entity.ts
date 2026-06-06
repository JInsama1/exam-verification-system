import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import {
  BiometricModality,
  TemplateFormat,
} from '../../common/enums/biometric-modality.enum';


@Entity('biometric_device_models')
export class BiometricDeviceModel {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  manufacturer: string;

  @Column()
  model: string;

  @Column({
    type: 'enum',
    enum: BiometricModality,
  })
  modality: BiometricModality;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  supportedTemplateFormats: TemplateFormat[];

  @Column({ nullable: true })
  sdkName: string;

  @Column({ nullable: true })
  sdkVersion: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

}
