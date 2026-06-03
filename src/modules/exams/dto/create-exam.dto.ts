import {
  IsDateString,
  IsNotEmpty,
  IsString,
} from 'class-validator';




export class CreateExamDto {


  @IsString()
  @IsNotEmpty()
  examCode: string;



  @IsString()
  @IsNotEmpty()
  name: string;



  @IsDateString()
  startDate: string;



  @IsDateString()
  endDate: string;


}