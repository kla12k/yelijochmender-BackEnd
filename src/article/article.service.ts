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
import { Article, ArticleStatus } from './entities/article.entity';
import { User } from '../auth/entities/user.entity';
import { Category } from '../category/entities/category.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { UserRoles } from '../auth/enums/user-roles.enum';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import { Logger } from '@nestjs/common';
import { validate } from 'class-validator';

@Injectable()
export class ArticleService {
  private readonly logger = new Logger(ArticleService.name);

  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private configService: ConfigService,
  ) {}

  async create(
    createArticleDto: CreateArticleDto,
    userId: string,
    file?: Express.Multer.File,
  ): Promise<Article> {
    try {
      // Validate DTO
      const errors = await validate(createArticleDto);
      if (errors.length > 0) {
        this.logger.error(`Validation errors: ${JSON.stringify(errors)}`);
        throw new BadRequestException(
          errors.map((e) => Object.values(e.constraints)).flat(),
        );
      }

      const { title, content, excerpt, categoryId, tags } = createArticleDto;

      this.logger.log(`Received DTO: ${JSON.stringify(createArticleDto)}`);
      this.logger.log(`userId: ${userId}`);

      console.log('title', title);
      console.log('content', content);
      console.log('excerpt', excerpt);
      console.log('categoryId', categoryId);
      console.log('tags', tags);

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

      // Handle featured image upload
      let featuredImageUrl: string | null = null;
      if (file) {
        const uploadDir = path.join(process.cwd(), 'uploads', 'article_images');
        featuredImageUrl = `uploads/article_images/${file.filename}`;

        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        this.logger.log(`Featured image uploaded: ${featuredImageUrl}`);
      }

      // Validate user
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Generate slug from title
      const slug = this.generateSlug(title);

      // Check if slug already exists
      const existingArticle = await this.articleRepository.findOne({
        where: { slug },
      });
      if (existingArticle) {
        throw new ConflictException('Article with this title already exists');
      }

      // Create article
      const article = new Article();
      article.title = title;
      article.content = content;
      article.excerpt = excerpt || null;
      article.slug = slug;
      article.featuredImage = featuredImageUrl;
      article.authorId = userId;
      article.category = category;
      article.tags = tags || [];
      article.status = ArticleStatus.PUBLISHED;
      article.publishedAt = new Date();
      article.isActive = true;

      const savedArticle = await this.articleRepository.save(article);
      this.logger.log(`Article created: ${savedArticle.id}`);
      return savedArticle;
    } catch (error) {
      this.logger.error(
        `Failed to create article: ${error.message}`,
        error.stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create article');
    }
  }

  async findAll(includeInactive: boolean = false): Promise<Article[]> {
    const where = includeInactive
      ? {}
      : { isActive: true, status: ArticleStatus.PUBLISHED };

    const articles = await this.articleRepository.find({
      where,
      relations: ['author', 'category'],
      order: { publishedAt: 'DESC' },
    });

    this.logger.log(
      `Found ${articles.length} articles (includeInactive: ${includeInactive})`,
    );
    return articles;
  }

  async findOne(id: string): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['author', 'category'],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Increment view count
    article.viewCount += 1;
    await this.articleRepository.save(article);

    return article;
  }

  async findByAuthorId(authorId: string): Promise<Article[]> {
    const articles = await this.articleRepository.find({
      where: { authorId, isActive: true },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });

    this.logger.log(`Found ${articles.length} articles for author ${authorId}`);
    return articles;
  }

  async findByCategory(categoryId: string): Promise<Article[]> {
    const articles = await this.articleRepository.find({
      where: {
        category: { id: categoryId },
        isActive: true,
        status: ArticleStatus.PUBLISHED,
      },
      relations: ['author', 'category'],
      order: { publishedAt: 'DESC' },
    });

    this.logger.log(
      `Found ${articles.length} articles for category ${categoryId}`,
    );
    return articles;
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim(); // Remove leading/trailing hyphens
  }

  async findAllArticle(page: number = 1, limit: number = 10): Promise<{ articles: Article[], total: number }> {
    const [articles, total] = await this.articleRepository.findAndCount({
      where: { isActive: true },
      relations: ['author', 'category'],
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: 'DESC' }
    });
    return { articles, total };
  }
}
