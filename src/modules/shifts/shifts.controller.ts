import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';


import { ShiftsService } from './shifts.service';

import { CreateShiftDto } from './dto/create-shift.dto';


import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

import { RolesGuard } from '../../common/guards/roles.guard';

import { Roles } from '../../common/decorators/roles.decorator';

import { Role } from '../../common/enums/role.enum';



@Controller('shifts')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
export class ShiftsController {


  constructor(
    private readonly shiftsService:
      ShiftsService,
  ) {}



  @Post()
  @Roles(
    Role.MASTER_ADMIN,
    Role.ADMIN,
  )
  create(
    @Body() dto: CreateShiftDto,
  ) {

    return this.shiftsService.create(
      dto,
    );

  }



  @Get()
  @Roles(
    Role.MASTER_ADMIN,
    Role.ADMIN,
  )
  findAll() {

    return this.shiftsService.findAll();

  }


}