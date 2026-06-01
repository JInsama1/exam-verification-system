import { IsString } from 'class-validator';


export class CreateCandidateDto {


  @IsString()
  rollNumber: string;


  @IsString()
  name: string;


  @IsString()
  photoUrl: string;


  @IsString()
  examId: string;


  @IsString()
  shiftId: string;


  @IsString()
  centerId: string;

}