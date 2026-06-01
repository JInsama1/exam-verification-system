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
],
    }),

    AuthModule,

    UsersModule,

    CentersModule,

    OperatorsModule,
  ],
})
export class AppModule {}