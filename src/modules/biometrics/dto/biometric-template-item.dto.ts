import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import {
  BiometricModality,
  BiometricPosition,
  TemplateFormat,
} from '../../../common/enums/biometric-modality.enum';


export class BiometricTemplateItemDto {

  @IsEnum(BiometricModality)
  modality: BiometricModality;

  @IsEnum(BiometricPosition)
  position: BiometricPosition;

  @IsEnum(TemplateFormat)
  templateFormat: TemplateFormat;

  @IsString()
  templateData: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  qualityScore?: number;

}
