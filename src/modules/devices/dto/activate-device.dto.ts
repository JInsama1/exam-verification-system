import {
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';


export class ActivateDeviceDto {


  @IsString()
  @IsNotEmpty()
  deviceCode: string;


  @IsString()
  @IsNotEmpty()
  activationSecret: string;


  @IsUUID()
  fieldOperatorId: string;


}
