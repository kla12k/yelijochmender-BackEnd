// src/business/business.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  UploadedFiles,
} from '@nestjs/common';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRoles } from '../auth/enums/user-roles.enum';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Logger } from '@nestjs/common';

@Controller('businesses')
export class BusinessController {
  private readonly logger = new Logger(BusinessController.name);

  constructor(private readonly businessService: BusinessService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'additionalImages', maxCount: 10 }
      ],
      {
        storage: diskStorage({
          destination: './uploads/business_images',
          filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const prefix = file.fieldname === 'additionalImages' ? 'additional-' : '';
            cb(null, `${prefix}${uniqueSuffix}${extname(file.originalname)}`);
          },
        })
      }
    )
  )
  async create(
    @UploadedFiles() files: {
      image?: Express.Multer.File[],
      additionalImages?: Express.Multer.File[]
    },
    @Body() body: any,
    @Request() req,
  ) {
    this.logger.log(`Creating business for user ${req.user.id}`);

    // Create a new DTO and manually parse the JSON strings
    const createBusinessDto = new CreateBusinessDto();

    // Copy basic fields
    createBusinessDto.name = body.name;
    createBusinessDto.phone = body.phone;
    createBusinessDto.website = body.website;
    createBusinessDto.address = body.address;
    createBusinessDto.description = body.description;
    createBusinessDto.categoryId = parseInt(body.categoryId);
    createBusinessDto.latitude = parseFloat(body.latitude);
    createBusinessDto.longitude = parseFloat(body.longitude);

    // Parse JSON strings
    try {
      if (body.services) {
        createBusinessDto.services = JSON.parse(body.services);
        this.logger.log(
          `Parsed services: ${JSON.stringify(createBusinessDto.services)}`,
        );
      }

      if (body.hours) {
        createBusinessDto.hours = JSON.parse(body.hours);
        this.logger.log(
          `Parsed hours: ${JSON.stringify(createBusinessDto.hours)}`,
        );
      }
    } catch (error) {
      this.logger.error(`Error parsing JSON: ${error.message}`);
      throw new BadRequestException(
        'Invalid JSON format for services or hours',
      );
    }

    this.logger.log(`Processed DTO: ${JSON.stringify(createBusinessDto)}`);

    if (files?.image?.[0]) {
      this.logger.log(`Main image: ${files.image[0].originalname}`);
    } else {
      this.logger.log('No main image received');
      throw new BadRequestException('Main image is required');
    }

    if (files?.additionalImages) {
      this.logger.log(`Additional images count: ${files.additionalImages.length}`);
    } else {
      this.logger.log('No additional images received');
    }


    return this.businessService.create(
      createBusinessDto,
      req.user.id,
      files.image[0], // Main image
      files.additionalImages || [] // Additional images (empty array if none)
    );;
  }

  @Get()
  async findAll() {
    this.logger.log('Fetching all active businesses');
    return this.businessService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching business ${id}`);
    return this.businessService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.BUSINESS_OWNER, UserRoles.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
    @Request() req,
  ) {
    this.logger.log(`Updating business ${id} by user ${req.user.id}`);
    return this.businessService.update(id, updateBusinessDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.BUSINESS_OWNER, UserRoles.ADMIN)
  async remove(@Param('id') id: string, @Request() req) {
    this.logger.log(`Deleting business ${id} by user ${req.user.id}`);
    return this.businessService.remove(id, req.user.id);
  }

  @Get('owner/:ownerId')
  @UseGuards(JwtAuthGuard)
  async findByOwnerId(@Param('ownerId') ownerId: string, @Request() req) {
    this.logger.log(
      `Fetching businesses for owner ${ownerId} by user ${req.user.id}`,
    );
    if (req.user.id !== ownerId && req.user.role !== UserRoles.ADMIN) {
      this.logger.warn(`Unauthorized access attempt by user ${req.user.id}`);
      return [];
    }
    return this.businessService.findByOwnerId(ownerId);
  }

  @Get('category/:categoryId')
  async findByCategory(@Param('categoryId') categoryId: string) {
    this.logger.log(`Fetching businesses for category ${categoryId}`);
    return this.businessService.findByCategory(categoryId);
  }
}
