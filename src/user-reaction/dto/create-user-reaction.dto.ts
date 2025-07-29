import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ReactionType, EntityType } from '../entities/user-reaction.entity';

export class CreateUserReactionDto {
  @IsEnum(EntityType)
  @IsNotEmpty()
  entityType: EntityType;

  @IsString()
  @IsNotEmpty()
  entityId: string;

  @IsEnum(ReactionType)
  @IsNotEmpty()
  reactionType: ReactionType;
}
