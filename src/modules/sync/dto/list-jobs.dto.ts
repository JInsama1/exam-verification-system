import {
  IsString,
  IsUUID,
} from 'class-validator';


export class ListJobsDto {


  @IsUUID()
  deviceId: string;


  @IsString()
  deviceToken: string;


}
