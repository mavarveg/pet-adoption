import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PetEntity } from '../../domain/entities/pet.entity';
import {
  PET_REPOSITORY,
  PetRepositoryPort,
} from '../../domain/ports/out/pet.repository.port';

@Injectable()
export class GetPetUseCase {
  constructor(
    @Inject(PET_REPOSITORY)
    private readonly petRepository: PetRepositoryPort,
  ) {}

  async execute(id: string): Promise<PetEntity> {
    const pet = await this.petRepository.findById(id);
    if (!pet) {
      throw new NotFoundException(`Pet ${id} not found`);
    }
    return pet;
  }
}
