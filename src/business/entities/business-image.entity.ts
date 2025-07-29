import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Business } from './business.entity';


@Entity()
export class BusinessImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;
  @Column()
  businessId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}