import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';


import { Type } from 'class-transformer';


export class OfflineCaptureDto {


  @IsUUID()
  candidateId: string;


  @IsUUID()
  fieldOperatorId: string;


  // Device-local timestamp of when the biometric was captured
  @IsISO8601()
  capturedAt: string;


  // Device-reported score — informational only; server recomputes via matcher
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  deviceMatchScore?: number;


  @IsString()
  @IsOptional()
  fingerprintTemplate?: string;


  @IsString()
  @IsOptional()
  irisTemplate?: string;


}


export class UploadSyncDto {


  @IsUUID()
  deviceId: string;


  @IsString()
  deviceToken: string;


  @IsUUID()
  syncJobId: string;


  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique((o: OfflineCaptureDto) => o.candidateId)
  @ValidateNested({ each: true })
  @Type(() => OfflineCaptureDto)
  captures: OfflineCaptureDto[];


}
