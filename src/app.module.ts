import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './config/database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PropertyModule } from './property/property.module';
import { BusinessModule } from './business/business.module';
import { EventModule } from './event/event.module';
import { CategoryModule } from './category/category.module';
import { ReviewModule } from './review/review.module';

import { ProfessionalModule } from './profession/profession.module';
import { ArticleModule } from './article/article.module';
import { UserReactionModule } from './user-reaction/user-reaction.module';
import { CommentModule } from './comment/comment.module';

import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admins.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    PropertyModule,
    BusinessModule,
    EventModule,
    CategoryModule,
    ReviewModule,
    ProfessionalModule,
    ArticleModule,
    UserReactionModule,
    CommentModule,
    UsersModule,
    AdminModule

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
