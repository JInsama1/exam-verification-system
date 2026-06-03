import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';


import {
  AuditService,
} from '../audit/audit.service';


import { InjectRepository } from '@nestjs/typeorm';


import { Repository } from 'typeorm';


import { Attendance } from '../../database/entities/attendance.entity';
import { Candidate } from '../../database/entities/candidate.entity';
import { Operator } from '../../database/entities/operator.entity';
import { Device } from '../../database/entities/device.entity';


import { VerifyAttendanceDto } from './dto/verify-attendance.dto';



@Injectable()
export class AttendanceService {


  constructor(

  @InjectRepository(Attendance)
  private attendanceRepository:
    Repository<Attendance>,


  @InjectRepository(Candidate)
  private candidateRepository:
    Repository<Candidate>,


  @InjectRepository(Operator)
  private operatorRepository:
    Repository<Operator>,


  @InjectRepository(Device)
  private deviceRepository:
    Repository<Device>,


  private readonly auditService:
    AuditService,

) {}



  async verify(dto: VerifyAttendanceDto) {


    const candidate =
      await this.candidateRepository.findOne({
        where: {
          id: dto.candidateId,
        },
      });



    const operator =
  await this.operatorRepository.findOne({

    where: {

      id: dto.operatorId,

    },


    relations: {

      user: true,

    },

  });



    const device =
      await this.deviceRepository.findOne({
        where: {
          id: dto.deviceId,
        },
      });



    if (
      !candidate ||
      !operator ||
      !device
    ) {

      throw new NotFoundException(
        'Invalid verification data',
      );

    }



    const existingAttendance =
      await this.attendanceRepository.findOne({

        where: {

          candidate: {
            id: candidate.id,
          },

        },

      });



    if (existingAttendance) {

      throw new ConflictException(
        'Candidate already verified',
      );

    }




    candidate.verified = true;


    await this.candidateRepository.save(
      candidate,
    );




    const attendance =
      this.attendanceRepository.create({

        candidate,

        operator,

        device,

        verified: true,

        remarks: dto.remarks,

      });




    const saved =
  await this.attendanceRepository.save(
    attendance,
  );




await this.auditService.log(

  operator.user.id,

  'VERIFY_CANDIDATE',

  {

    candidateId:
      candidate.id,


    candidateName:
      candidate.name,


    deviceId:
      device.id,

  },

);




return saved;

  }




  findAll() {


    return this.attendanceRepository.find({

      relations: {

        candidate: true,

        operator: true,

        device: true,

      },

    });


  }


}