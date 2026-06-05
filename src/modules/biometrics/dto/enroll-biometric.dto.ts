import {
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';


export class EnrollBiometricDto {


  @IsUUID()
  candidateId: string;


  @IsUUID()
  fieldOperatorId: string;


  @IsOptional()
  @IsUUID()
  deviceId?: string;


  @IsString()
  @IsOptional()
  fingerprintTemplate?: string;


  @IsString()
  @IsOptional()
  irisTemplate?: string;


}
