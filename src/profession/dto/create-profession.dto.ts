import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsArray,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class WorkingHoursDto {
  @IsString()
  @IsNotEmpty()
  day: string;

  @IsString()
  @IsNotEmpty()
  start: string;

  @IsString()
  @IsNotEmpty()
  end: string;

  @IsOptional()
  available: boolean;
}

export class ProfessionalServiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description: string;
}

export class CreateProfessionalDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  profilePhoto?: string;

  @IsString()
  @IsNotEmpty()
  professionalTitle: string;

  @IsNumber()
  @IsOptional()
  yearsOfExperience?: number;

  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  address?: string;

  // Location fields
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkingHoursDto)
  @IsOptional()
  workingHours?: WorkingHoursDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProfessionalServiceDto)
  @IsOptional()
  services?: ProfessionalServiceDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languagesSpoken?: string[];

  @IsEnum(['in-person', 'online', 'both'])
  @IsOptional()
  consultationType?: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;
}
