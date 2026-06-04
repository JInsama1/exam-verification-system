import {
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';


export class CreateCenterDto {


  @IsString()
  @IsNotEmpty()
  centerCode: string;


  @IsString()
  @IsNotEmpty()
  name: string;


  @IsString()
  @IsNotEmpty()
  address: string;


  @IsString()
  @IsNotEmpty()
  city: string;


  @IsString()
  @IsNotEmpty()
  state: string;


  @IsUUID()
  projectId: string;


}
