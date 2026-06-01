import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';


import { AuthModule } from '../auth/auth.module';


import { Operator } from '../../database/entities/operator.entity';
import { User } from '../../database/entities/user.entity';
import { Center } from '../../database/entities/center.entity';


import { OperatorsService } from './operators.service';
import { OperatorsController } from './operators.controller';



@Module({

  imports: [

    TypeOrmModule.forFeature([
      Operator,
      User,
      Center,
    ]),


    AuthModule,

  ],


  controllers: [
    OperatorsController,
  ],


  providers: [
    OperatorsService,
  ],

})
export class OperatorsModule {}