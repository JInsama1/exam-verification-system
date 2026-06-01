import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';


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


    JwtModule.register({
      secret:
        'exam_verification_super_secret_2026',
    }),

  ],


  controllers: [
    ShiftsController,
  ],


  providers: [
    ShiftsService,
  ],

})
export class ShiftsModule {}