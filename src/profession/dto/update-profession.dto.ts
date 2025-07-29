import { PartialType } from '@nestjs/mapped-types';
import { CreateProfessionalDto } from './create-profession.dto';

export class UpdateProfessionDto extends PartialType(CreateProfessionalDto) {}
