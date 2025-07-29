import { IsEnum } from 'class-validator';
import { RequestStatus } from '../entities/role-upgrade-request.entity';

export class RoleChangeUpdateDto {
  @IsEnum(RequestStatus)
  status: RequestStatus;
}
