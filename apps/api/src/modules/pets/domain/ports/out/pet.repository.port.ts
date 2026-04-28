import { TransactionContext } from '../../../../../shared/ports/transaction-manager.port';
import { PetEntity, PetStatus } from '../../entities/pet.entity';

export interface PetListFilters {
  species?: string;
  status?: PetStatus;
  page: number;
  limit: number;
}

export interface PaginatedPets {
  data: PetEntity[];
  total: number;
  page: number;
  limit: number;
}

export interface PetRepositoryPort {
  findAll(filters: PetListFilters): Promise<PaginatedPets>;
  findById(id: string): Promise<PetEntity | null>;
  create(data: {
    id: string;
    name: string;
    species: string;
    breed?: string;
    age?: number;
    description?: string;
    imageUrl?: string;
  }): Promise<PetEntity>;
  update(
    id: string,
    data: Partial<{
      name: string;
      species: string;
      breed: string;
      age: number;
      description: string;
      imageUrl: string;
      status: PetStatus;
    }>,
    ctx?: TransactionContext,
  ): Promise<PetEntity | null>;
}

export const PET_REPOSITORY = Symbol('PET_REPOSITORY');
