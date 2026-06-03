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

import { Center } from './database/entities/center.entity';

import { Operator } from './database/entities/operator.entity';

import { Device } from './database/entities/device.entity';

import { Exam } from './database/entities/exam.entity';

import { Shift } from './database/entities/shift.entity';

import { Candidate } from './database/entities/candidate.entity';

import { Attendance } from './database/entities/attendance.entity';

import { AuditLog } from './database/entities/audit-log.entity';




import { AuthModule } from './modules/auth/auth.module';

import { UsersModule } from './modules/users/users.module';

import { CentersModule } from './modules/centers/centers.module';

import { OperatorsModule } from './modules/operators/operators.module';

import { DevicesModule } from './modules/devices/devices.module';

import { ExamsModule } from './modules/exams/exams.module';

import { ShiftsModule } from './modules/shifts/shifts.module';

import { CandidatesModule } from './modules/candidates/candidates.module';

import { AttendanceModule } from './modules/attendance/attendance.module';

import { ReportsModule } from './modules/reports/reports.module';

import { AuditModule } from './modules/audit/audit.module';





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

        Center,

        Operator,

        Device,

        Exam,

        Shift,

        Candidate,

        Attendance,

        AuditLog,

      ],

    }),






    AuthModule,


    UsersModule,


    CentersModule,


    OperatorsModule,


    DevicesModule,


    ExamsModule,


    ShiftsModule,


    CandidatesModule,


    AttendanceModule,


    ReportsModule,


    AuditModule,


  ],

})


export class AppModule {}