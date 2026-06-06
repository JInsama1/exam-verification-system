import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Query,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';


import { ReportsService } from './reports.service';
import { CandidateReportQueryDto } from './dto/candidate-report-query.dto';
import { OverrideDto } from './dto/override.dto';


import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';


@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {


  constructor(
    private readonly reportsService: ReportsService,
  ) {}


  // ── existing ──────────────────────────────────────────────────────────────

  @Get('dashboard')
  @Roles(Role.MASTER_ADMIN, Role.ADMIN)
  dashboard() {
    return this.reportsService.dashboard();
  }


  @Get('export')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'attachment; filename="attendance-report.xlsx"')
  @Roles(Role.MASTER_ADMIN, Role.ADMIN)
  async export() {
    const buffer = await this.reportsService.exportAttendance();
    return new StreamableFile(buffer);
  }


  // ── Phase 6 ───────────────────────────────────────────────────────────────

  @Get('candidates')
  @Roles(Role.MASTER_ADMIN, Role.ADMIN)
  candidateReport(
    @Query() query: CandidateReportQueryDto,
  ) {
    return this.reportsService.candidateReport(query);
  }


  @Get('centers')
  @Roles(Role.MASTER_ADMIN, Role.ADMIN)
  centerReport(
    @Query('projectId') projectId: string,
  ) {
    return this.reportsService.centerReport(projectId);
  }


  @Get('operators')
  @Roles(Role.MASTER_ADMIN, Role.ADMIN)
  operatorReport(
    @Query('projectId') projectId: string,
  ) {
    return this.reportsService.operatorReport(projectId);
  }


  @Get('export/candidates')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'attachment; filename="verification-report.xlsx"')
  @Roles(Role.MASTER_ADMIN, Role.ADMIN)
  async exportCandidates(
    @Query() query: CandidateReportQueryDto,
  ) {
    const buffer = await this.reportsService.exportCandidateReport(query);
    return new StreamableFile(buffer);
  }


  @Post('override/:candidateId')
  @Roles(Role.MASTER_ADMIN, Role.ADMIN)
  manualOverride(
    @Param('candidateId') candidateId: string,
    @Body() dto: OverrideDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.reportsService.manualOverride(candidateId, user.id, dto.reason);
  }


}
