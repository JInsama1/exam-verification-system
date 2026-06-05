import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';


import {
  FileFieldsInterceptor,
} from '@nestjs/platform-express';


import {
  FieldOperatorsService,
} from './field-operators.service';


import {
  RegisterFieldOperatorDto,
} from './dto/register-field-operator.dto';


@Controller('field-operators')
export class FieldOperatorsController {


  constructor(

    private readonly fieldOperatorsService:
      FieldOperatorsService,

  ) {}


  @Post('register')
  @UseInterceptors(

    FileFieldsInterceptor([

      {
        name:     'selfie',
        maxCount: 1,
      },

      {
        name:     'idProof',
        maxCount: 1,
      },

    ]),

  )
  register(

    @Body()
    dto: RegisterFieldOperatorDto,

    @UploadedFiles()
    files: {
      selfie?:   Express.Multer.File[];
      idProof?:  Express.Multer.File[];
    },

  ) {

    return this.fieldOperatorsService.register(
      dto,
      files.selfie?.[0],
      files.idProof?.[0],
    );

  }


}
