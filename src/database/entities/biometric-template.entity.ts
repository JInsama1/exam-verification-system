import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import {
  BiometricModality,
  BiometricPosition,
  TemplateFormat,
} from '../../common/enums/biometric-modality.enum';

import {
  PersonIdentity,
} from './person-identity.entity';

import {
  BiometricDeviceModel,
} from './biometric-device-model.entity';


@Index('idx_bt_identity_modality', ['personIdentity', 'modality'])
@Index('idx_bt_modality_position', ['modality', 'position'])
@Entity('biometric_templates')
export class BiometricTemplate {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => PersonIdentity,
    personIdentity => personIdentity.biometricTemplates,
    { nullable: false, onDelete: 'CASCADE' },
  )
  personIdentity: PersonIdentity;

  @Column({
    type: 'enum',
    enum: BiometricModality,
  })
  modality: BiometricModality;

  @Column({
    type: 'enum',
    enum: BiometricPosition,
    nullable: true,
  })
  position: BiometricPosition | null;

  @Index()
  @Column({
    type: 'enum',
    enum: TemplateFormat,
  })
  templateFormat: TemplateFormat;

  @Column({ type: 'text' })
  templateData: string;

  @Column({
    type: 'float',
    nullable: true,
  })
  qualityScore: number | null;

  @Index()
  @ManyToOne(
    () => BiometricDeviceModel,
    { nullable: true, eager: false },
  )
  capturedDeviceModel: BiometricDeviceModel | null;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

}
