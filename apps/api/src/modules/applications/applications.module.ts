import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { GetMyApplicationsUseCase } from './application/use-cases/get-my-applications.use-case';
import { GetAllApplicationsUseCase } from './application/use-cases/get-all-applications.use-case';
import { ReviewApplicationUseCase } from './application/use-cases/review-application.use-case';
import { SubmitApplicationUseCase } from './application/use-cases/submit-application.use-case';
import { APPLICATION_REPOSITORY } from './domain/ports/out/application.repository.port';
import { ApplicationsController } from './infrastructure/adapters/in/applications.controller';
import { SequelizeApplicationRepository } from './infrastructure/adapters/out/sequelize-application.repository';
import { AdoptionApplicationModel } from './infrastructure/models/adoption-application.model';
import { PetsModule } from '../pets/pets.module';
import { PetModel } from '../pets/infrastructure/models/pet.model';
import { PET_REPOSITORY } from '../pets/domain/ports/out/pet.repository.port';
import { SequelizePetRepository } from '../pets/infrastructure/adapters/out/sequelize-pet.repository';
import { TRANSACTION_MANAGER } from '../../shared/ports/transaction-manager.port';
import { SequelizeTransactionManager } from '../../shared/adapters/sequelize-transaction-manager';

@Module({
  imports: [
    SequelizeModule.forFeature([AdoptionApplicationModel, PetModel]),
    PetsModule,
  ],
  controllers: [ApplicationsController],
  providers: [
    SubmitApplicationUseCase,
    ReviewApplicationUseCase,
    GetMyApplicationsUseCase,
    GetAllApplicationsUseCase,
    {
      provide: APPLICATION_REPOSITORY,
      useClass: SequelizeApplicationRepository,
    },
    {
      provide: PET_REPOSITORY,
      useClass: SequelizePetRepository,
    },
    {
      provide: TRANSACTION_MANAGER,
      useClass: SequelizeTransactionManager,
    },
  ],
})
export class ApplicationsModule {}
