import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RoleUpgradeRequest } from './entities/role-upgrade-request.entity';

@Module({
imports: [
    TypeOrmModule.forFeature([User, RoleUpgradeRequest]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
