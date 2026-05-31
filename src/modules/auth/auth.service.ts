import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async login() {
    return {
      message: 'Login endpoint coming soon',
    };
  }
}