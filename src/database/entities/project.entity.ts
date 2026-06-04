import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';


export enum ProjectStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}


@Entity('projects')
export class Project {


  @PrimaryGeneratedColumn('uuid')
  id: string;


  @Column()
  name: string;


  @Column()
  clientName: string;


  @Column({
    nullable: true,
  })
  tenderRef: string;


  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.ACTIVE,
  })
  status: ProjectStatus;


  @CreateDateColumn()
  createdAt: Date;


  @UpdateDateColumn()
  updatedAt: Date;


}
