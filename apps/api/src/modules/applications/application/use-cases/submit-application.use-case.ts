import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AdoptionApplicationEntity } from '../../domain/entities/adoption-application.entity';
import {
  APPLICATION_REPOSITORY,
  ApplicationRepositoryPort,
} from '../../domain/ports/out/application.repository.port';
import { SubmitApplicationDto } from '../../infrastructure/dtos/submit-application.dto';
import {
  PET_REPOSITORY,
  PetRepositoryPort,
} from '../../../pets/domain/ports/out/pet.repository.port';

@Injectable()
export class SubmitApplicationUseCase {
  constructor(
    @Inject(APPLICATION_REPOSITORY)
    private readonly applicationRepository: ApplicationRepositoryPort,
    @Inject(PET_REPOSITORY)
    private readonly petRepository: PetRepositoryPort,
  ) {}

  async execute(
    userId: string,
    dto: SubmitApplicationDto,
  ): Promise<AdoptionApplicationEntity> {
    const pet = await this.petRepository.findById(dto.petId);
    if (!pet) {
      throw new NotFoundException(`Pet ${dto.petId} not found`);
    }

    if (!pet.isAvailable()) {
      throw new BadRequestException('Pet is not available for adoption');
    }

    const alreadyApplied = await this.applicationRepository.existsByUserAndPet(
      userId,
      dto.petId,
    );
    if (alreadyApplied) {
      throw new ConflictException('You have already applied for this pet');
    }

    return this.applicationRepository.create({
      id: randomUUID(),
      userId,
      petId: dto.petId,
      message: dto.message,
    });
  }
}
