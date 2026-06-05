import {
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';


export class CandidateSearchDto {


  @IsUUID()
  deviceId: string;


  @IsString()
  @IsNotEmpty()
  deviceToken: string;


  @IsUUID()
  examId: string;


  @IsString()
  @IsNotEmpty()
  rollNumber: string;


}
