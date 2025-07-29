import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Category } from '../../category/entities/category.entity';
import { UserReaction } from '../../user-reaction/entities/user-reaction.entity';
import { Comment } from '../../comment/entities/comment.entity';

// Define types for article metadata
export class ArticleMetadata {
  readingTime: number; // in minutes
  wordCount: number;
  seoTitle?: string;
  seoDescription?: string;
}

export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  excerpt: string;

  @Column({ nullable: true })
  featuredImage: string;

  @Column({
    type: 'enum',
    enum: ArticleStatus,
    default: ArticleStatus.DRAFT,
  })
  status: ArticleStatus;

  @Column()
  authorId: string;

  @Column({ nullable: true })
  categoryId: string;

  // Tags stored as JSON array
  @Column('json', { nullable: true })
  tags: string[];

  // Article metadata
  @Column('json', { nullable: true })
  metadata: ArticleMetadata;

  // Engagement metrics
  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  commentCount: number;

  @Column({ default: 0 })
  shareCount: number;

  @Column({ default: 0 })
  favoriteCount: number;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  publishedAt: Date;

  // Relationships
  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToMany(() => Comment, (comment) => comment.entityId)
  comments: Comment[];

  @OneToMany(() => UserReaction, (like) => like.entityId)
  likes: UserReaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
