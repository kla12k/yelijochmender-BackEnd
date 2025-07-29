// import {
//   Injectable,
//   NotFoundException,
//   ConflictException,
//   InternalServerErrorException,
//   ForbiddenException,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { UserReaction } from './entities/user-reaction.entity';
// import { User } from '../auth/entities/user.entity';
// import { CreateUserReactionDto } from './dto/create-user-reaction.dto';
// import { UpdateUserReactionDto } from './dto/update-user-reaction.dto';
// import { Logger } from '@nestjs/common';

// @Injectable()
// export class UserReactionService {
//   private readonly logger = new Logger(UserReactionService.name);

//   constructor(
//     @InjectRepository(UserReaction)
//     private userReactionRepository: Repository<UserReaction>,
//     @InjectRepository(User)
//     private userRepository: Repository<User>,
//   ) {}

//   async create(
//     createUserReactionDto: CreateUserReactionDto,
//     userId: string,
//   ): Promise<UserReaction> {
//     try {
//       const { entityType, entityId, reactionType } = createUserReactionDto;

//       // Validate user exists
//       const user = await this.userRepository.findOne({ where: { id: userId } });
//       if (!user) {
//         throw new NotFoundException('User not found');
//       }

//       // Check if reaction already exists
//       const existingReaction = await this.userReactionRepository.findOne({
//         where: {
//           userId,
//           entityType,
//           entityId,
//           reactionType,
//         },
//       });

//       if (existingReaction) {
//         throw new ConflictException('Reaction already exists');
//       }

//       // Create reaction
//       const reaction = new UserReaction();
//       reaction.userId = userId;
//       reaction.entityType = entityType;
//       reaction.entityId = entityId;
//       reaction.reactionType = reactionType;
//       reaction.user = user;

//       const savedReaction = await this.userReactionRepository.save(reaction);
//       this.logger.log(`Reaction created: ${savedReaction.id}`);
//       return savedReaction;
//     } catch (error) {
//       this.logger.error(
//         `Failed to create reaction: ${error.message}`,
//         error.stack,
//       );
//       if (
//         error instanceof NotFoundException ||
//         error instanceof ConflictException
//       ) {
//         throw error;
//       }
//       throw new InternalServerErrorException('Failed to create reaction');
//     }
//   }

//   async findAll(): Promise<UserReaction[]> {
//     const reactions = await this.userReactionRepository.find({
//       relations: ['user'],
//     });
//     this.logger.log(`Found ${reactions.length} reactions`);
//     return reactions;
//   }

//   async findOne(id: string): Promise<UserReaction> {
//     const reaction = await this.userReactionRepository.findOne({
//       where: { id },
//       relations: ['user'],
//     });
//     if (!reaction) {
//       throw new NotFoundException('Reaction not found');
//     }
//     return reaction;
//   }

//   async update(
//     id: string,
//     updateUserReactionDto: UpdateUserReactionDto,
//     userId: string,
//   ): Promise<UserReaction> {
//     const reaction = await this.findOne(id);

//     if (reaction.userId !== userId) {
//       throw new ForbiddenException('You can only update your own reactions');
//     }

//     // Update fields
//     if (updateUserReactionDto.reactionType) {
//       reaction.reactionType = updateUserReactionDto.reactionType;
//     }

//     const updatedReaction = await this.userReactionRepository.save(reaction);
//     this.logger.log(`Reaction updated: ${id}`);
//     return updatedReaction;
//   }

//   async remove(id: string, userId: string): Promise<void> {
//     const reaction = await this.findOne(id);

//     if (reaction.userId !== userId) {
//       throw new ForbiddenException('You can only delete your own reactions');
//     }

//     try {
//       await this.userReactionRepository.remove(reaction);
//       this.logger.log(`Reaction deleted: ${id}`);
//     } catch (error) {
//       this.logger.error(
//         `Failed to delete reaction: ${error.message}`,
//         error.stack,
//       );
//       throw new InternalServerErrorException('Failed to delete reaction');
//     }
//   }

//   async findByUser(userId: string): Promise<UserReaction[]> {
//     const reactions = await this.userReactionRepository.find({
//       where: { userId },
//       relations: ['user'],
//     });
//     this.logger.log(`Found ${reactions.length} reactions for user ${userId}`);
//     return reactions;
//   }

//   async findByEntity(
//     entityType: string,
//     entityId: string,
//   ): Promise<UserReaction[]> {
//     const reactions = await this.userReactionRepository.find({
//       where: { entityType: entityType as any, entityId },
//       relations: ['user'],
//     });
//     this.logger.log(
//       `Found ${reactions.length} reactions for ${entityType} ${entityId}`,
//     );
//     return reactions;
//   }
// }
import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  UserReaction,
  EntityType,
  ReactionType,
} from './entities/user-reaction.entity';
import { User } from '../auth/entities/user.entity';
import { Article } from '../article/entities/article.entity';
import { Business } from '../business/entities/business.entity';
import { Professional } from '../profession/entities/profession.entity';
import { Event } from '../event/entities/event.entity';
import { CreateUserReactionDto } from './dto/create-user-reaction.dto';
import { UpdateUserReactionDto } from './dto/update-user-reaction.dto';
import { Logger } from '@nestjs/common';

@Injectable()
export class UserReactionService {
  private readonly logger = new Logger(UserReactionService.name);

  constructor(
    @InjectRepository(UserReaction)
    private userReactionRepository: Repository<UserReaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    // ✅ ADD: Inject all entity repositories for counter updates
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    @InjectRepository(Professional)
    private professionalRepository: Repository<Professional>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async create(
    createUserReactionDto: CreateUserReactionDto,
    userId: string,
  ): Promise<UserReaction> {
    // ✅ CHANGE: Use database transaction for consistency
    return await this.userReactionRepository.manager.transaction(
      async (manager) => {
        try {
          const { entityType, entityId, reactionType } = createUserReactionDto;

          // Validate user exists
          const user = await manager.findOne(User, { where: { id: userId } });
          if (!user) {
            throw new NotFoundException('User not found');
          }

          // Check if reaction already exists
          const existingReaction = await manager.findOne(UserReaction, {
            where: {
              userId,
              entityType,
              entityId,
              reactionType,
            },
          });

          if (existingReaction) {
            throw new ConflictException('Reaction already exists');
          }

          // Create reaction
          const reaction = new UserReaction();
          reaction.userId = userId;
          reaction.entityType = entityType;
          reaction.entityId = entityId;
          reaction.reactionType = reactionType;
          reaction.user = user;

          const savedReaction = await manager.save(UserReaction, reaction);

          // ✅ NEW: Update counter immediately
          await this.updateEntityCounter(
            manager,
            entityType,
            entityId,
            reactionType,
            'INCREMENT',
          );

          this.logger.log(
            `Reaction created and counter updated: ${savedReaction.id}`,
          );
          return savedReaction;
        } catch (error) {
          this.logger.error(
            `Failed to create reaction: ${error.message}`,
            error.stack,
          );
          if (
            error instanceof NotFoundException ||
            error instanceof ConflictException
          ) {
            throw error;
          }
          throw new InternalServerErrorException('Failed to create reaction');
        }
      },
    );
  }

  // ✅ CHANGE: Update remove method to handle counter updates
  async remove(id: string, userId: string): Promise<void> {
    return await this.userReactionRepository.manager.transaction(
      async (manager) => {
        try {
          const reaction = await manager.findOne(UserReaction, {
            where: { id },
            relations: ['user'],
          });

          if (!reaction) {
            throw new NotFoundException('Reaction not found');
          }

          if (reaction.userId !== userId) {
            throw new ForbiddenException(
              'You can only delete your own reactions',
            );
          }

          // Remove reaction
          await manager.remove(UserReaction, reaction);

          // ✅ NEW: Update counter immediately
          await this.updateEntityCounter(
            manager,
            reaction.entityType,
            reaction.entityId,
            reaction.reactionType,
            'DECREMENT',
          );

          this.logger.log(`Reaction deleted and counter updated: ${id}`);
        } catch (error) {
          this.logger.error(
            `Failed to delete reaction: ${error.message}`,
            error.stack,
          );
          if (
            error instanceof NotFoundException ||
            error instanceof ForbiddenException
          ) {
            throw error;
          }
          throw new InternalServerErrorException('Failed to delete reaction');
        }
      },
    );
  }

  // ✅ CHANGE: Update the update method to handle counter changes
  async update(
    id: string,
    updateUserReactionDto: UpdateUserReactionDto,
    userId: string,
  ): Promise<UserReaction> {
    return await this.userReactionRepository.manager.transaction(
      async (manager) => {
        const reaction = await manager.findOne(UserReaction, {
          where: { id },
          relations: ['user'],
        });

        if (!reaction) {
          throw new NotFoundException('Reaction not found');
        }

        if (reaction.userId !== userId) {
          throw new ForbiddenException(
            'You can only update your own reactions',
          );
        }

        // If reaction type is changing, update counters
        if (
          updateUserReactionDto.reactionType &&
          updateUserReactionDto.reactionType !== reaction.reactionType
        ) {
          // Decrement old reaction type
          await this.updateEntityCounter(
            manager,
            reaction.entityType,
            reaction.entityId,
            reaction.reactionType,
            'DECREMENT',
          );

          // Update reaction type
          reaction.reactionType = updateUserReactionDto.reactionType;

          // Increment new reaction type
          await this.updateEntityCounter(
            manager,
            reaction.entityType,
            reaction.entityId,
            reaction.reactionType,
            'INCREMENT',
          );
        }

        const updatedReaction = await manager.save(UserReaction, reaction);
        this.logger.log(`Reaction updated: ${id}`);
        return updatedReaction;
      },
    );
  }

  // ✅ NEW: Private method to update entity counters
  private async updateEntityCounter(
    manager: any,
    entityType: EntityType,
    entityId: string,
    reactionType: ReactionType,
    operation: 'INCREMENT' | 'DECREMENT',
  ): Promise<void> {
    const increment = operation === 'INCREMENT' ? 1 : -1;
    const field =
      reactionType === ReactionType.LIKE ? 'likeCount' : 'favoriteCount';

    try {
      switch (entityType) {
        case EntityType.ARTICLE:
          await manager.increment(Article, { id: entityId }, field, increment);
          this.logger.log(`${operation} ${field} for article ${entityId}`);
          break;

        case EntityType.BUSINESS:
          await manager.increment(Business, { id: entityId }, field, increment);
          this.logger.log(`${operation} ${field} for business ${entityId}`);
          break;

        case EntityType.PROFESSIONAL:
          await manager.increment(
            Professional,
            { id: entityId },
            field,
            increment,
          );
          this.logger.log(`${operation} ${field} for professional ${entityId}`);
          break;

        case EntityType.EVENT:
          await manager.increment(Event, { id: entityId }, field, increment);
          this.logger.log(`${operation} ${field} for event ${entityId}`);
          break;

        default:
          this.logger.warn(`Unknown entity type: ${entityType}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to update counter for ${entityType} ${entityId}: ${error.message}`,
      );
      // Don't throw error here - we don't want counter update failures to break the main operation
    }
  }

  // ✅ NEW: Method to toggle reaction (like/unlike, favorite/unfavorite)
  async toggleReaction(
    entityType: EntityType,
    entityId: string,
    reactionType: ReactionType,
    userId: string,
  ): Promise<{ action: 'added' | 'removed'; reaction?: UserReaction }> {
    return await this.userReactionRepository.manager.transaction(
      async (manager) => {
        // Check if reaction exists
        const existingReaction = await manager.findOne(UserReaction, {
          where: {
            userId,
            entityType,
            entityId,
            reactionType,
          },
        });

        if (existingReaction) {
          // Remove existing reaction
          await manager.remove(UserReaction, existingReaction);

          // Update counter
          await this.updateEntityCounter(
            manager,
            entityType,
            entityId,
            reactionType,
            'DECREMENT',
          );

          this.logger.log(`Reaction removed: ${existingReaction.id}`);
          return { action: 'removed' };
        } else {
          // Create new reaction
          const reaction = new UserReaction();
          reaction.userId = userId;
          reaction.entityType = entityType;
          reaction.entityId = entityId;
          reaction.reactionType = reactionType;

          const savedReaction = await manager.save(UserReaction, reaction);

          // Update counter
          await this.updateEntityCounter(
            manager,
            entityType,
            entityId,
            reactionType,
            'INCREMENT',
          );

          this.logger.log(`Reaction added: ${savedReaction.id}`);
          return { action: 'added', reaction: savedReaction };
        }
      },
    );
  }

  // Keep your existing methods unchanged
  async findAll(): Promise<UserReaction[]> {
    const reactions = await this.userReactionRepository.find({
      relations: ['user'],
    });
    this.logger.log(`Found ${reactions.length} reactions`);
    return reactions;
  }

  async findOne(id: string): Promise<UserReaction> {
    const reaction = await this.userReactionRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!reaction) {
      throw new NotFoundException('Reaction not found');
    }
    return reaction;
  }

  async findByUser(userId: string): Promise<UserReaction[]> {
    const reactions = await this.userReactionRepository.find({
      where: { userId },
      relations: ['user'],
    });
    this.logger.log(`Found ${reactions.length} reactions for user ${userId}`);
    return reactions;
  }

  async findByEntity(
    entityType: string,
    entityId: string,
  ): Promise<UserReaction[]> {
    const reactions = await this.userReactionRepository.find({
      where: { entityType: entityType as any, entityId },
      relations: ['user'],
    });
    this.logger.log(
      `Found ${reactions.length} reactions for ${entityType} ${entityId}`,
    );
    return reactions;
  }
}
