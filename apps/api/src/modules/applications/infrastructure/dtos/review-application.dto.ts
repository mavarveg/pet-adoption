import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ApplicationStatus } from '../../domain/entities/adoption-application.entity';

enum ReviewAction {
  Approved = 'approved',
  Rejected = 'rejected',
}

export class ReviewApplicationDto {
  @ApiProperty({ enum: ReviewAction })
  @IsEnum(ReviewAction)
  status!: ApplicationStatus.Approved | ApplicationStatus.Rejected;
}
