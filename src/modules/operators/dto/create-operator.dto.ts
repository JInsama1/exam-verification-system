import { IsEmail, IsString } from 'class-validator';


export class CreateOperatorDto {


  @IsString()
  name: string;


  @IsEmail()
  email: string;


  @IsString()
  password: string;


  @IsString()
  employeeCode: string;


  @IsString()
  centerId: string;

}