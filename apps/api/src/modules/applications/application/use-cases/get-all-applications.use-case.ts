import { Inject, Injectable } from '@nestjs/common';
import { ApplicationSummaryEntity } from '../../domain/entities/application-summary.entity';
import {
  APPLICATION_REPOSITORY,
  ApplicationRepositoryPort,
} from '../../domain/ports/out/application.repository.port';

@Injectable()
export class GetAllApplicationsUseCase {
  constructor(
    @Inject(APPLICATION_REPOSITORY)
    private readonly applicationRepository: ApplicationRepositoryPort,
  ) {}

  execute(): Promise<ApplicationSummaryEntity[]> {
    return this.applicationRepository.findAll();
  }
}
