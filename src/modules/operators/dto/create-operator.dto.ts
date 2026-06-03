import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';




export class CreateOperatorDto {


  @IsString()
  @IsNotEmpty()
  name: string;



  @IsEmail()
  @IsNotEmpty()
  email: string;



  @IsString()
  @IsNotEmpty()
  password: string;



  @IsString()
  @IsNotEmpty()
  employeeCode: string;



  @IsUUID()
  @IsNotEmpty()
  centerId: string;


}