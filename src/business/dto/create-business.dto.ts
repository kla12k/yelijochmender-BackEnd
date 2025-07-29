import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

// Define DTOs for nested objects
export class BusinessHoursDto {
  @IsString()
  day: string;

  @IsString()
  open: string;

  @IsString()
  close: string;

  @IsBoolean()
  isClosed: boolean;
}

export class BusinessServiceDto {
  @IsString()
  name: string;

  @IsString()
  description: string;
}

export class CreateBusinessDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  address: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  categoryId: number;

  // Location data
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  longitude?: number;

  // Services array
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BusinessServiceDto)
  @IsOptional()
  services?: BusinessServiceDto[];

  // Business hours array
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BusinessHoursDto)
  @IsOptional()
  hours?: BusinessHoursDto[];

  // Allow image to be passed in the DTO (for mobile clients)
  @IsOptional()
  image?: any;

  @IsOptional()
  @IsArray()
  additionalImages?: Express.Multer.File[];
}
