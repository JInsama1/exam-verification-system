import {
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';




export class CreateDeviceDto {


  @IsString()
  @IsNotEmpty()
  deviceCode: string;



  @IsString()
  @IsNotEmpty()
  serialNumber: string;



  @IsUUID()
  @IsNotEmpty()
  centerId: string;


}