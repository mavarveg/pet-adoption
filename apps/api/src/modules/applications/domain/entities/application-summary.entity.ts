import { ApplicationStatus } from './adoption-application.entity';

export class ApplicationSummaryEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly petId: string,
    public readonly petName: string,
    public readonly petSpecies: string,
    public readonly status: ApplicationStatus,
    public readonly message: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
