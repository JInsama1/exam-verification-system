import * as XLSX from 'xlsx';


import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';


import {
  InjectRepository,
} from '@nestjs/typeorm';


import {
  Repository,
  ILike,
} from 'typeorm';


import {
  Candidate,
} from '../../database/entities/candidate.entity';


import {
  Exam,
} from '../../database/entities/exam.entity';


import {
  Shift,
} from '../../database/entities/shift.entity';


import {
  Center,
} from '../../database/entities/center.entity';


import {
  CreateCandidateDto,
} from './dto/create-candidate.dto';





@Injectable()
export class CandidatesService {


  constructor(

    @InjectRepository(Candidate)
    private candidateRepository:
      Repository<Candidate>,


    @InjectRepository(Exam)
    private examRepository:
      Repository<Exam>,


    @InjectRepository(Shift)
    private shiftRepository:
      Repository<Shift>,


    @InjectRepository(Center)
    private centerRepository:
      Repository<Center>,

  ) {}






  async create(
    dto: CreateCandidateDto,
  ) {


    const exam =
      await this.examRepository.findOne({
        where: {
          id: dto.examId,
        },
      });



    const shift =
      await this.shiftRepository.findOne({
        where: {
          id: dto.shiftId,
        },
      });



    const center =
      await this.centerRepository.findOne({
        where: {
          id: dto.centerId,
        },
      });





    if (!exam || !shift || !center) {


      throw new NotFoundException(

        'Invalid exam, shift, or center',

      );


    }

const existing =
  await this.candidateRepository.findOne({

    where: {

      rollNumber:
        dto.rollNumber,


      exam: {

        id:
          exam.id,

      },

    },

  });





if (existing) {


  throw new ConflictException(

    'Candidate already exists',

  );


}




    const candidate =
      this.candidateRepository.create({

        rollNumber:
          dto.rollNumber,


        name:
          dto.name,


        photoUrl:
          dto.photoUrl,


        exam,

        shift,

        center,

      });





    return this.candidateRepository.save(

      candidate,

    );


  }



async uploadPhoto(

  id: string,

  filename: string,

) {


  const candidate =
    await this.candidateRepository.findOne({

      where: {

        id,

      },

    });




  if (!candidate) {


    throw new NotFoundException(

      'Candidate not found',

    );


  }




  candidate.photoUrl =
    `/uploads/${filename}`;





  return this.candidateRepository.save(

    candidate,

  );


}




  async importExcel(
  filePath: string,
) {


  const workbook =
    XLSX.readFile(
      filePath,
    );



  const sheet =
    workbook.Sheets[
      workbook.SheetNames[0]
    ];



  const rows =
    XLSX.utils.sheet_to_json(
      sheet,
    ) as any[];





  const candidates: Candidate[] = [];





  for (const row of rows) {


  if (

    !row.rollNumber ||

    !row.name ||

    !row.examCode ||

    !row.shiftName ||

    !row.centerCode

  ) {


    continue;


  }



  const exam =
    await this.examRepository.findOne({

        where: {

          examCode:
            row.examCode,

        },

      });




    const shift =
      await this.shiftRepository.findOne({

        where: {

          name:
            row.shiftName,

        },

      });




    const center =
      await this.centerRepository.findOne({

        where: {

          centerCode:
            row.centerCode,

        },

      });







    if (

      !exam ||

      !shift ||

      !center

    ) {


      continue;


    }

const existing =
  await this.candidateRepository.findOne({

    where: {

      rollNumber:
        row.rollNumber,


      exam: {

        id:
          exam.id,

      },

    },

  });





if (existing) {


  continue;


}





    candidates.push(

      this.candidateRepository.create({

        rollNumber:
          row.rollNumber,


        name:
          row.name,


        photoUrl:
          row.photoUrl,


        exam,

        shift,

        center,


      }),

    );


  }








  await this.candidateRepository.save(

    candidates,

  );





    return {

    imported:
      candidates.length,

    skipped:

      rows.length -
      candidates.length,

  };


}






async findAll(

  search?: string,

  page = 1,

) {


  const limit = 20;



  const where = search

    ? [

        {

          rollNumber:

            ILike(
              `%${search}%`,
            ),

        },


        {

          name:

            ILike(
              `%${search}%`,
            ),

        },

      ]

    : {};





  const [

    data,

    total,

  ] = await this.candidateRepository.findAndCount({

    where,


    relations: {

      exam: true,

      shift: true,

      center: true,

    },


    take:

      limit,


    skip:

      (page - 1) * limit,


    order: {

      createdAt:

        'DESC',

    },

  });





  return {

    data,

    total,

    page,

    pages:

      Math.ceil(
        total / limit,
      ),

  };


}


}