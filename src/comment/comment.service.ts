import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { User } from '../auth/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Logger } from '@nestjs/common';

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);

  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
    userId: string,
  ): Promise<Comment> {
    try {
      const { entityType, entityId, content } = createCommentDto;

      // Validate user exists
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Create comment
      const comment = new Comment();
      comment.userId = userId;
      comment.entityType = entityType;
      comment.entityId = entityId;
      comment.content = content;
      comment.user = user;

      const savedComment = await this.commentRepository.save(comment);
      this.logger.log(`Comment created: ${savedComment.id}`);
      return savedComment;
    } catch (error) {
      this.logger.error(
        `Failed to create comment: ${error.message}`,
        error.stack,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create comment');
    }
  }

  async findAll(includeInactive: boolean = false): Promise<Comment[]> {
    const where = includeInactive ? {} : { isActive: true };
    const comments = await this.commentRepository.find({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    this.logger.log(
      `Found ${comments.length} comments (includeInactive: ${includeInactive})`,
    );
    return comments;
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
    userId: string,
  ): Promise<Comment> {
    const comment = await this.findOne(id);

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    // Update fields
    if (updateCommentDto.content) {
      comment.content = updateCommentDto.content;
    }

    const updatedComment = await this.commentRepository.save(comment);
    this.logger.log(`Comment updated: ${id}`);
    return updatedComment;
  }

  async remove(id: string, userId: string): Promise<void> {
    const comment = await this.findOne(id);

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    try {
      // Soft delete
      comment.isActive = false;
      await this.commentRepository.save(comment);
      this.logger.log(`Comment soft-deleted: ${id}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete comment: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to delete comment');
    }
  }

  async findByUser(userId: string): Promise<Comment[]> {
    const comments = await this.commentRepository.find({
      where: { userId, isActive: true },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    this.logger.log(`Found ${comments.length} comments for user ${userId}`);
    return comments;
  }

  async findByEntity(entityType: string, entityId: string): Promise<Comment[]> {
    const comments = await this.commentRepository.find({
      where: { entityType: entityType as any, entityId, isActive: true },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    this.logger.log(
      `Found ${comments.length} comments for ${entityType} ${entityId}`,
    );
    return comments;
  }
}
