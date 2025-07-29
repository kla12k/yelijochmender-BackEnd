import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleUpgradeRequest } from '../users/entities/role-upgrade-request.entity';
import { User } from '../auth/entities/user.entity';
import { AdminController } from './admins.controller';
import { AdminService } from './admins.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoleUpgradeRequest, User])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
