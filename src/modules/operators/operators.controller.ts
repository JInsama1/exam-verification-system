import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';


import { OperatorsService } from './operators.service';

import { CreateOperatorDto } from './dto/create-operator.dto';


import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

import { RolesGuard } from '../../common/guards/roles.guard';

import { Roles } from '../../common/decorators/roles.decorator';

import { Role } from '../../common/enums/role.enum';



@Controller('operators')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
export class OperatorsController {


  constructor(
    private readonly operatorsService:
      OperatorsService,
  ) {}



  @Post()
  @Roles(
  Role.MASTER_ADMIN,
  Role.ADMIN,
  Role.OPERATOR,
)
  create(
    @Body() dto: CreateOperatorDto,
  ) {

    return this.operatorsService.create(
      dto,
    );

  }



  @Get()
  @Roles(
  Role.MASTER_ADMIN,
  Role.ADMIN,
  Role.OPERATOR,
)
  findAll() {

    return this.operatorsService.findAll();

  }

}