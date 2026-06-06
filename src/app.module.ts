import { Module } from '@nestjs/common';

import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { ConfigModule, ConfigService } from '@nestjs/config';

import {
  ThrottlerModule,
  ThrottlerGuard,
} from '@nestjs/throttler';

import { TypeOrmModule } from '@nestjs/typeorm';


import {
  ServeStaticModule,
} from '@nestjs/serve-static';


import {
  join,
} from 'path';



import { getDatabaseConfig } from './config/database.config';

import { envValidationSchema } from './config/env.validation';


import { User } from './database/entities/user.entity';

import { Project } from './database/entities/project.entity';

import { Center } from './database/entities/center.entity';

import { Operator } from './database/entities/operator.entity';

import { Device } from './database/entities/device.entity';

import { Exam } from './database/entities/exam.entity';

import { Shift } from './database/entities/shift.entity';

import { Candidate } from './database/entities/candidate.entity';

import { Attendance } from './database/entities/attendance.entity';

import { AuditLog } from './database/entities/audit-log.entity';

import { ImportJob } from './database/entities/import-job.entity';

import { PersonIdentity } from './database/entities/person-identity.entity';

import { BiometricCapture } from './database/entities/biometric-capture.entity';

import { FieldOperator } from './database/entities/field-operator.entity';

import { OfflineSyncJob } from './database/entities/offline-sync-job.entity';




import { AuthModule } from './modules/auth/auth.module';

import { UsersModule } from './modules/users/users.module';

import { ProjectsModule } from './modules/projects/projects.module';

import { CentersModule } from './modules/centers/centers.module';

import { OperatorsModule } from './modules/operators/operators.module';

import { DevicesModule } from './modules/devices/devices.module';

import { ExamsModule } from './modules/exams/exams.module';

import { ShiftsModule } from './modules/shifts/shifts.module';

import { CandidatesModule } from './modules/candidates/candidates.module';

import { AttendanceModule } from './modules/attendance/attendance.module';

import { ReportsModule } from './modules/reports/reports.module';

import { AuditModule } from './modules/audit/audit.module';

import { ImportModule } from './modules/import/import.module';

import { FieldOperatorsModule } from './modules/field-operators/field-operators.module';

import { BiometricsModule } from './modules/biometrics/biometrics.module';

import { TabletModule } from './modules/tablet/tablet.module';

import { MonitoringModule } from './modules/monitoring/monitoring.module';

import { SyncModule } from './modules/sync/sync.module';

import { HealthModule } from './modules/health/health.module';

import { AuditInterceptor } from './common/interceptors/audit.interceptor';




@Module({

  imports: [


    ConfigModule.forRoot({

      isGlobal: true,

      validationSchema: envValidationSchema,

    }),


    ThrottlerModule.forRootAsync({

      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: (configService: ConfigService) => [
        {
          name: 'default',
          ttl: configService.get<number>('THROTTLE_TTL', 60) * 1000,
          limit: configService.get<number>('THROTTLE_LIMIT', 120),
        },
      ],

    }),




    ServeStaticModule.forRoot({

      rootPath:

        join(

          __dirname,

          '..',

          'uploads',

        ),


      serveRoot:

        '/uploads',

    }),




    TypeOrmModule.forRootAsync({

      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({

        ...getDatabaseConfig(configService),


        entities: [

        User,

        Project,

        Center,

        Operator,

        Device,

        Exam,

        Shift,

        Candidate,

        Attendance,

        AuditLog,

        ImportJob,

        PersonIdentity,

        BiometricCapture,

        FieldOperator,

        OfflineSyncJob,

      ],

      }),

    }),




    AuthModule,


    UsersModule,


    ProjectsModule,


    CentersModule,


    OperatorsModule,


    DevicesModule,


    ExamsModule,


    ShiftsModule,


    CandidatesModule,


    AttendanceModule,


    ReportsModule,


    AuditModule,


    ImportModule,


    FieldOperatorsModule,


    BiometricsModule,


    TabletModule,


    MonitoringModule,


    SyncModule,


    HealthModule,


  ],


  providers: [

    { provide: APP_GUARD, useClass: ThrottlerGuard },

    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },

  ],

})


export class AppModule {}
