import {
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';


export class DashboardDto {


  @IsUUID()
  deviceId: string;


  @IsString()
  @IsNotEmpty()
  deviceToken: string;


}
