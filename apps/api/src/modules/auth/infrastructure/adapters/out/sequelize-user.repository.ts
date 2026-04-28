import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from '../../../../../shared/decorators/roles.decorator';
import { UserEntity } from '../../../domain/entities/user.entity';
import { UserRepositoryPort } from '../../../domain/ports/out/user.repository.port';
import { UserModel } from '../../models/user.model';

@Injectable()
export class SequelizeUserRepository implements UserRepositoryPort {
  constructor(
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel,
  ) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    const model = await this.userModel.findOne({ where: { email } });
    return model ? this.toEntity(model) : null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const model = await this.userModel.findByPk(id);
    return model ? this.toEntity(model) : null;
  }

  async create(data: {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: string;
  }): Promise<UserEntity> {
    const model = await this.userModel.create({
      id: data.id,
      email: data.email,
      password: data.passwordHash,
      name: data.name,
      role: data.role,
    });
    return this.toEntity(model);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.userModel.count({ where: { email } });
    return count > 0;
  }

  private toEntity(model: UserModel): UserEntity {
    return new UserEntity(
      model.id,
      model.email,
      model.password,
      model.name,
      model.role as Role,
      model.createdAt,
      model.updatedAt,
    );
  }
}
