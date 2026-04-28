import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  Unique,
  HasMany,
} from 'sequelize-typescript';
import { AdoptionApplicationModel } from '../../../applications/infrastructure/models/adoption-application.model';

@Table({ tableName: 'users', underscored: true })
export class UserModel extends Model {
  @Column({ type: DataType.UUID, primaryKey: true, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @Unique
  @Column({ type: DataType.STRING, allowNull: false })
  declare email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare password: string;

  @Column({
    type: DataType.ENUM('user', 'staff'),
    allowNull: false,
    defaultValue: 'user',
  })
  declare role: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @HasMany(() => AdoptionApplicationModel)
  declare applications: AdoptionApplicationModel[];
}
