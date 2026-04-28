import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  HasMany,
  Index,
} from 'sequelize-typescript';
import { AdoptionApplicationModel } from '../../../applications/infrastructure/models/adoption-application.model';
import { PetStatus } from '../../domain/entities/pet.entity';

@Table({ tableName: 'pets', underscored: true })
export class PetModel extends Model {
  @Column({ type: DataType.UUID, primaryKey: true, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @Index
  @Column({ type: DataType.STRING, allowNull: false })
  declare species: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare breed: string | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare age: number | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description: string | null;

  @Column({ type: DataType.STRING, allowNull: true, field: 'image_url' })
  declare imageUrl: string | null;

  @Index
  @Column({
    type: DataType.ENUM('available', 'pending', 'adopted'),
    allowNull: false,
    defaultValue: PetStatus.Available,
  })
  declare status: PetStatus;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @HasMany(() => AdoptionApplicationModel)
  declare applications: AdoptionApplicationModel[];
}
