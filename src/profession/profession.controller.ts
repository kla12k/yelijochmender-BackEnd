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
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProfessionalService } from './profession.service';
import { CreateProfessionalDto } from './dto/create-profession.dto';
import { UpdateProfessionDto } from './dto/update-profession.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRoles } from '../auth/enums/user-roles.enum';
import { Logger } from '@nestjs/common';

@Controller('professionals')
export class ProfessionalController {
  private readonly logger = new Logger(ProfessionalController.name);
  constructor(private readonly professionalService: ProfessionalService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRoles.PROFESSIONAL, UserRoles.ADMIN)
  @UseInterceptors(
    FileInterceptor('profilePhoto', {
      storage: diskStorage({
        destination: './uploads/professionals',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `professional-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async create(
    @Body() body: any,
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.logger.log('this our body of profession', body);

    // Create a DTO for the professional data
    const createProfessionalDto = new CreateProfessionalDto();

    // Copy ALL required fields from body to DTO

    createProfessionalDto.name = body.name;
    createProfessionalDto.email = body.email;
    createProfessionalDto.phone = body.phone;
    createProfessionalDto.professionalTitle = body.professionalTitle;
    createProfessionalDto.categoryId = body.categoryId;

    // Optional fields
    if (body.licenseNumber)
      createProfessionalDto.licenseNumber = body.licenseNumber;
    if (body.bio) createProfessionalDto.bio = body.bio;
    if (body.address) createProfessionalDto.address = body.address;
    if (body.consultationType)
      createProfessionalDto.consultationType = body.consultationType;

    // Parse numbers properly
    if (body.latitude)
      createProfessionalDto.latitude = parseFloat(body.latitude);
    if (body.longitude)
      createProfessionalDto.longitude = parseFloat(body.longitude);
    if (body.yearsOfExperience)
      createProfessionalDto.yearsOfExperience = parseInt(
        body.yearsOfExperience,
      );

    // Handle arrays (if they come as strings, parse them)
    if (body.languagesSpoken) {
      if (typeof body.languagesSpoken === 'string') {
        createProfessionalDto.languagesSpoken = body.languagesSpoken.split(',');
      } else {
        createProfessionalDto.languagesSpoken = body.languagesSpoken;
      }
    }

    // Handle complex objects (workingHours, services)
    if (body.workingHours) {
      if (typeof body.workingHours === 'string') {
        createProfessionalDto.workingHours = JSON.parse(body.workingHours);
      } else {
        createProfessionalDto.workingHours = body.workingHours;
      }
    }

    if (body.services) {
      if (typeof body.services === 'string') {
        createProfessionalDto.services = JSON.parse(body.services);
      } else {
        createProfessionalDto.services = body.services;
      }
    }

    try {
      // Add the profile photo path to the DTO if a file was uploaded
      if (file) {
        createProfessionalDto.profilePhoto = file.path;
      }

      console.log('Creating professional with data:', createProfessionalDto);
      console.log('User ID:', req.user.id);

      return await this.professionalService.create(
        createProfessionalDto,
        req.user.id,
      );
    } catch (error) {
      console.error('Error creating professional:', error);
      throw error;
    }
  }

  @Get()
  findAll() {
    return this.professionalService.findAll();
  }

  @Get('search/radius')
  findByRadius(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius: number,
  ) {
    return this.professionalService.findByRadius(latitude, longitude, radius);
  }

  @Get('search/consultation-type/:type')
  findByConsultationType(@Param('type') type: string) {
    return this.professionalService.findByConsultationType(type);
  }

  @Get('search/title/:title')
  findByProfessionalTitle(@Param('title') title: string) {
    return this.professionalService.findByProfessionalTitle(title);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.professionalService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.PROFESSIONAL, UserRoles.ADMIN)
  @UseInterceptors(
    FileInterceptor('profilePhoto', {
      storage: diskStorage({
        destination: './uploads/professionals',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `professional-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateProfessionalDto: UpdateProfessionDto,
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Add the profile photo path to the DTO if a file was uploaded
    if (file) {
      updateProfessionalDto.profilePhoto = file.path;
    }

    return this.professionalService.update(
      id,
      updateProfessionalDto,
      req.user.id,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.PROFESSIONAL, UserRoles.ADMIN)
  remove(@Param('id') id: string, @Request() req) {
    return this.professionalService.remove(id, req.user.id);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.professionalService.findByUserId(userId);
  }

  @Get('category/:categoryId')
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.professionalService.findByCategory(categoryId);
  }

  @Get('location/:address')
  findByLocation(@Param('address') address: string) {
    return this.professionalService.findByLocation(address);
  }

 
  @Get('list/all')
  async findAllProfessionals(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    const pageNumber = Math.max(1, page); // Ensure page is at least 1
    const limitNumber = Math.min(Math.max(1, limit), 100); // Limit max to 100
    return this.professionalService.findAllProfessionals(pageNumber, limitNumber);
  }
}
