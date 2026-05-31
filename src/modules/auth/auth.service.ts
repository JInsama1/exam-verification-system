import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user =
      await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const passwordValid = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!passwordValid) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const accessToken =
      await this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

    return {
      accessToken,
    };
  }
}