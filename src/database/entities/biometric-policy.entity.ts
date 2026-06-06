import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import {
  Project,
} from './project.entity';

import {
  BiometricPosition,
} from '../../common/enums/biometric-modality.enum';


export interface PolicyShape {
  requiredFingerprints:        BiometricPosition[];
  requiredIris:                BiometricPosition[];
  allowExtraCapture:           boolean;
  minimumFingerprintsRequired: number;
  minimumIrisRequired:         number;
}

export const DEFAULT_BIOMETRIC_POLICY: PolicyShape = {
  requiredFingerprints:        [BiometricPosition.RIGHT_THUMB, BiometricPosition.LEFT_THUMB],
  requiredIris:                [BiometricPosition.RIGHT_EYE],
  allowExtraCapture:           true,
  minimumFingerprintsRequired: 1,
  minimumIrisRequired:         1,
};


@Entity('biometric_policies')
export class BiometricPolicy {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(
    () => Project,
    { nullable: false },
  )
  @JoinColumn()
  project: Project;

  @Column({ type: 'jsonb' })
  requiredFingerprints: BiometricPosition[];

  @Column({ type: 'jsonb' })
  requiredIris: BiometricPosition[];

  @Column({ default: true })
  allowExtraCapture: boolean;

  @Column({ default: 1 })
  minimumFingerprintsRequired: number;

  @Column({ default: 1 })
  minimumIrisRequired: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}
