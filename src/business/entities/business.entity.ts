import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Category } from '../../category/entities/category.entity';
import { User } from '../../auth/entities/user.entity';
import { Review } from '../../review/entities/review.entity';

// Define types for the nested objects
export class BusinessHours {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

export class BusinessService {
  name: string;
  description: string;
}

// Simplified example of what your entity might need
@Entity()
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  website: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  @Column()
  image: string;

  @Column()
  ownerId: string;

  // Location data
  @Column('decimal', { precision: 10, scale: 6 })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 6 })
  longitude: number;

  // Services - stored as JSON
  @Column('json', { nullable: true })
  services: BusinessService[];

  // Hours - stored as JSON
  @Column('json', { nullable: true })
  hours: BusinessHours[];

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Category)
  category: Category;

  @ManyToOne(() => User)
  owner: User;

  @OneToMany(() => Review, (review) => review.business)
  reviews: Review[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
