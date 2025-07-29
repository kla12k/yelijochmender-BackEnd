import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Category } from '../../category/entities/category.entity';

// Reusable type for hours
export class WorkingHours {
  day: string;
  start: string;
  end: string;
  available: boolean;
}

// Reusable type for services
export class ProfessionalService {
  name: string;
  description: string;
}

@Entity('profession')
export class Professional {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  profilePhoto: string;

  @Column()
  professionalTitle: string;

  @Column({ type: 'int', default: 0 })
  yearsOfExperience: number;

  @Column({ nullable: true })
  licenseNumber: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  address: string;

  // Location data
  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  longitude: number;

  // Working hours stored as an array of objects for flexibility
  @Column('json', { nullable: true })
  workingHours: WorkingHours[];

  // Structured service descriptions
  @Column('json', { nullable: true })
  services: ProfessionalService[];

  @Column('simple-array', { nullable: true })
  languagesSpoken: string[];

  @Column({
    type: 'enum',
    enum: ['in-person', 'online', 'both'],
    default: 'both',
  })
  consultationType: string;

  @Column()
  userId: string;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  favoriteCount: number;

  @ManyToOne(() => User, (user) => user.professions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.professions)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

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
