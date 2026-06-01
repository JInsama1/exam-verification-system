import { IsString } from 'class-validator';


export class VerifyAttendanceDto {


  @IsString()
  candidateId: string;


  @IsString()
  operatorId: string;


  @IsString()
  deviceId: string;


  @IsString()
  remarks: string;

}