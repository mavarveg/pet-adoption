import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
  Unique,
  Index,
} from 'sequelize-typescript';
import { UserModel } from '../../../auth/infrastructure/models/user.model';
import { PetModel } from '../../../pets/infrastructure/models/pet.model';
import { ApplicationStatus } from '../../domain/entities/adoption-application.entity';

@Table({
  tableName: 'adoption_applications',
  underscored: true,
  indexes: [{ unique: true, fields: ['user_id', 'pet_id'] }],
})
export class AdoptionApplicationModel extends Model {
  @Column({ type: DataType.UUID, primaryKey: true, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => UserModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare userId: string;

  @ForeignKey(() => PetModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare petId: string;

  @Index
  @Column({
    type: DataType.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: ApplicationStatus.Pending,
  })
  declare status: ApplicationStatus;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare message: string | null;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @BelongsTo(() => UserModel)
  declare user: UserModel;

  @BelongsTo(() => PetModel)
  declare pet: PetModel;
}
