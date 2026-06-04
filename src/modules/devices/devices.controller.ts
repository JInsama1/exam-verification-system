import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';


import { DevicesService } from './devices.service';

import { CreateDeviceDto } from './dto/create-device.dto';


import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

import { RolesGuard } from '../../common/guards/roles.guard';

import { Roles } from '../../common/decorators/roles.decorator';

import { Role } from '../../common/enums/role.enum';



@Controller('devices')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
export class DevicesController {


  constructor(
    private readonly devicesService:
      DevicesService,
  ) {}



  @Post()
  @Roles(
    Role.MASTER_ADMIN,
    Role.ADMIN,
  )
  create(
    @Body() dto: CreateDeviceDto,
  ) {

    return this.devicesService.create(
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

    return this.devicesService.findAll();

  }


}