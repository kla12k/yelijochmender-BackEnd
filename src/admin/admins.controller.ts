import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { RoleChangeUpdateDto } from '../users/dto/role-change-update.dto';
import { AdminService } from './admins.service';

@Controller('admin/role-requests')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get()
  getPending() {
    return this.admin.getPendingRequests();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.admin.getOneRequest(+id);
  }

  @Patch(':id')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: RoleChangeUpdateDto,
  ) {
    return this.admin.updateRequestStatus(+id, dto);
  }
}
