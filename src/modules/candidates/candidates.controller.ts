import {
  Param,
  Query,
  UseInterceptors,
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';


import {
  FileInterceptor,
} from '@nestjs/platform-express';


import {
  CandidatesService,
} from './candidates.service';


import {
  CreateCandidateDto,
} from './dto/create-candidate.dto';


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
  'candidates',
)


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

    @Body()
    dto: CreateCandidateDto,

  ) {


    return this.candidatesService.create(

      dto,

    );


  }









  @Post(
    'import',
  )


  @Roles(
    Role.MASTER_ADMIN,
    Role.ADMIN,
  )


  @UseInterceptors(

    FileInterceptor(
      'file',
    ),

  )


  importExcel(

    @UploadedFile()
    file: Express.Multer.File,

  ) {


    return this.candidatesService.importExcel(

      file.path,

    );


  }









  @Post(
    ':id/photo',
  )


  @Roles(
    Role.MASTER_ADMIN,
    Role.ADMIN,
  )


  @UseInterceptors(

    FileInterceptor(
      'file',
    ),

  )


  uploadPhoto(

    @Param(
      'id',
    )
    id: string,


    @UploadedFile()
    file: Express.Multer.File,

  ) {


    return this.candidatesService.uploadPhoto(

      id,

      file.filename,

    );


  }










  @Get()


  @Roles(
    Role.MASTER_ADMIN,
    Role.ADMIN,
    Role.OPERATOR,
  )


  findAll(

    @Query(
      'search',
    )
    search: string,


    @Query(
      'page',
    )
    page: string,

  ) {


    return this.candidatesService.findAll(

      search,

      Number(page) || 1,

    );


  }


}