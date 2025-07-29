import { IsString, IsOptional, IsEnum } from 'class-validator';
import { CategoryType } from '../entities/category.entity';

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  locaction?: string;

  @IsOptional()
  categoryId: string;
}
