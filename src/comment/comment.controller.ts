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
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Logger } from '@nestjs/common';

@Controller('comments')
export class CommentController {
  private readonly logger = new Logger(CommentController.name);

  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    this.logger.log(`Creating comment for user ${req.user.id}`);
    return this.commentService.create(createCommentDto, req.user.id);
  }

  @Get()
  async findAll() {
    this.logger.log('Fetching all active comments');
    return this.commentService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching comment ${id}`);
    return this.commentService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req,
  ) {
    this.logger.log(`Updating comment ${id} by user ${req.user.id}`);
    return this.commentService.update(id, updateCommentDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Request() req) {
    this.logger.log(`Deleting comment ${id} by user ${req.user.id}`);
    return this.commentService.remove(id, req.user.id);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  async findByUser(@Param('userId') userId: string, @Request() req) {
    this.logger.log(`Fetching comments for user ${userId}`);
    return this.commentService.findByUser(userId);
  }

  @Get('entity/:entityType/:entityId')
  async findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    this.logger.log(`Fetching comments for ${entityType} ${entityId}`);
    return this.commentService.findByEntity(entityType, entityId);
  }
}
