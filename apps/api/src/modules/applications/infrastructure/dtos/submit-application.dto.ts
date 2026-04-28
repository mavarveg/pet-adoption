import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class SubmitApplicationDto {
  @ApiProperty({ example: 'uuid-of-pet' })
  @IsUUID()
  petId!: string;

  @ApiProperty({ example: 'I have a big garden and lots of love to give.', required: false })
  @IsString()
  @IsOptional()
  message?: string;
}
