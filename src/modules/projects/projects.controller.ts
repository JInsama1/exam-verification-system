import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';


import {
  ProjectsService,
} from './projects.service';


import {
  CreateProjectDto,
} from './dto/create-project.dto';


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


@Controller('projects')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles(
  Role.MASTER_ADMIN,
  Role.ADMIN,
)
export class ProjectsController {


  constructor(

    private readonly projectsService:
      ProjectsService,

  ) {}


  @Post()
  create(
    @Body() dto: CreateProjectDto,
  ) {

    return this.projectsService.create(dto);

  }


  @Get()
  findAll() {

    return this.projectsService.findAll();

  }


  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {

    return this.projectsService.findOne(id);

  }


}
