import { UserEntity } from '../../entities/user.entity';

export interface UserRepositoryPort {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  create(data: {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: string;
  }): Promise<UserEntity>;
  existsByEmail(email: string): Promise<boolean>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
