import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';


import { SyncService } from './sync.service';

import { DownloadPackageDto } from './dto/download-package.dto';

import { UploadSyncDto } from './dto/upload-sync.dto';

import { ListJobsDto } from './dto/list-jobs.dto';


@Controller('tablet/sync')
export class SyncController {


  constructor(
    private readonly syncService: SyncService,
  ) {}


  /**
   * Download a candidate + template package for offline use.
   * Device token authenticates the tablet; exam + optional shift scopes the payload.
   */
  @Post('package')
  requestPackage(
    @Body() dto: DownloadPackageDto,
  ) {
    return this.syncService.requestPackage(dto);
  }


  /**
   * Upload verification captures collected while offline.
   * Captures are stored in BiometricCapture with capturedAt = device timestamp.
   * Conflicts (candidate already verified online after download) are flagged
   * in the response but still recorded for audit.
   */
  @Post('upload')
  uploadCaptures(
    @Body() dto: UploadSyncDto,
  ) {
    return this.syncService.uploadCaptures(dto);
  }


  /**
   * List recent sync jobs for a device (up to 50, newest first).
   */
  @Post('jobs')
  listJobs(
    @Body() dto: ListJobsDto,
  ) {
    return this.syncService.listJobsForDevice(
      dto.deviceId,
      dto.deviceToken,
    );
  }


}
