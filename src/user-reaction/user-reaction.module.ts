import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserReactionController } from './user-reaction.controller';
import { UserReactionService } from './user-reaction.service';
import { UserReaction } from './entities/user-reaction.entity';
import { User } from '../auth/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { Business } from '../business/entities/business.entity';
import { Professional } from '../profession/entities/profession.entity';
import { Article } from '../article/entities/article.entity';
import { Event } from '../event/entities/event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserReaction,
      User,
      Article,
      Business,
      Professional,
      Event,
    ]),
    AuthModule,
  ],
  controllers: [UserReactionController],
  providers: [UserReactionService],
  exports: [UserReactionService],
})
export class UserReactionModule {}
