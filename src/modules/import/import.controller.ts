import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';


import {
  FileInterceptor,
} from '@nestjs/platform-express';


import {
  ImportService,
} from './import.service';


import {
  CreateImportJobDto,
} from './dto/create-import-job.dto';


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


@Controller('import-jobs')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles(
  Role.MASTER_ADMIN,
  Role.ADMIN,
)
export class ImportController {


  constructor(

    private readonly importService:
      ImportService,

  ) {}


  @Post()
  @UseInterceptors(
    FileInterceptor('file'),
  )
  create(
    @Body() dto: CreateImportJobDto,
    @UploadedFile() file: Express.Multer.File,
  ) {

    return this.importService.create(
      dto.projectId,
      file,
    );

  }


  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {

    return this.importService.findOne(id);

  }


}
