import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';


import {
  FileInterceptor,
} from '@nestjs/platform-express';


import {
  BiometricsService,
} from './biometrics.service';


import {
  EnrollBiometricDto,
} from './dto/enroll-biometric.dto';


import {
  VerifyBiometricDto,
} from './dto/verify-biometric.dto';


const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];


const faceUploadConfig = {

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter(
    _req: any,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestException(
          'Only jpeg, png, and webp images are allowed',
        ),
        false,
      );
    }
  },

};


@Controller('biometrics')
export class BiometricsController {


  constructor(

    private readonly biometricsService:
      BiometricsService,

  ) {}


  @Post('enroll')
  @UseInterceptors(FileInterceptor('face', faceUploadConfig))
  enroll(

    @Body()
    dto: EnrollBiometricDto,

    @UploadedFile()
    faceFile: Express.Multer.File | undefined,

  ) {

    return this.biometricsService.enroll(dto, faceFile);

  }


  @Post('verify')
  @UseInterceptors(FileInterceptor('face', faceUploadConfig))
  verify(

    @Body()
    dto: VerifyBiometricDto,

    @UploadedFile()
    faceFile: Express.Multer.File | undefined,

  ) {

    return this.biometricsService.verify(dto, faceFile);

  }


}
