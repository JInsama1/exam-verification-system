import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';


import { AttendanceService } from './attendance.service';


import { VerifyAttendanceDto } from './dto/verify-attendance.dto';


import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';


import { RolesGuard } from '../../common/guards/roles.guard';


import { Roles } from '../../common/decorators/roles.decorator';


import { Role } from '../../common/enums/role.enum';





@Controller(
  'attendance',
)


@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)


export class AttendanceController {


  constructor(

    private readonly attendanceService:
      AttendanceService,

  ) {}





  @Post(
    'verify',
  )


  @Roles(
    Role.OPERATOR,
    Role.ADMIN,
    Role.MASTER_ADMIN,
  )


  verify(

    @Body()
    dto: VerifyAttendanceDto,

  ) {


    return this.attendanceService.verify(
      dto,
    );


  }







  @Get()


  @Roles(
  Role.MASTER_ADMIN,
  Role.ADMIN,
  Role.OPERATOR,
)


  findAll() {


    return this.attendanceService.findAll();


  }


}