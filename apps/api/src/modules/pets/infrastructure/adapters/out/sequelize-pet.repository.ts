import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Transaction } from 'sequelize';
import { PetEntity, PetStatus } from '../../../domain/entities/pet.entity';
import {
  PaginatedPets,
  PetListFilters,
  PetRepositoryPort,
} from '../../../domain/ports/out/pet.repository.port';
import { TransactionContext } from '../../../../../shared/ports/transaction-manager.port';
import { PetModel } from '../../models/pet.model';

@Injectable()
export class SequelizePetRepository implements PetRepositoryPort {
  constructor(
    @InjectModel(PetModel)
    private readonly petModel: typeof PetModel,
  ) {}

  async findAll(filters: PetListFilters): Promise<PaginatedPets> {
    const where: Record<string, unknown> = {};

    if (filters.species) {
      where['species'] = { [Op.iLike]: `%${filters.species}%` };
    }
    if (filters.status) {
      where['status'] = filters.status;
    }

    const offset = (filters.page - 1) * filters.limit;

    const { count, rows } = await this.petModel.findAndCountAll({
      where,
      limit: filters.limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      data: rows.map((r) => this.toEntity(r)),
      total: count,
      page: filters.page,
      limit: filters.limit,
    };
  }

  async findById(id: string): Promise<PetEntity | null> {
    const model = await this.petModel.findByPk(id);
    return model ? this.toEntity(model) : null;
  }

  async create(data: {
    id: string;
    name: string;
    species: string;
    breed?: string;
    age?: number;
    description?: string;
    imageUrl?: string;
  }): Promise<PetEntity> {
    const model = await this.petModel.create({
      id: data.id,
      name: data.name,
      species: data.species,
      breed: data.breed ?? null,
      age: data.age ?? null,
      description: data.description ?? null,
      imageUrl: data.imageUrl ?? null,
    });
    return this.toEntity(model);
  }

  async update(
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
  ): Promise<PetEntity | null> {
    const t = ctx as unknown as Transaction | undefined;
    const model = await this.petModel.findByPk(id, { transaction: t });
    if (!model) return null;
    await model.update(data, { transaction: t });
    return this.toEntity(model);
  }

  private toEntity(model: PetModel): PetEntity {
    return new PetEntity(
      model.id,
      model.name,
      model.species,
      model.breed,
      model.age,
      model.description,
      model.imageUrl,
      model.status,
      model.createdAt,
      model.updatedAt,
    );
  }
}
