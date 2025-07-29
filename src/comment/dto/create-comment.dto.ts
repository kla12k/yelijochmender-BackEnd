import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { EntityType } from '../../user-reaction/entities/user-reaction.entity';

export class CreateCommentDto {
  @IsEnum(EntityType)
  @IsNotEmpty()
  entityType: EntityType;

  @IsString()
  @IsNotEmpty()
  entityId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
