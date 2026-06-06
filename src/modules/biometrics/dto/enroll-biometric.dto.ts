import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import {
  BiometricTemplateItemDto,
} from './biometric-template-item.dto';


export class EnrollBiometricDto {


  @IsUUID()
  candidateId: string;


  @IsUUID()
  fieldOperatorId: string;


  @IsOptional()
  @IsUUID()
  deviceId?: string;


  // ── Legacy single-template fields — kept for backward compatibility ─────
  // Callers that send fingerprintTemplate / irisTemplate continue to work.
  // If biometricTemplates is also present, biometricTemplates takes precedence.

  @IsString()
  @IsOptional()
  fingerprintTemplate?: string;


  @IsString()
  @IsOptional()
  irisTemplate?: string;


  // ── Multi-template array — new enrollment path ───────────────────────────
  // Supports multiple modalities and positions in one request.

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BiometricTemplateItemDto)
  biometricTemplates?: BiometricTemplateItemDto[];


}
