import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';


import { InjectRepository } from '@nestjs/typeorm';


import { Repository } from 'typeorm';


import * as bcrypt from 'bcrypt';


import { Operator } from '../../database/entities/operator.entity';
import { User } from '../../database/entities/user.entity';
import { Center } from '../../database/entities/center.entity';


import { Role } from '../../common/enums/role.enum';


import { CreateOperatorDto } from './dto/create-operator.dto';



@Injectable()
export class OperatorsService {


  constructor(

    @InjectRepository(Operator)
    private operatorRepository:
      Repository<Operator>,


    @InjectRepository(User)
    private userRepository:
      Repository<User>,


    @InjectRepository(Center)
    private centerRepository:
      Repository<Center>,

  ) {}



  async create(dto: CreateOperatorDto) {


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



    const passwordHash =
      await bcrypt.hash(
        dto.password,
        10,
      );



    const user =
      await this.userRepository.save({

        name: dto.name,

        email: dto.email,

        passwordHash,

        role: Role.OPERATOR,

      });



    const operator =
      this.operatorRepository.create({

        employeeCode:
          dto.employeeCode,

        user,

        center,

      });



    return this.operatorRepository.save(
      operator,
    );

  }



    findAll() {

    return this.operatorRepository.find({
      relations: {
        user: true,
        center: true,
      },
    });

  }

}