import { IsEnum } from 'class-validator';
import { UserRoles } from '../../auth/enums/user-roles.enum';

export class RoleChangeDto {
  @IsEnum(UserRoles)
  role: UserRoles;
}
