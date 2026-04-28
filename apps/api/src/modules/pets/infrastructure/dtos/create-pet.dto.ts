import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

export class CreatePetDto {
  @ApiProperty({ example: 'Luna' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'dog' })
  @IsString()
  @IsNotEmpty()
  species!: string;

  @ApiProperty({ example: 'Labrador', required: false })
  @IsString()
  @IsOptional()
  breed?: string;

  @ApiProperty({ example: 2, required: false })
  @IsInt()
  @Min(0)
  @Max(30)
  @IsOptional()
  age?: number;

  @ApiProperty({ example: 'Friendly and playful.', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}
