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
  AuditLog,
} from '../../database/entities/audit-log.entity';





@Injectable()
export class AuditService {


  constructor(

    @InjectRepository(
      AuditLog,
    )

    private readonly auditRepository:
      Repository<AuditLog>,

  ) {}






  async log(

    userId: string,

    action: string,

    details?: any,

  ) {


    const entry =
      this.auditRepository.create({

        userId,

        action,

        details,

      });




    return this.auditRepository.save(

      entry,

    );


  }







  findAll() {


    return this.auditRepository.find({

      order: {

        createdAt: 'DESC',

      },

    });


  }


}