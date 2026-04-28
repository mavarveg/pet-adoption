import { Role } from '../../../../shared/domain/role.enum';

export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly name: string,
    public readonly role: Role,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  isStaff(): boolean {
    return this.role === Role.Staff;
  }
}
