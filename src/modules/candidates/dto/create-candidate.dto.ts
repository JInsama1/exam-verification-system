import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';





export class CreateCandidateDto {


  @IsString()
  @IsNotEmpty()
  rollNumber: string;





  @IsString()
  @IsNotEmpty()
  name: string;





  @IsOptional()
  @IsString()
  photoUrl?: string;





  @IsUUID()
  @IsNotEmpty()
  examId: string;





  @IsUUID()
  @IsNotEmpty()
  shiftId: string;





  @IsUUID()
  @IsNotEmpty()
  centerId: string;


}