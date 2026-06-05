import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';


import { InjectRepository } from '@nestjs/typeorm';


import { Repository } from 'typeorm';


import {
  createHash,
  randomBytes,
  timingSafeEqual,
} from 'crypto';


import {
  Device,
  DeviceStatus,
} from '../../database/entities/device.entity';

import { Center } from '../../database/entities/center.entity';

import {
  FieldOperator,
} from '../../database/entities/field-operator.entity';


import { CreateDeviceDto } from './dto/create-device.dto';

import { ActivateDeviceDto } from './dto/activate-device.dto';

import { HeartbeatDeviceDto } from './dto/heartbeat-device.dto';


function generateToken(): string {
  return randomBytes(32).toString('hex');
}


function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}


// Constant-time comparison for hex-encoded SHA-256 hashes
function secureCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, 'hex');
  const bBuf = Buffer.from(b, 'hex');
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}


@Injectable()
export class DevicesService {


  constructor(

    @InjectRepository(Device)
    private deviceRepository:
      Repository<Device>,


    @InjectRepository(Center)
    private centerRepository:
      Repository<Center>,


    @InjectRepository(FieldOperator)
    private fieldOperatorRepository:
      Repository<FieldOperator>,

  ) {}



  async create(dto: CreateDeviceDto) {


    const center =
      await this.centerRepository.findOne({
        where: {
          id: dto.centerId,
        },
      });


    if (!center) {
      throw new NotFoundException(
        'Center not found',
      );
    }


    const rawSecret     = generateToken();
    const secretHash    = hashToken(rawSecret);


    const device =
      this.deviceRepository.create({

        deviceCode:           dto.deviceCode,
        serialNumber:         dto.serialNumber,
        center,
        activationSecretHash: secretHash,

      });


    const saved =
      await this.deviceRepository.save(device);


    // activationSecret is returned only here — never stored in plaintext
    return {
      id:               saved.id,
      deviceCode:       saved.deviceCode,
      serialNumber:     saved.serialNumber,
      center:           saved.center,
      status:           saved.status,
      active:           saved.active,
      locked:           saved.locked,
      activatedAt:      saved.activatedAt,
      lastSeenAt:       saved.lastSeenAt,
      activatedBy:      saved.activatedBy,
      createdAt:        saved.createdAt,
      updatedAt:        saved.updatedAt,
      activationSecret: rawSecret,
    };

  }




  findAll() {


    return this.deviceRepository.find({
      relations: {
        center:      true,
        activatedBy: true,
      },
    });


  }


  async activate(
    dto: ActivateDeviceDto,
  ): Promise<{
    deviceId:    string;
    deviceCode:  string;
    status:      DeviceStatus;
    activatedAt: Date;
    deviceToken: string;
  }> {


    const device =
      await this.deviceRepository
        .createQueryBuilder('device')
        .addSelect('device.activationSecretHash')
        .where(
          'device.deviceCode = :deviceCode',
          { deviceCode: dto.deviceCode },
        )
        .getOne();

    if (!device) {
      throw new NotFoundException(
        'Device not found',
      );
    }

    if (device.status === DeviceStatus.BLOCKED) {
      throw new ForbiddenException(
        'Device is blocked',
      );
    }

    if (device.status === DeviceStatus.ACTIVE) {
      throw new ConflictException(
        'Device is already active',
      );
    }

    if (
      !device.activationSecretHash ||
      !secureCompare(
        hashToken(dto.activationSecret),
        device.activationSecretHash,
      )
    ) {
      throw new UnauthorizedException(
        'Invalid activation secret',
      );
    }


    const fieldOperator =
      await this.fieldOperatorRepository.findOne({
        where: {
          id:       dto.fieldOperatorId,
          isActive: true,
        },
      });

    if (!fieldOperator) {
      throw new NotFoundException(
        'FieldOperator not found',
      );
    }


    const rawToken   = generateToken();
    const tokenHash  = hashToken(rawToken);
    const now        = new Date();

    device.status          = DeviceStatus.ACTIVE;
    device.activatedBy     = fieldOperator;
    device.activatedAt     = device.activatedAt ?? now;
    device.lastSeenAt      = now;
    device.deviceTokenHash = tokenHash;


    const saved =
      await this.deviceRepository.save(device);


    return {
      deviceId:    saved.id,
      deviceCode:  saved.deviceCode,
      status:      saved.status,
      activatedAt: saved.activatedAt,
      deviceToken: rawToken,
    };


  }


  async heartbeat(
    dto: HeartbeatDeviceDto,
  ): Promise<{
    deviceId:   string;
    lastSeenAt: Date;
  }> {


    const device =
      await this.deviceRepository
        .createQueryBuilder('device')
        .addSelect('device.deviceTokenHash')
        .where('device.id = :id', { id: dto.deviceId })
        .getOne();

    if (!device) {
      throw new NotFoundException(
        'Device not found',
      );
    }

    if (device.status === DeviceStatus.BLOCKED) {
      throw new ForbiddenException(
        'Device is blocked',
      );
    }

    if (device.status === DeviceStatus.PENDING) {
      throw new ForbiddenException(
        'Device is not activated',
      );
    }

    if (
      !device.deviceTokenHash ||
      !secureCompare(
        hashToken(dto.deviceToken),
        device.deviceTokenHash,
      )
    ) {
      throw new UnauthorizedException(
        'Invalid device token',
      );
    }


    device.lastSeenAt = new Date();

    const saved =
      await this.deviceRepository.save(device);


    return {
      deviceId:   saved.id,
      lastSeenAt: saved.lastSeenAt,
    };


  }


}
