import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';


import { ReportsService } from './reports.service';


import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

import { RolesGuard } from '../../common/guards/roles.guard';

import { Roles } from '../../common/decorators/roles.decorator';

import { Role } from '../../common/enums/role.enum';



@Controller('reports')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
export class ReportsController {


  constructor(
    private readonly reportsService:
      ReportsService,
  ) {}



  @Get('dashboard')
  @Roles(
    Role.MASTER_ADMIN,
    Role.ADMIN,
  )
  dashboard() {


    return this.reportsService.dashboard();


  }


}