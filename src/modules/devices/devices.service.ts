import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';


import { InjectRepository } from '@nestjs/typeorm';


import { Repository } from 'typeorm';


import { Device } from '../../database/entities/device.entity';
import { Center } from '../../database/entities/center.entity';


import { CreateDeviceDto } from './dto/create-device.dto';



@Injectable()
export class DevicesService {


  constructor(

    @InjectRepository(Device)
    private deviceRepository:
      Repository<Device>,


    @InjectRepository(Center)
    private centerRepository:
      Repository<Center>,

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



    const device =
      this.deviceRepository.create({

        deviceCode:
          dto.deviceCode,


        serialNumber:
          dto.serialNumber,


        center,

      });



    return this.deviceRepository.save(
      device,
    );

  }




  findAll() {


    return this.deviceRepository.find({
      relations: {
        center: true,
      },
    });


  }


}