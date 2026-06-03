import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';


import {
  AuditService,
} from './audit.service';


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




@Controller(
  'audit',
)


@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)


@Roles(
  Role.ADMIN,
  Role.MASTER_ADMIN,
)


export class AuditController {


  constructor(

    private readonly auditService:
      AuditService,

  ) {}




  @Get()

  findAll() {


    return this.auditService.findAll();


  }


}