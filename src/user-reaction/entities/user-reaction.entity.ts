import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum ReactionType {
  LIKE = 'like',
  FAVORITE = 'favorite',
}

export enum EntityType {
  ARTICLE = 'article',
  BUSINESS = 'business',
  PROFESSIONAL = 'professional',
  EVENT = 'event',
}

@Entity('user_reactions')
@Unique(['userId', 'entityType', 'entityId', 'reactionType'])
export class UserReaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: EntityType,
  })
  entityType: EntityType;

  @Column()
  entityId: string;

  @Column({
    type: 'enum',
    enum: ReactionType,
  })
  reactionType: ReactionType;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
