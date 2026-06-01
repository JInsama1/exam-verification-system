import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

import { Role } from '../../common/enums/role.enum';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
  ) {
    return this.authService.login(
      loginDto.email,
      loginDto.password,
    );
  }


  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(
    @CurrentUser() user: any,
  ) {
    return user;
  }


  @Get('master-test')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(Role.MASTER_ADMIN)
  masterTest() {
    return {
      message:
        'Master admin access granted',
    };
  }
}