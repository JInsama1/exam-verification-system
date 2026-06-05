import {
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';


export class LoginFieldOperatorDto {


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


}
