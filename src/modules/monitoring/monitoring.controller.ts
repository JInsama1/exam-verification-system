import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';


import {
  MonitoringService,
} from './monitoring.service';


import {
  JwtAuthGuard,
} from '../../common/guards/jwt-auth.guard';


import {
  RolesGuard,
} from '../../common/guards/roles.guard';


import {
  Roles,
} from '../../common/decorators/roles.decorator';


import {
  Role,
} from '../../common/enums/role.enum';


@Controller('monitoring')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MonitoringController {


  constructor(
    private readonly monitoringService: MonitoringService,
  ) {}


  @Get('overview')
  @Roles(Role.MASTER_ADMIN, Role.ADMIN)
  overview() {
    return this.monitoringService.overview();
  }


  @Get('centers')
  @Roles(Role.MASTER_ADMIN, Role.ADMIN)
  centerStats() {
    return this.monitoringService.centerStats();
  }


  @Get('operators')
  @Roles(Role.MASTER_ADMIN, Role.ADMIN)
  operatorStats() {
    return this.monitoringService.operatorStats();
  }


  @Get('suspicious')
  @Roles(Role.MASTER_ADMIN, Role.ADMIN)
  suspicious() {
    return this.monitoringService.suspicious();
  }


}
