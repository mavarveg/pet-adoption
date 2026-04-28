import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { PetStatus } from '../../domain/entities/pet.entity';

export class UpdatePetDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  species?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  breed?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(0)
  @Max(30)
  @IsOptional()
  age?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ enum: PetStatus, required: false })
  @IsEnum(PetStatus)
  @IsOptional()
  status?: PetStatus;
}
