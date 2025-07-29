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
  Query,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRoles } from '../auth/enums/user-roles.enum';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.EVENT_ORGANIZER, UserRoles.ADMIN)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'additionalImages', maxCount: 10 }
    ], {
      storage: diskStorage({
        destination: './uploads/events',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const prefix = file.fieldname === 'additionalImages' ? 'additionalEvent-' : 'event-';
          cb(null, `${prefix}${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Accept only images
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  
  create(
    @Body() createEventDto: CreateEventDto,
    @Request() req,
    @UploadedFiles() files: {
      image?: Express.Multer.File[],
      additionalImages?: Express.Multer.File[]
    },
  ) {
    if (files?.image?.[0]) {
      createEventDto.image = files.image[0].path
    }
   
    return this.eventService.create(createEventDto, req.user.id, files.additionalImages || []);
  }

  // Update method should also handle file uploads
  @Patch(':id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Roles(UserRoles.EVENT_ORGANIZER, UserRoles.ADMIN)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/events',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `event-${uniqueSuffix}${ext}`);
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
    @Body() updateEventDto: UpdateEventDto,
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Add the image path to the DTO if a file was uploaded
    if (file) {
      updateEventDto.image = file.path;
    }
    return this.eventService.update(id, updateEventDto, req.user.id);
  }

  // Keep the rest of your controller methods unchanged
  @Get()
  findAll() {
    return this.eventService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.EVENT_ORGANIZER, UserRoles.ADMIN)
  remove(@Param('id') id: string, @Request() req) {
    return this.eventService.remove(id, req.user.id);
  }

  @Get('organizer/:organizerId')
  @UseGuards(JwtAuthGuard)
  findByOrganizerId(@Param('organizerId') organizerId: string, @Request() req) {
    // Only allow users to see their own events or admins to see any
    if (req.user.id !== organizerId && req.user.role !== UserRoles.ADMIN) {
      return [];
    }
    return this.eventService.findByOrganizerId(organizerId);
  }

  @Get('category/:categoryId')
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.eventService.findByCategory(categoryId);
  }
  @Get('list/all')
  async findAllEvents(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    const pageNumber = Math.max(1, page); // Ensure page is at least 1
    const limitNumber = Math.min(Math.max(1, limit), 100); // Limit max to 100

    return this.eventService.findAllEvents(pageNumber, limitNumber);
  }
}
