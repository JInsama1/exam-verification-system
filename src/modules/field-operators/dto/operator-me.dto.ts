import {
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';


export class OperatorMeDto {


  @IsUUID()
  operatorId: string;


  @IsString()
  @IsNotEmpty()
  operatorToken: string;


}
