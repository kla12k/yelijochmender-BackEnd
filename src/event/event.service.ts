// Event service implementation
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { User } from '../auth/entities/user.entity';
import { Category } from '../category/entities/category.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UserRoles } from '../auth/enums/user-roles.enum';
import { EventImage } from './entities/event-image.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(EventImage)
    private eventImageRepository: Repository<EventImage>,
  ) { }

  async create(createEventDto: CreateEventDto, userId: string, additionalFiles?: Express.Multer.File[]): Promise<Event> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
console.log('ddddd',user);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      user.role !== UserRoles.EVENT_ORGANIZER &&
      user.role !== UserRoles.ADMIN
    ) {
      throw new ForbiddenException('Only event organizers can create events');
    }

    const category = await this.categoryRepository.findOne({
      where: { id: createEventDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const event = this.eventRepository.create({
      ...createEventDto,
      organizer: user,
      category,
    });

    const savedEvent = await this.eventRepository.save(event);
    // Process additional images
    if (additionalFiles && additionalFiles.length > 0) {
      await Promise.all(
        additionalFiles.map(async (file) => {
          const imageUrl = `uploads/events/${file.filename}`;
          const eventImage = new EventImage();
          eventImage.url = imageUrl;
          eventImage.eventId = savedEvent.id;
          await this.eventImageRepository.save(eventImage);
        }),
      );
    }
    return savedEvent;
  }

  async findAll(): Promise<Event[]> {
    return this.eventRepository.find({
      where: { isActive: true },
      relations: ['organizer', 'category'],
    });
  }

  async findOne(id: string): Promise<any> {
    const event = await this.eventRepository.findOne({
      where: { id, isActive: true },
      relations: ['organizer', 'category'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }
    const images = await this.eventImageRepository.find({
      where: { eventId: id },
    });

    return {
      ...event,
      images
    };
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    userId: string,
  ): Promise<Event> {
    const event = await this.findOne(id);
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (event.organizerId !== userId && user.role !== UserRoles.ADMIN) {
      throw new ForbiddenException('You can only update your own events');
    }

    if (updateEventDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateEventDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      event.category = category;
    }

    Object.assign(event, updateEventDto);
    return this.eventRepository.save(event);
  }

  async remove(id: string, userId: string): Promise<void> {
    const event = await this.findOne(id);
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (event.organizerId !== userId && user.role !== UserRoles.ADMIN) {
      throw new ForbiddenException('You can only delete your own events');
    }

    // Soft delete by setting isActive to false
    event.isActive = false;
    await this.eventRepository.save(event);
  }

  //Filter events by organizer: Users can see all events created by a specific organizer (identified by organizerId)
  async findByOrganizerId(organizerId: string): Promise<Event[]> {
    return this.eventRepository.find({
      where: {
        organizer: { id: organizerId },
        isActive: true,
      },
      relations: ['category', 'organizer'],
    });
  }

  //Filter events by category: Users can browse events within specific categories (e.g., "Music", "Technology", "Sports")
  async findByCategory(categoryId: string): Promise<Event[]> {
    return this.eventRepository.find({
      where: {
        category: { id: categoryId },
        isActive: true,
      },
      relations: ['organizer', 'category'],
    });
  }

  //Find All Events (Including Inactive)
  async findAllIncludingInactive(): Promise<Event[]> {
    return this.eventRepository.find({
      relations: ['organizer', 'category'],
    });
  }

  async findAllEvents(page: number = 1, limit: number = 10): Promise<{ events: Event[], total: number }> {

    const [events, total] = await this.eventRepository.findAndCount({
      where: { isActive: true },
      relations: ['organizer', 'category'],
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: 'DESC' }
    });

    return { events, total };
  }
}
