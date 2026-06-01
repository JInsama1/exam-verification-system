import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';


@Entity('centers')
export class Center {

  @PrimaryGeneratedColumn('uuid')
  id: string;


  @Column({
    unique: true,
  })
  centerCode: string;


  @Column()
  name: string;


  @Column()
  address: string;


  @Column()
  city: string;


  @Column()
  state: string;


  @Column({
    default: true,
  })
  active: boolean;


  @CreateDateColumn()
  createdAt: Date;


  @UpdateDateColumn()
  updatedAt: Date;
}