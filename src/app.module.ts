import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';

import { TypeOrmModule } from '@nestjs/typeorm';


import {
  ServeStaticModule,
} from '@nestjs/serve-static';


import {
  join,
} from 'path';



import { databaseConfig } from './config/database.config';


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




@Module({

  imports: [


    ConfigModule.forRoot({

      isGlobal: true,

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




    TypeOrmModule.forRoot({

      ...databaseConfig,


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

      ],

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


  ],

})


export class AppModule {}
