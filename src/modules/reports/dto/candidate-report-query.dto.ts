import {
  IsOptional,
  IsUUID,
} from 'class-validator';


export class CandidateReportQueryDto {


  @IsUUID()
  projectId: string;


  @IsOptional()
  @IsUUID()
  examId?: string;


  @IsOptional()
  @IsUUID()
  centerId?: string;


  @IsOptional()
  @IsUUID()
  shiftId?: string;


}
