import {
  IsString,
  IsUUID,
  IsOptional,
} from 'class-validator';


export class DownloadPackageDto {


  @IsUUID()
  deviceId: string;


  @IsString()
  deviceToken: string;


  @IsUUID()
  examId: string;


  @IsUUID()
  @IsOptional()
  shiftId?: string;


}
