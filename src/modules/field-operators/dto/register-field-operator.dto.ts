import {
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';


import {
  IdProofType,
} from '../../../database/entities/field-operator.entity';


export class RegisterFieldOperatorDto {


  @IsString()
  @IsNotEmpty()
  name: string;


  @IsString()
  @IsNotEmpty()
  @Matches(
    /^[6-9]\d{9}$/,
    {
      message:
        'phone must be a valid 10-digit Indian mobile number',
    },
  )
  phone: string;


  @IsEnum(IdProofType)
  idProofType: IdProofType;


}
