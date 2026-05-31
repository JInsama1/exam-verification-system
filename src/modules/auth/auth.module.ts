import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,

    JwtModule.register({
  secret: 'exam_verification_super_secret_2026',
  signOptions: {
    expiresIn: '1d',
  },
}),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}