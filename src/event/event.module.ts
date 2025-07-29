// Event module configuration
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { Event } from './entities/event.entity';
import { User } from '../auth/entities/user.entity';
import { Category } from '../category/entities/category.entity';
import { AuthModule } from '../auth/auth.module';
import { EventImage } from './entities/event-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, User, Category,EventImage]), AuthModule],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
