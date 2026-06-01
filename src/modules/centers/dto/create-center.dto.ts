import { IsString } from 'class-validator';

export class CreateCenterDto {

  @IsString()
  centerCode: string;


  @IsString()
  name: string;


  @IsString()
  address: string;


  @IsString()
  city: string;


  @IsString()
  state: string;
}