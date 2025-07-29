import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfessionalController } from './profession.controller';
import { ProfessionalService } from './profession.service';
import { Professional } from './entities/profession.entity';
import { User } from '../auth/entities/user.entity';
import { Category } from '../category/entities/category.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Professional, User, Category]),
    AuthModule,
  ],
  controllers: [ProfessionalController],
  providers: [ProfessionalService],
  exports: [ProfessionalService],
})
export class ProfessionalModule {}
