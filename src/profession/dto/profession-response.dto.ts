import { Exclude, Expose, Type } from 'class-transformer';
import {
  WorkingHours,
  ProfessionalService,
} from '../entities/profession.entity';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;
}

export class CategoryResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  type: string;
}

export class ResponseProfessionalDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  phone: string;

  @Expose()
  profilePhoto: string;

  @Expose()
  professionalTitle: string;

  @Expose()
  yearsOfExperience: number;

  @Expose()
  licenseNumber: string;

  @Expose()
  bio: string;

  @Expose()
  address: string;

  // Location fields
  @Expose()
  latitude: number;

  @Expose()
  longitude: number;

  @Expose()
  workingHours: WorkingHours[];

  @Expose()
  services: ProfessionalService[];

  @Expose()
  languagesSpoken: string[];

  @Expose()
  consultationType: string;

  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;

  @Expose()
  @Type(() => CategoryResponseDto)
  category: CategoryResponseDto;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  // Exclude sensitive fields
  @Exclude()
  userId: string;

  @Exclude()
  categoryId: string;
}
