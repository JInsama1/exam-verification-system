import { Module } from '@nestjs/common';

import {
  JwtModule,
} from '@nestjs/jwt';


import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';


import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';


import { UsersModule } from '../users/users.module';



@Module({

  imports: [

    UsersModule,


    ConfigModule,


    JwtModule.registerAsync({

      imports: [
        ConfigModule,
      ],


      inject: [
        ConfigService,
      ],


      useFactory: (
        configService: ConfigService,
      ) => {

        const expiresIn =
          configService.get<string>(
            'JWT_EXPIRES_IN',
            '1d',
          );

        return {

          secret:
            configService.get<string>(
              'JWT_SECRET',
            ),

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          signOptions: { expiresIn: expiresIn as any },

        };

      },

    }),

  ],



  providers: [
    AuthService,
  ],



  controllers: [
    AuthController,
  ],



  exports: [
    JwtModule,
  ],

})
export class AuthModule {}