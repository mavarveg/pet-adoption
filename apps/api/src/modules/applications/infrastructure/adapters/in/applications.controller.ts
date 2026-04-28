import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../../../shared/decorators/current-user.decorator';
import { Role, Roles } from '../../../../../shared/decorators/roles.decorator';
import { JwtAuthGuard, JwtPayload } from '../../../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../../shared/guards/roles.guard';
import { GetMyApplicationsUseCase } from '../../../application/use-cases/get-my-applications.use-case';
import { GetAllApplicationsUseCase } from '../../../application/use-cases/get-all-applications.use-case';
import { ReviewApplicationUseCase } from '../../../application/use-cases/review-application.use-case';
import { SubmitApplicationUseCase } from '../../../application/use-cases/submit-application.use-case';
import { ApplicationStatus } from '../../../domain/entities/adoption-application.entity';
import { SubmitApplicationDto } from '../../dtos/submit-application.dto';

@ApiTags('applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(
    private readonly submitApplication: SubmitApplicationUseCase,
    private readonly reviewApplication: ReviewApplicationUseCase,
    private readonly getMyApplications: GetMyApplicationsUseCase,
    private readonly getAllApplications: GetAllApplicationsUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Submit an adoption application for a pet' })
  submit(@CurrentUser() user: JwtPayload, @Body() dto: SubmitApplicationDto) {
    return this.submitApplication.execute(user.sub, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.Staff)
  @ApiOperation({ summary: '[Staff] List all adoption applications' })
  all() {
    return this.getAllApplications.execute();
  }

  @Get('me')
  @ApiOperation({ summary: 'View my adoption applications' })
  myApplications(@CurrentUser() user: JwtPayload) {
    return this.getMyApplications.execute(user.sub);
  }

  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(Role.Staff)
  @ApiOperation({ summary: '[Staff] Approve an adoption application' })
  approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewApplication.execute(id, ApplicationStatus.Approved);
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(Role.Staff)
  @ApiOperation({ summary: '[Staff] Reject an adoption application' })
  reject(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewApplication.execute(id, ApplicationStatus.Rejected);
  }
}
