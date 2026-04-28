export enum ApplicationStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

export class AdoptionApplicationEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly petId: string,
    public readonly status: ApplicationStatus,
    public readonly message: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  isPending(): boolean {
    return this.status === ApplicationStatus.Pending;
  }
}
