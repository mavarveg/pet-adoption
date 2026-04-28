import { TransactionContext } from '../../../../../shared/ports/transaction-manager.port';
import {
  AdoptionApplicationEntity,
  ApplicationStatus,
} from '../../entities/adoption-application.entity';
import { ApplicationSummaryEntity } from '../../entities/application-summary.entity';

export interface ApplicationRepositoryPort {
  create(data: {
    id: string;
    userId: string;
    petId: string;
    message?: string;
  }): Promise<AdoptionApplicationEntity>;

  findById(id: string): Promise<AdoptionApplicationEntity | null>;

  findByUserId(userId: string): Promise<ApplicationSummaryEntity[]>;

  findAll(): Promise<ApplicationSummaryEntity[]>;

  findPendingByPetId(petId: string): Promise<AdoptionApplicationEntity | null>;

  existsByUserAndPet(userId: string, petId: string): Promise<boolean>;

  updateStatus(
    id: string,
    status: ApplicationStatus,
    ctx?: TransactionContext,
  ): Promise<void>;

  rejectAllPendingForPet(petId: string, ctx?: TransactionContext): Promise<void>;
}

export const APPLICATION_REPOSITORY = Symbol('APPLICATION_REPOSITORY');
