import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';


import { Center } from '../../database/entities/center.entity';

import { CreateCenterDto } from './dto/create-center.dto';


@Injectable()
export class CentersService {

  constructor(

    @InjectRepository(Center)
    private readonly centerRepository:
      Repository<Center>,

  ) {}


  create(dto: CreateCenterDto) {

    const center =
      this.centerRepository.create(dto);


    return this.centerRepository.save(
      center,
    );

  }


  findAll() {

    return this.centerRepository.find();

  }

}