import {
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';


export class HeartbeatDeviceDto {


  @IsUUID()
  deviceId: string;


  @IsString()
  @IsNotEmpty()
  deviceToken: string;


}
