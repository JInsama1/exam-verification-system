import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Unique,
} from 'typeorm';


import {
  Project,
} from './project.entity';


@Entity('centers')
@Unique([
  'centerCode',
  'project',
])
export class Center {


  @PrimaryGeneratedColumn('uuid')
  id: string;


  @Column()
  centerCode: string;


  @Column()
  name: string;


  @Column()
  address: string;


  @Column()
  city: string;


  @Column()
  state: string;


  @ManyToOne(
    () => Project,
    { nullable: false },
  )
  project: Project;


  @Column({
    default: true,
  })
  active: boolean;


  @CreateDateColumn()
  createdAt: Date;


  @UpdateDateColumn()
  updatedAt: Date;


}
