// src/admin/admin.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RoleUpgradeRequest, RequestStatus } from '../users/entities/role-upgrade-request.entity';
import { User } from '../auth/entities/user.entity';
import { RoleChangeUpdateDto } from '../users/dto/role-change-update.dto'; // ✅ Correct DTO
import { console } from 'inspector';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(RoleUpgradeRequest)
    private readonly upgradeRepo: Repository<RoleUpgradeRequest>,

    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async getPendingRequests() {
    return this.upgradeRepo.find({
      where: { status: RequestStatus.PENDING },
      relations: ['user'],
    });
  }

  async getOneRequest(id: number) {
    const req = await this.upgradeRepo.findOne({ where: { id }, relations: ['user'] });
    if (!req) throw new NotFoundException('Request not found');
    return req;
  }

  async updateRequestStatus(id: number, dto: RoleChangeUpdateDto) {
    const request = await this.upgradeRepo.findOne({ where: { id }, relations: ['user'] });
    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== RequestStatus.PENDING) {
      throw new NotFoundException('Request already processed');
    }
    request.status = dto.status;
    request.adminId = 1; 
    await this.upgradeRepo.save(request);
    if (dto.status === RequestStatus.APPROVED) {
      request.user.role = request.requestedRole;
      await this.usersRepo.save(request.user);
    }

    return request;
  }
}
