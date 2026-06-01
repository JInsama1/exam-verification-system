import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';


import { Shift } from '../../database/entities/shift.entity';
import { Exam } from '../../database/entities/exam.entity';


import { ShiftsService } from './shifts.service';
import { ShiftsController } from './shifts.controller';


@Module({
  imports: [

  TypeOrmModule.forFeature([
  Shift,
  Exam,
]),

  AuthModule,

],


  controllers: [
    ShiftsController,
  ],


  providers: [
    ShiftsService,
  ],

})
export class ShiftsModule {}