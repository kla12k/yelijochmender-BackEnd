import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateArticleDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

  @Type(() => Number)
  @IsNumber()
  categoryId: number;

  @IsArray()
  @IsOptional()
  tags?: string[];

  // Allow image to be passed in the DTO (for mobile clients)
  @IsOptional()
  image?: any;
}
