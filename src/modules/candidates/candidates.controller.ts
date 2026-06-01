import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';


import { CandidatesService } from './candidates.service';

import { CreateCandidateDto } from './dto/create-candidate.dto';


import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

import { RolesGuard } from '../../common/guards/roles.guard';

import { Roles } from '../../common/decorators/roles.decorator';

import { Role } from '../../common/enums/role.enum';



@Controller('candidates')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
export class CandidatesController {


  constructor(
    private readonly candidatesService:
      CandidatesService,
  ) {}



  @Post()
  @Roles(
    Role.MASTER_ADMIN,
    Role.ADMIN,
  )
  create(
    @Body() dto: CreateCandidateDto,
  ) {

    return this.candidatesService.create(
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

    return this.candidatesService.findAll();

  }


}