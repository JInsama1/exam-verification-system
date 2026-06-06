import 'reflect-metadata';
import 'dotenv/config';

import { DataSource } from 'typeorm';

import { Attendance } from './entities/attendance.entity';
import { AuditLog } from './entities/audit-log.entity';
import { BiometricCapture } from './entities/biometric-capture.entity';
import { Candidate } from './entities/candidate.entity';
import { Center } from './entities/center.entity';
import { Device } from './entities/device.entity';
import { Exam } from './entities/exam.entity';
import { FieldOperator } from './entities/field-operator.entity';
import { ImportJob } from './entities/import-job.entity';
import { OfflineSyncJob } from './entities/offline-sync-job.entity';
import { Operator } from './entities/operator.entity';
import {
  BiometricDeviceModel,
} from './entities/biometric-device-model.entity';
import {
  BiometricTemplate,
} from './entities/biometric-template.entity';
import {
  BiometricPolicy,
} from './entities/biometric-policy.entity';
import { PersonIdentity } from './entities/person-identity.entity';
import { Project } from './entities/project.entity';
import { Shift } from './entities/shift.entity';
import { User } from './entities/user.entity';


export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  synchronize: false,

  entities: [
    Attendance,
    AuditLog,
    BiometricCapture,
    Candidate,
    Center,
    Device,
    Exam,
    FieldOperator,
    ImportJob,
    OfflineSyncJob,
    Operator,
    PersonIdentity,
    Project,
    Shift,
    User,
    BiometricDeviceModel,
    BiometricTemplate,
    BiometricPolicy,
  ],

  migrations: ['src/database/migrations/**/*.ts'],

  migrationsTableName: 'typeorm_migrations',
});
