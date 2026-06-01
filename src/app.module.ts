import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Center } from './database/entities/center.entity';
import { databaseConfig } from './config/database.config';
import { User } from './database/entities/user.entity';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CentersModule } from './modules/centers/centers.module';
import { Operator } from './database/entities/operator.entity';
import { OperatorsModule } from './modules/operators/operators.module';
import { DevicesModule } from './modules/devices/devices.module';
import { Device } from './database/entities/device.entity';
import { ExamsModule } from './modules/exams/exams.module';
import { Exam } from './database/entities/exam.entity';
import { ShiftsModule } from './modules/shifts/shifts.module';
import { Shift } from './database/entities/shift.entity';
import { CandidatesModule } from './modules/candidates/candidates.module';
import { Candidate } from './database/entities/candidate.entity';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { Attendance } from './database/entities/attendance.entity';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
  ],
})
export class AppModule {}