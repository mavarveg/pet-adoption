export enum PetStatus {
  Available = 'available',
  Pending = 'pending',
  Adopted = 'adopted',
}

export class PetEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly species: string,
    public readonly breed: string | null,
    public readonly age: number | null,
    public readonly description: string | null,
    public readonly imageUrl: string | null,
    public readonly status: PetStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  isAvailable(): boolean {
    return this.status === PetStatus.Available;
  }
}
