import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { UserRoles } from '../../auth/enums/user-roles.enum';
import { User } from '../../auth/entities/user.entity';

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('role_upgrade_request')
export class RoleUpgradeRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.roleChangeRequests, { eager: false })
  user: User;

  @Column({ type: 'enum', enum: UserRoles })
  requestedRole: UserRoles;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;

  @Column({ nullable: true })
  adminId?: number;

  @CreateDateColumn()
  requestedAt: Date;
}
