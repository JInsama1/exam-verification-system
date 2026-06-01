import { IsString } from 'class-validator';


export class CreateDeviceDto {


  @IsString()
  deviceCode: string;


  @IsString()
  serialNumber: string;


  @IsString()
  centerId: string;

}