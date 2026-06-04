import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';


export class CreateProjectDto {


  @IsString()
  @IsNotEmpty()
  name: string;


  @IsString()
  @IsNotEmpty()
  clientName: string;


  @IsString()
  @IsOptional()
  tenderRef?: string;


}
