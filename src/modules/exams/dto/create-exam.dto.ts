import { IsString } from 'class-validator';


export class CreateExamDto {


  @IsString()
  examCode: string;


  @IsString()
  name: string;


  @IsString()
  startDate: string;


  @IsString()
  endDate: string;

}