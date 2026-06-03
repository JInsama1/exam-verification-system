import {
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';




export class CreateShiftDto {


  @IsString()
  @IsNotEmpty()
  name: string;




  @IsString()
  @IsNotEmpty()
  startTime: string;




  @IsString()
  @IsNotEmpty()
  endTime: string;




  @IsUUID()
  @IsNotEmpty()
  examId: string;


}