import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserRoles } from '../enums/user-roles.enum';
import { Business } from '../../business/entities/business.entity';
import { Event } from '../../event/entities/event.entity';
import { Review } from '../../review/entities/review.entity';

import { Professional } from '../../profession/entities/profession.entity';
import { Article } from '../../article/entities/article.entity';

import { RoleUpgradeRequest } from '../../users/entities/role-upgrade-request.entity';


@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRoles,
    default: UserRoles.USER,
  })
  role: UserRoles;

  @OneToMany(() => Business, (business) => business.owner)
  businesses: Business[];

  @OneToMany(() => Event, (event) => event.organizer)
  organizedEvents: Event[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => Professional, (profession) => profession.user)
  professions: Professional[];

  @OneToMany(() => Article, (article) => article.author)
  articles: Article[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  avatarUri: string;

  @Column({ nullable: true })
  phone: string;

  @OneToMany(() => RoleUpgradeRequest, (req) => req.user)
  roleChangeRequests: RoleUpgradeRequest[];
}
