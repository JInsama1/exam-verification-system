import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import { Throttle } from '@nestjs/throttler';


import { DevicesService } from './devices.service';

import { ActivateDeviceDto } from './dto/activate-device.dto';

import { HeartbeatDeviceDto } from './dto/heartbeat-device.dto';


@Controller('devices')
export class DeviceTabletController {


  constructor(
    private readonly devicesService:
      DevicesService,
  ) {}


  @Post('activate')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  activate(
    @Body() dto: ActivateDeviceDto,
  ) {
    return this.devicesService.activate(dto);
  }


  @Post('heartbeat')
  heartbeat(
    @Body() dto: HeartbeatDeviceDto,
  ) {
    return this.devicesService.heartbeat(dto);
  }


}
