import {
  IsDateString,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';


export class CreateExamDto {


  @IsString()
  @IsNotEmpty()
  examCode: string;


  @IsString()
  @IsNotEmpty()
  name: string;


  @IsUUID()
  projectId: string;


  @IsDateString()
  startDate: string;


  @IsDateString()
  endDate: string;


}
