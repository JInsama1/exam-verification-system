import {
  Injectable,
} from '@nestjs/common';


import {
  InjectRepository,
} from '@nestjs/typeorm';


import {
  Repository,
} from 'typeorm';


import {
  FieldOperator,
} from '../../database/entities/field-operator.entity';


import {
  RegisterFieldOperatorDto,
} from './dto/register-field-operator.dto';


@Injectable()
export class FieldOperatorsService {


  constructor(

    @InjectRepository(FieldOperator)
    private fieldOperatorRepository:
      Repository<FieldOperator>,

  ) {}


  async register(
    dto: RegisterFieldOperatorDto,
    selfieFile: Express.Multer.File | undefined,
    idProofFile: Express.Multer.File | undefined,
  ): Promise<{
    fieldOperatorId: string;
    name: string;
    phone: string;
  }> {


    const existing =
      await this.fieldOperatorRepository.findOne({

        where: {
          phone:    dto.phone,
          isActive: true,
        },

      });


    if (existing) {

      return {
        fieldOperatorId: existing.id,
        name:            existing.name,
        phone:           existing.phone,
      };

    }


    const fieldOperator =
      this.fieldOperatorRepository.create({

        name:  dto.name,
        phone: dto.phone,

        phoneValid:          true,
        phoneValidationData: {
          source:  'format',
          country: 'IN',
        },

        idProofType: dto.idProofType,

      });


    if (selfieFile) {

      fieldOperator.selfieUrl =
        `/uploads/${selfieFile.filename}`;

    }


    if (idProofFile) {

      fieldOperator.idProofUrl =
        `/uploads/${idProofFile.filename}`;

    }


    const saved =
      await this.fieldOperatorRepository.save(
        fieldOperator,
      );


    return {
      fieldOperatorId: saved.id,
      name:            saved.name,
      phone:           saved.phone,
    };


  }


}
