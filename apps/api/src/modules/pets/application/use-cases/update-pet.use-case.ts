import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PetEntity } from '../../domain/entities/pet.entity';
import {
  PET_REPOSITORY,
  PetRepositoryPort,
} from '../../domain/ports/out/pet.repository.port';
import { UpdatePetDto } from '../../infrastructure/dtos/update-pet.dto';

@Injectable()
export class UpdatePetUseCase {
  constructor(
    @Inject(PET_REPOSITORY)
    private readonly petRepository: PetRepositoryPort,
  ) {}

  async execute(id: string, dto: UpdatePetDto): Promise<PetEntity> {
    const updated = await this.petRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Pet ${id} not found`);
    }
    return updated;
  }
}
