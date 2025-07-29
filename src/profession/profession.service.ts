import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Professional } from './entities/profession.entity';
import { User } from '../auth/entities/user.entity';
import { Category } from '../category/entities/category.entity';
import { CreateProfessionalDto } from './dto/create-profession.dto';
import { UpdateProfessionDto } from './dto/update-profession.dto';
import { ResponseProfessionalDto } from './dto/profession-response.dto';
import { UserRoles } from '../auth/enums/user-roles.enum';

@Injectable()
export class ProfessionalService {
  constructor(
    @InjectRepository(Professional)
    private professionalRepository: Repository<Professional>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(
    createProfessionalDto: CreateProfessionalDto,
    userId: string,
  ): Promise<ResponseProfessionalDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has the appropriate role
    // if (user.role !== UserRoles.PROFESSIONAL && user.role !== UserRoles.ADMIN) {
    //   throw new ForbiddenException(
    //     'Only professionals or admins can create professional profiles',
    //   );
    // }

    // Verify category exists and is for professionals
    const category = await this.categoryRepository.findOne({
      where: { id: createProfessionalDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Create the professional entity
    const professional = this.professionalRepository.create({
      ...createProfessionalDto,
      user,
      userId,
      category,
    });

    const savedProfessional = await this.professionalRepository.save(
      professional,
    );
    return this.mapToResponseDto(savedProfessional);
  }

  async findAll(): Promise<ResponseProfessionalDto[]> {
    const professionals = await this.professionalRepository.find({
      where: { isActive: true },
      relations: ['user', 'category'],
    });

    return professionals.map((professional) =>
      this.mapToResponseDto(professional),
    );
  }

  async findOne(id: string): Promise<ResponseProfessionalDto> {
    const professional = await this.professionalRepository.findOne({
      where: { id, isActive: true },
      relations: ['user', 'category'],
    });

    if (!professional) {
      throw new NotFoundException('Professional not found');
    }

    return this.mapToResponseDto(professional);
  }

  async update(
    id: string,
    updateProfessionalDto: UpdateProfessionDto,
    userId: string,
  ): Promise<ResponseProfessionalDto> {
    const professional = await this.professionalRepository.findOne({
      where: { id, isActive: true },
      relations: ['user', 'category'],
    });

    if (!professional) {
      throw new NotFoundException('Professional not found');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (professional.userId !== userId && user.role !== UserRoles.ADMIN) {
      throw new ForbiddenException(
        'You can only update your own professional profile',
      );
    }

    // If category is being updated, verify it exists
    if (updateProfessionalDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateProfessionalDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      professional.category = category;
    }

    Object.assign(professional, updateProfessionalDto);
    const updatedProfessional = await this.professionalRepository.save(
      professional,
    );
    return this.mapToResponseDto(updatedProfessional);
  }

  async remove(id: string, userId: string): Promise<void> {
    const professional = await this.professionalRepository.findOne({
      where: { id, isActive: true },
      relations: ['user'],
    });

    if (!professional) {
      throw new NotFoundException('Professional not found');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (professional.userId !== userId && user.role !== UserRoles.ADMIN) {
      throw new ForbiddenException(
        'You can only delete your own professional profile',
      );
    }

    // Soft delete
    professional.isActive = false;
    await this.professionalRepository.save(professional);
  }

  async findByUserId(userId: string): Promise<ResponseProfessionalDto[]> {
    const professionals = await this.professionalRepository.find({
      where: { userId, isActive: true },
      relations: ['user', 'category'],
    });

    return professionals.map((professional) =>
      this.mapToResponseDto(professional),
    );
  }

  async findByCategory(categoryId: string): Promise<ResponseProfessionalDto[]> {
    const professionals = await this.professionalRepository.find({
      where: {
        categoryId: categoryId,
        isActive: true,
      },
      relations: ['user', 'category'],
    });

    return professionals.map((professional) =>
      this.mapToResponseDto(professional),
    );
  }

  async findByLocation(address: string): Promise<ResponseProfessionalDto[]> {
    const professionals = await this.professionalRepository
      .createQueryBuilder('professional')
      .leftJoinAndSelect('professional.user', 'user')
      .leftJoinAndSelect('professional.category', 'category')
      .where('professional.isActive = :isActive', { isActive: true })
      .andWhere('professional.address LIKE :address', {
        address: `%${address}%`,
      })
      .getMany();

    return professionals.map((professional) =>
      this.mapToResponseDto(professional),
    );
  }

  async findByProfessionalTitle(
    title: string,
  ): Promise<ResponseProfessionalDto[]> {
    const professionals = await this.professionalRepository
      .createQueryBuilder('professional')
      .leftJoinAndSelect('professional.user', 'user')
      .leftJoinAndSelect('professional.category', 'category')
      .where('professional.isActive = :isActive', { isActive: true })
      .andWhere('professional.professionalTitle LIKE :title', {
        title: `%${title}%`,
      })
      .getMany();

    return professionals.map((professional) =>
      this.mapToResponseDto(professional),
    );
  }

  async findByConsultationType(
    consultationType: string,
  ): Promise<ResponseProfessionalDto[]> {
    const professionals = await this.professionalRepository.find({
      where: {
        consultationType: consultationType,
        isActive: true,
      },
      relations: ['user', 'category'],
    });

    return professionals.map((professional) =>
      this.mapToResponseDto(professional),
    );
  }

  // Find professionals within a certain radius (requires latitude/longitude)
  async findByRadius(
    latitude: number,
    longitude: number,
    radiusKm: number,
  ): Promise<ResponseProfessionalDto[]> {
    const professionals = await this.professionalRepository
      .createQueryBuilder('professional')
      .leftJoinAndSelect('professional.user', 'user')
      .leftJoinAndSelect('professional.category', 'category')
      .where('professional.isActive = :isActive', { isActive: true })
      .andWhere('professional.latitude IS NOT NULL')
      .andWhere('professional.longitude IS NOT NULL')
      .getMany();

    // Filter by distance (Haversine formula)
    const filteredProfessionals = professionals.filter((professional) => {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        professional.latitude,
        professional.longitude,
      );
      return distance <= radiusKm;
    });

    return filteredProfessionals.map((professional) =>
      this.mapToResponseDto(professional),
    );
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in kilometers
    return d;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private mapToResponseDto(
    professional: Professional,
  ): ResponseProfessionalDto {
    return {
      id: professional.id,
      name: professional.name,
      email: professional.email,
      phone: professional.phone,
      profilePhoto: professional.profilePhoto,
      professionalTitle: professional.professionalTitle,
      yearsOfExperience: professional.yearsOfExperience,
      licenseNumber: professional.licenseNumber,
      bio: professional.bio,
      address: professional.address,
      latitude: professional.latitude,
      longitude: professional.longitude,
      workingHours: professional.workingHours,
      services: professional.services,
      languagesSpoken: professional.languagesSpoken,
      consultationType: professional.consultationType,
      userId: professional.userId, // Added missing property
      categoryId: professional.categoryId, // Added missing property
      user: professional.user,
      category: professional.category,
      isActive: professional.isActive,
      createdAt: professional.createdAt,
      updatedAt: professional.updatedAt,
    };
  }

    async findAllProfessionals(page: number = 1, limit: number = 10): Promise<{ professionals: Professional[], total: number }> {
    const [professionals, total] = await this.professionalRepository.findAndCount({
      where: { isActive: true },
      relations: ['user', 'category'],
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: 'DESC' }
    });
    return { professionals, total };
  }
}
