import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
@Entity()
export class EventImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  url: string;
  @Column()
  eventId: string;
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}