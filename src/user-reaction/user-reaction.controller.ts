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
import { UserReactionService } from './user-reaction.service';
import { CreateUserReactionDto } from './dto/create-user-reaction.dto';
import { UpdateUserReactionDto } from './dto/update-user-reaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Logger } from '@nestjs/common';

@Controller('user-reactions')
export class UserReactionController {
  private readonly logger = new Logger(UserReactionController.name);

  constructor(private readonly userReactionService: UserReactionService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createUserReactionDto: CreateUserReactionDto,
    @Request() req,
  ) {
    this.logger.log(`Creating reaction for user ${req.user.id}`);
    return this.userReactionService.create(createUserReactionDto, req.user.id);
  }

  @Get()
  async findAll() {
    this.logger.log('Fetching all reactions');
    return this.userReactionService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching reaction ${id}`);
    return this.userReactionService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateUserReactionDto: UpdateUserReactionDto,
    @Request() req,
  ) {
    this.logger.log(`Updating reaction ${id} by user ${req.user.id}`);
    return this.userReactionService.update(
      id,
      updateUserReactionDto,
      req.user.id,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Request() req) {
    this.logger.log(`Deleting reaction ${id} by user ${req.user.id}`);
    return this.userReactionService.remove(id, req.user.id);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  async findByUser(@Param('userId') userId: string, @Request() req) {
    this.logger.log(`Fetching reactions for user ${userId}`);
    return this.userReactionService.findByUser(userId);
  }

  @Get('entity/:entityType/:entityId')
  async findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    this.logger.log(`Fetching reactions for ${entityType} ${entityId}`);
    return this.userReactionService.findByEntity(entityType, entityId);
  }
}
