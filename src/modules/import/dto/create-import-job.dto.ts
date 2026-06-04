import {
  IsUUID,
} from 'class-validator';


export class CreateImportJobDto {


  @IsUUID()
  projectId: string;


}
