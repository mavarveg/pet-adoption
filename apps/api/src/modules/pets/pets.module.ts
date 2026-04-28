import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CreatePetUseCase } from './application/use-cases/create-pet.use-case';
import { GetPetUseCase } from './application/use-cases/get-pet.use-case';
import { ListPetsUseCase } from './application/use-cases/list-pets.use-case';
import { UpdatePetUseCase } from './application/use-cases/update-pet.use-case';
import { PET_REPOSITORY } from './domain/ports/out/pet.repository.port';
import { PetsController } from './infrastructure/adapters/in/pets.controller';
import { SequelizePetRepository } from './infrastructure/adapters/out/sequelize-pet.repository';
import { PetModel } from './infrastructure/models/pet.model';

@Module({
  imports: [SequelizeModule.forFeature([PetModel])],
  controllers: [PetsController],
  providers: [
    ListPetsUseCase,
    GetPetUseCase,
    CreatePetUseCase,
    UpdatePetUseCase,
    {
      provide: PET_REPOSITORY,
      useClass: SequelizePetRepository,
    },
  ],
  exports: [GetPetUseCase],
})
export class PetsModule {}
