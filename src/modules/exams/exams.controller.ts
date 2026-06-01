import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';


import { ExamsService } from './exams.service';

import { CreateExamDto } from './dto/create-exam.dto';


import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

import { RolesGuard } from '../../common/guards/roles.guard';

import { Roles } from '../../common/decorators/roles.decorator';

import { Role } from '../../common/enums/role.enum';



@Controller('exams')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
export class ExamsController {


  constructor(
    private readonly examsService:
      ExamsService,
  ) {}



  @Post()
  @Roles(
    Role.MASTER_ADMIN,
    Role.ADMIN,
  )
  create(
    @Body() dto: CreateExamDto,
  ) {

    return this.examsService.create(
      dto,
    );

  }



  @Get()
  @Roles(
    Role.MASTER_ADMIN,
    Role.ADMIN,
  )
  findAll() {

    return this.examsService.findAll();

  }


}