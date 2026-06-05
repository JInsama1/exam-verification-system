import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';


import { TabletService } from './tablet.service';

import { DashboardDto } from './dto/dashboard.dto';

import { CandidateSearchDto } from './dto/candidate-search.dto';


@Controller('tablet')
export class TabletController {


  constructor(
    private readonly tabletService: TabletService,
  ) {}


  @Post('dashboard')
  dashboard(
    @Body() dto: DashboardDto,
  ) {
    return this.tabletService.dashboard(dto);
  }


  @Post('candidate-search')
  candidateSearch(
    @Body() dto: CandidateSearchDto,
  ) {
    return this.tabletService.candidateSearch(dto);
  }


}
