import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PetEntity } from '../../domain/entities/pet.entity';
import {
  PET_REPOSITORY,
  PetRepositoryPort,
} from '../../domain/ports/out/pet.repository.port';
import { CreatePetDto } from '../../infrastructure/dtos/create-pet.dto';

@Injectable()
export class CreatePetUseCase {
  constructor(
    @Inject(PET_REPOSITORY)
    private readonly petRepository: PetRepositoryPort,
  ) {}

  execute(dto: CreatePetDto): Promise<PetEntity> {
    return this.petRepository.create({ id: randomUUID(), ...dto });
  }
}
