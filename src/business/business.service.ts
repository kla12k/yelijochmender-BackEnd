import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from './entities/business.entity';
import { User } from '../auth/entities/user.entity';
import { Category } from '../category/entities/category.entity';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { UserRoles } from '../auth/enums/user-roles.enum';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import { Logger } from '@nestjs/common';
import { validate } from 'class-validator';
import { BusinessImage } from './entities/business-image.entity';

@Injectable()
export class BusinessService {
  private readonly logger = new Logger(BusinessService.name);

  constructor(
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private configService: ConfigService,
    @InjectRepository(BusinessImage)
    private businessImageRepository: Repository<BusinessImage>,
  ) { }

  // async create(
  //   createBusinessDto: CreateBusinessDto,
  //   userId: string,
  //   file?: Express.Multer.File,
  // ): Promise<Business> {
  //   try {
  //     // Validate DTO
  //     const errors = await validate(createBusinessDto);
  //     if (errors.length > 0) {
  //       this.logger.error(`Validation errors: ${JSON.stringify(errors)}`);
  //       throw new BadRequestException(
  //         errors.map((e) => Object.values(e.constraints)).flat(),
  //       );
  //     }

  //     const { name, phone, website, address, description, categoryId } =
  //       createBusinessDto;
  //     this.logger.log(`Received DTO: ${JSON.stringify(createBusinessDto)}`);
  //     this.logger.log(`userId: ${userId}`);
  //     console.log('name', name);
  //     console.log('phone', phone);
  //     console.log('website', website);
  //     console.log('address', address);
  //     console.log('description', description);
  //     console.log('categoryId', categoryId);

  //     // Validate category
  //     if (!categoryId) {
  //       throw new BadRequestException('Category ID is required');
  //     }

  //     const category = await this.categoryRepository.findOne({
  //       where: { id: String(categoryId) },
  //     });

  //     if (!category) {
  //       this.logger.error(`Category not found for ID: ${categoryId}`);
  //       throw new NotFoundException('Category not found');
  //     }

  //     // Handle image upload
  //     let imageUrl: string | null = null;
  //     if (file) {
  //       const uploadDir = path.join(
  //         process.cwd(),
  //         'uploads',
  //         'business_images',
  //       );
  //       imageUrl = `uploads/business_images/${file.filename}`;

  //       // Ensure directory exists
  //       if (!fs.existsSync(uploadDir)) {
  //         fs.mkdirSync(uploadDir, { recursive: true });
  //       }
  //       this.logger.log(`Image uploaded: ${imageUrl}`);
  //     } else {
  //       throw new BadRequestException('Image is required');
  //     }

  //     // Validate user
  //     const user = await this.userRepository.findOne({ where: { id: userId } });
  //     if (!user) {
  //       throw new NotFoundException('User not found');
  //     }

  //     // Create business - Fix: Use proper entity structure
  //     const business = new Business();
  //     business.name = name;
  //     business.phone = phone;
  //     business.website = website;
  //     business.address = address;
  //     business.description = description;
  //     business.image = imageUrl;
  //     business.ownerId = userId;
  //     business.category = category; // Set the category relation

  //     const savedBusiness = await this.businessRepository.save(business);
  //     this.logger.log(`Business created: ${savedBusiness.id}`);
  //     return savedBusiness;
  //   } catch (error) {
  //     this.logger.error(
  //       `Failed to create business: ${error.message}`,
  //       error.stack,
  //     );
  //     if (
  //       error instanceof NotFoundException ||
  //       error instanceof BadRequestException
  //     ) {
  //       throw error;
  //     }
  //     throw new InternalServerErrorException('Failed to create business');
  //   }
  // }
  async create(
    createBusinessDto: CreateBusinessDto,
    userId: string,
    file?: Express.Multer.File,
    additionalFiles?: Express.Multer.File[],
  ): Promise<Business> {
    try {
      // Validate DTO
      const errors = await validate(createBusinessDto);
      if (errors.length > 0) {
        this.logger.error(`Validation errors: ${JSON.stringify(errors)}`);
        throw new BadRequestException(
          errors.map((e) => Object.values(e.constraints)).flat(),
        );
      }

      // Destructure all fields including the new ones
      const {
        name,
        phone,
        website,
        address,
        description,
        categoryId,
        latitude,
        longitude,
        services,
        hours,
      } = createBusinessDto;

      this.logger.log(`Received DTO: ${JSON.stringify(createBusinessDto)}`);
      this.logger.log(`userId: ${userId}`);

      console.log('name', name);
      console.log('phone', phone);
      console.log('website', website);
      console.log('address', address);
      console.log('description', description);
      console.log('categoryId', categoryId);
      console.log('latitude', latitude);
      console.log('longitude', longitude);
      console.log('services', services);
      console.log('hours', hours);

      // Validate category
      if (!categoryId) {
        throw new BadRequestException('Category ID is required');
      }

      const category = await this.categoryRepository.findOne({
        where: { id: String(categoryId) },
      });

      if (!category) {
        this.logger.error(`Category not found for ID: ${categoryId}`);
        throw new NotFoundException('Category not found');
      }

      // Handle image upload
      let imageUrl: string | null = null;
      if (file) {
        const uploadDir = path.join(
          process.cwd(),
          'uploads',
          'business_images',
        );
        imageUrl = `uploads/business_images/${file.filename}`;

        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        this.logger.log(`Image uploaded: ${imageUrl}`);
      } else {
        throw new BadRequestException('Image is required');
      }

      // Validate user
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Create business with all fields including new ones
      const business = new Business();
      business.name = name;
      business.phone = phone;
      business.website = website || null;
      business.address = address;
      business.description = description || null;
      business.image = imageUrl;
      business.ownerId = userId;
      business.category = category;

      // Set the new fields
      business.latitude = latitude || null;
      business.longitude = longitude || null;
      business.services = services || [];
      business.hours = hours || [];
      business.isActive = true;

      const savedBusiness = await this.businessRepository.save(business);
      this.logger.log(`Business created: ${savedBusiness.id}`);

      if (additionalFiles && additionalFiles.length > 0) {
        const additionalImages = await Promise.all(
          additionalFiles.map(async (file) => {
            const imageUrl = `uploads/business_images/${file.filename}`;
            const businessImage = new BusinessImage();
            businessImage.url = imageUrl;
            businessImage.businessId = savedBusiness.id;
            return this.businessImageRepository.save(businessImage);
          })
        );
      }
      return savedBusiness;
    } catch (error) {
      this.logger.error(
        `Failed to create business: ${error.message}`,
        error.stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create business');
    }
  }

  async findAll(includeInactive: boolean = false): Promise<Business[]> {
    const where = includeInactive ? {} : { isActive: true };
    const businesses = await this.businessRepository.find({
      where,
      relations: ['owner', 'category', 'reviews'],
    });
    this.logger.log(
      `Found ${businesses.length} businesses (includeInactive: ${includeInactive})`,
    );
    return businesses;
  }

  async findOne(id: string): Promise<any> {
    const business = await this.businessRepository.findOne({
      where: { id },
      relations: ['owner', 'category', 'reviews', 'reviews.user'],
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const images = await this.businessImageRepository.find({
      where: { businessId: id },
    });
    console.log(id);
    return {
      ...business,
      images,
    };
  }


  async update(
    id: string,
    updateBusinessDto: UpdateBusinessDto,
    userId: string,
  ): Promise<Business> {
    const business = await this.findOne(id);
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (business.ownerId !== userId && user.role !== UserRoles.ADMIN) {
      throw new ForbiddenException('You can only update your own businesses');
    }

    // Handle category update
    if (updateBusinessDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: String(updateBusinessDto.categoryId) },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      business.category = category;
    }

    // Update other fields
    if (updateBusinessDto.name) business.name = updateBusinessDto.name;
    if (updateBusinessDto.phone) business.phone = updateBusinessDto.phone;
    if (updateBusinessDto.website) business.website = updateBusinessDto.website;
    if (updateBusinessDto.address) business.address = updateBusinessDto.address;
    if (updateBusinessDto.description)
      business.description = updateBusinessDto.description;

    const updatedBusiness = await this.businessRepository.save(business);
    this.logger.log(`Business updated: ${id}`);
    return updatedBusiness;
  }

  async remove(id: string, userId: string): Promise<void> {
    const business = await this.findOne(id);
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (business.ownerId !== userId && user.role !== UserRoles.ADMIN) {
      throw new ForbiddenException('You can only delete your own businesses');
    }

    try {
      // Soft delete the business
      business.isActive = false;
      await this.businessRepository.save(business);
      this.logger.log(`Business soft-deleted: ${id}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete business: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to delete business');
    }
  }

  async findByOwnerId(ownerId: string): Promise<Business[]> {
    const businesses = await this.businessRepository.find({
      where: { ownerId, isActive: true },
      relations: ['category', 'reviews'],
    });
    this.logger.log(
      `Found ${businesses.length} businesses for owner ${ownerId}`,
    );
    return businesses;
  }

  async findByCategory(categoryId: string): Promise<Business[]> {
    const businesses = await this.businessRepository.find({
      where: { category: { id: categoryId }, isActive: true },
      relations: ['owner', 'category', 'reviews'],
    });

    this.logger.log(
      `Found ${businesses.length} businessesddd for category ${categoryId}`,
    );
    return businesses;
  }
}
