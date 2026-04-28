import { Injectable, Inject } from '@nestjs/common';
import {
  PET_REPOSITORY,
  PaginatedPets,
  PetRepositoryPort,
} from '../../domain/ports/out/pet.repository.port';
import { ListPetsDto } from '../../infrastructure/dtos/list-pets.dto';

@Injectable()
export class ListPetsUseCase {
  constructor(
    @Inject(PET_REPOSITORY)
    private readonly petRepository: PetRepositoryPort,
  ) {}

  execute(dto: ListPetsDto): Promise<PaginatedPets> {
    return this.petRepository.findAll({
      species: dto.species,
      page: dto.page ?? 1,
      limit: dto.limit ?? 10,
    });
  }
}
