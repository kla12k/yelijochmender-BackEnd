import { Repository } from 'typeorm';
import { Professional } from './entities/profession.entity';
import { InjectRepository } from '@nestjs/typeorm';

export class ProfessionalRepository extends Repository<Professional> {
  constructor(
    @InjectRepository(Professional)
    private professionalRepository: Repository<Professional>,
  ) {
    super(
      professionalRepository.target,
      professionalRepository.manager,
      professionalRepository.queryRunner,
    );
  }

  async findByUserId(userId: string): Promise<Professional[]> {
    return this.find({
      where: { userId: userId, isActive: true },
      relations: ['user', 'category'],
    });
  }

  async findByCategory(categoryId: string): Promise<Professional[]> {
    return this.find({
      where: { categoryId: categoryId, isActive: true },
      relations: ['user', 'category'],
    });
  }

  async findByConsultationType(
    consultationType: string,
  ): Promise<Professional[]> {
    return this.find({
      where: { consultationType: consultationType, isActive: true },
      relations: ['user', 'category'],
    });
  }
}
