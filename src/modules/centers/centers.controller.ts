import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';


import { CentersService } from './centers.service';


import { CreateCenterDto } from './dto/create-center.dto';


import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';


import { RolesGuard } from '../../common/guards/roles.guard';


import { Roles } from '../../common/decorators/roles.decorator';


import { Role } from '../../common/enums/role.enum';




@Controller(
  'centers',
)


@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)


@Roles(
  Role.MASTER_ADMIN,
  Role.ADMIN,
)


export class CentersController {


  constructor(

    private readonly centersService:
      CentersService,

  ) {}




  @Post()

  create(

    @Body()
    dto: CreateCenterDto,

  ) {


    return this.centersService.create(
      dto,
    );


  }





  @Get()

  findAll() {


    return this.centersService.findAll();


  }


}