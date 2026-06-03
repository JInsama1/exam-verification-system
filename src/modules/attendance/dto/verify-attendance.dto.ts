import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';




export class VerifyAttendanceDto {


  @IsUUID()
  @IsNotEmpty()
  candidateId: string;




  @IsUUID()
  @IsNotEmpty()
  operatorId: string;




  @IsUUID()
  @IsNotEmpty()
  deviceId: string;




  @IsString()
  @IsOptional()
  remarks?: string;


}