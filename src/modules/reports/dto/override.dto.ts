import {
  IsNotEmpty,
  IsString,
} from 'class-validator';


export class OverrideDto {


  @IsString()
  @IsNotEmpty()
  reason: string;


}
