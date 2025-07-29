import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Logger,
  Query,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UserRoles } from '../auth/enums/user-roles.enum';

@Controller('articles')
export class ArticleController {
  private readonly logger = new Logger(ArticleController.name);

  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/article_images',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        callback(null, true);
      },
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Request() req,
  ) {
    this.logger.log(`Creating article for user ${req.user.id}`);

    // Create a new DTO and manually parse the JSON strings
    const createArticleDto = new CreateArticleDto();

    // Copy basic fields
    createArticleDto.title = body.title;
    createArticleDto.content = body.content;
    createArticleDto.excerpt = body.excerpt;
    createArticleDto.categoryId = parseInt(body.categoryId);

    // Parse JSON strings
    try {
      if (body.tags) {
        createArticleDto.tags = JSON.parse(body.tags);
        this.logger.log(
          `Parsed tags: ${JSON.stringify(createArticleDto.tags)}`,
        );
      }
    } catch (error) {
      this.logger.error(`Error parsing JSON: ${error.message}`);
      throw new BadRequestException('Invalid JSON format for tags');
    }

    this.logger.log(`Processed DTO: ${JSON.stringify(createArticleDto)}`);

    if (file) {
      this.logger.log(
        `Received file: ${file.originalname}, size: ${file.size}`,
      );
    } else {
      this.logger.log('No file received');
    }

    return this.articleService.create(createArticleDto, req.user.id, file);
  }

  @Get()
  async findAll() {
    this.logger.log('Fetching all published articles');
    return this.articleService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching article ${id}`);
    return this.articleService.findOne(id);
  }

  @Get('author/:authorId')
  @UseGuards(JwtAuthGuard)
  async findByAuthorId(@Param('authorId') authorId: string, @Request() req) {
    this.logger.log(
      `Fetching articles for author ${authorId} by user ${req.user.id}`,
    );
    if (req.user.id !== authorId && req.user.role !== UserRoles.ADMIN) {
      this.logger.warn(`Unauthorized access attempt by user ${req.user.id}`);
      return [];
    }
    return this.articleService.findByAuthorId(authorId);
  }

  @Get('category/:categoryId')
  async findByCategory(@Param('categoryId') categoryId: string) {
    this.logger.log(`Fetching articles for category ${categoryId}`);
    return this.articleService.findByCategory(categoryId);
  }

  @Get('list/all')
    async findAllArticle(
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10
    ) {
      const pageNumber = Math.max(1, page); // Ensure page is at least 1
      const limitNumber = Math.min(Math.max(1, limit), 100); // Limit max to 100
      return this.articleService.findAllArticle(pageNumber, limitNumber);
    }
}
