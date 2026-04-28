import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import {
  AdoptionApplicationEntity,
  ApplicationStatus,
} from '../../../domain/entities/adoption-application.entity';
import { ApplicationSummaryEntity } from '../../../domain/entities/application-summary.entity';
import { ApplicationRepositoryPort } from '../../../domain/ports/out/application.repository.port';
import { TransactionContext } from '../../../../../shared/ports/transaction-manager.port';
import { AdoptionApplicationModel } from '../../models/adoption-application.model';
import { PetModel } from '../../../../pets/infrastructure/models/pet.model';

@Injectable()
export class SequelizeApplicationRepository implements ApplicationRepositoryPort {
  constructor(
    @InjectModel(AdoptionApplicationModel)
    private readonly applicationModel: typeof AdoptionApplicationModel,
  ) {}

  async create(data: {
    id: string;
    userId: string;
    petId: string;
    message?: string;
  }): Promise<AdoptionApplicationEntity> {
    const model = await this.applicationModel.create({
      id: data.id,
      userId: data.userId,
      petId: data.petId,
      message: data.message ?? null,
    });
    return this.toEntity(model);
  }

  async findById(id: string): Promise<AdoptionApplicationEntity | null> {
    const model = await this.applicationModel.findByPk(id);
    return model ? this.toEntity(model) : null;
  }

  async findByUserId(userId: string): Promise<ApplicationSummaryEntity[]> {
    const models = await this.applicationModel.findAll({
      where: { userId },
      include: [{ model: PetModel, attributes: ['name', 'species'] }],
      order: [['createdAt', 'DESC']],
    });
    return models.map((m) => this.toSummaryEntity(m));
  }

  async findAll(): Promise<ApplicationSummaryEntity[]> {
    const models = await this.applicationModel.findAll({
      include: [{ model: PetModel, attributes: ['name', 'species'] }],
      order: [['createdAt', 'DESC']],
    });
    return models.map((m) => this.toSummaryEntity(m));
  }

  async findPendingByPetId(petId: string): Promise<AdoptionApplicationEntity | null> {
    const model = await this.applicationModel.findOne({
      where: { petId, status: ApplicationStatus.Pending },
    });
    return model ? this.toEntity(model) : null;
  }

  async existsByUserAndPet(userId: string, petId: string): Promise<boolean> {
    const count = await this.applicationModel.count({ where: { userId, petId } });
    return count > 0;
  }

  async updateStatus(
    id: string,
    status: ApplicationStatus,
    ctx?: TransactionContext,
  ): Promise<void> {
    await this.applicationModel.update(
      { status },
      { where: { id }, transaction: ctx as unknown as Transaction | undefined },
    );
  }

  async rejectAllPendingForPet(petId: string, ctx?: TransactionContext): Promise<void> {
    await this.applicationModel.update(
      { status: ApplicationStatus.Rejected },
      {
        where: { petId, status: ApplicationStatus.Pending },
        transaction: ctx as unknown as Transaction | undefined,
      },
    );
  }

  private toEntity(model: AdoptionApplicationModel): AdoptionApplicationEntity {
    return new AdoptionApplicationEntity(
      model.id,
      model.userId,
      model.petId,
      model.status,
      model.message,
      model.createdAt,
      model.updatedAt,
    );
  }

  private toSummaryEntity(model: AdoptionApplicationModel): ApplicationSummaryEntity {
    return new ApplicationSummaryEntity(
      model.id,
      model.userId,
      model.petId,
      model.pet?.name ?? '',
      model.pet?.species ?? '',
      model.status,
      model.message,
      model.createdAt,
      model.updatedAt,
    );
  }
}
