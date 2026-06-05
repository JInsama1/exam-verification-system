import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';


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
