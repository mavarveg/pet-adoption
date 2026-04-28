import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationStatus } from '../../domain/entities/adoption-application.entity';
import {
  APPLICATION_REPOSITORY,
  ApplicationRepositoryPort,
} from '../../domain/ports/out/application.repository.port';
import {
  PET_REPOSITORY,
  PetRepositoryPort,
} from '../../../pets/domain/ports/out/pet.repository.port';
import { PetStatus } from '../../../pets/domain/entities/pet.entity';
import {
  TRANSACTION_MANAGER,
  TransactionManagerPort,
} from '../../../../shared/ports/transaction-manager.port';

@Injectable()
export class ReviewApplicationUseCase {
  constructor(
    @Inject(APPLICATION_REPOSITORY)
    private readonly applicationRepository: ApplicationRepositoryPort,
    @Inject(PET_REPOSITORY)
    private readonly petRepository: PetRepositoryPort,
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: TransactionManagerPort,
  ) {}

  async execute(
    applicationId: string,
    action: ApplicationStatus.Approved | ApplicationStatus.Rejected,
  ): Promise<void> {
    const application = await this.applicationRepository.findById(applicationId);
    if (!application) {
      throw new NotFoundException(`Application ${applicationId} not found`);
    }

    if (!application.isPending()) {
      throw new BadRequestException('Application has already been reviewed');
    }

    if (action === ApplicationStatus.Rejected) {
      await this.applicationRepository.updateStatus(applicationId, ApplicationStatus.Rejected);
      return;
    }

    await this.transactionManager.execute(async (ctx) => {
      await this.applicationRepository.updateStatus(applicationId, ApplicationStatus.Approved, ctx);
      await this.petRepository.update(application.petId, { status: PetStatus.Adopted }, ctx);
      await this.applicationRepository.rejectAllPendingForPet(application.petId, ctx);
    });
  }
}
