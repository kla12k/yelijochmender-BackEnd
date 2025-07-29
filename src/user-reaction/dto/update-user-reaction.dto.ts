import { PartialType } from '@nestjs/mapped-types';
import { CreateUserReactionDto } from './create-user-reaction.dto';

export class UpdateUserReactionDto extends PartialType(CreateUserReactionDto) {}
