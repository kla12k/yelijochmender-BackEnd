import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Business } from '../../business/entities/business.entity';
import { Event } from '../../event/entities/event.entity';
import { Professional } from '../../profession/entities/profession.entity';

export enum CategoryType {
  BUSINESS = 'business',
  EVENT = 'event',
  PROFESSIONAL = 'professional',
  ARTICLE = 'article',
  BOTH = 'both',
}

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: CategoryType,
    default: CategoryType.BOTH,
  })
  type: CategoryType;

  // Add this field to your entity
  @Column({ nullable: true })
  image: string;

  @OneToMany(() => Business, (business) => business.category)
  businesses: Business[];

  @OneToMany(() => Event, (event) => event.category)
  events: Event[];

  @OneToMany(() => Professional, (profession) => profession.category)
  professions: Professional[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
