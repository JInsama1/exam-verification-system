import { Injectable } from '@nestjs/common';


import { InjectRepository } from '@nestjs/typeorm';


import { Repository } from 'typeorm';


import { Candidate } from '../../database/entities/candidate.entity';
import { Attendance } from '../../database/entities/attendance.entity';
import { Center } from '../../database/entities/center.entity';
import { Device } from '../../database/entities/device.entity';
import { Operator } from '../../database/entities/operator.entity';



@Injectable()
export class ReportsService {


  constructor(

    @InjectRepository(Candidate)
    private candidateRepository:
      Repository<Candidate>,


    @InjectRepository(Attendance)
    private attendanceRepository:
      Repository<Attendance>,


    @InjectRepository(Center)
    private centerRepository:
      Repository<Center>,


    @InjectRepository(Device)
    private deviceRepository:
      Repository<Device>,


    @InjectRepository(Operator)
    private operatorRepository:
      Repository<Operator>,

  ) {}



  async dashboard() {


    const totalCandidates =
      await this.candidateRepository.count();


    const verified =
      await this.attendanceRepository.count();


    const centers =
      await this.centerRepository.count();


    const devices =
      await this.deviceRepository.count();


    const operators =
      await this.operatorRepository.count();



    return {

      totalCandidates,

      verified,

      pending:
        totalCandidates - verified,

      centers,

      devices,

      operators,

    };

  }


}