import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../../shared/guards/roles.guard';
import { Role, Roles } from '../../../../../shared/decorators/roles.decorator';
import { CreatePetUseCase } from '../../../application/use-cases/create-pet.use-case';
import { GetPetUseCase } from '../../../application/use-cases/get-pet.use-case';
import { ListPetsUseCase } from '../../../application/use-cases/list-pets.use-case';
import { UpdatePetUseCase } from '../../../application/use-cases/update-pet.use-case';
import { CreatePetDto } from '../../dtos/create-pet.dto';
import { ListPetsDto } from '../../dtos/list-pets.dto';
import { UpdatePetDto } from '../../dtos/update-pet.dto';

@ApiTags('pets')
@Controller('pets')
export class PetsController {
  constructor(
    private readonly listPets: ListPetsUseCase,
    private readonly getPet: GetPetUseCase,
    private readonly createPet: CreatePetUseCase,
    private readonly updatePet: UpdatePetUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List pets (paginated, filterable by species)' })
  list(@Query() dto: ListPetsDto) {
    return this.listPets.execute(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pet details' })
  detail(@Param('id', ParseUUIDPipe) id: string) {
    return this.getPet.execute(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Staff)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Staff] Add a new pet listing' })
  create(@Body() dto: CreatePetDto) {
    return this.createPet.execute(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Staff)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Staff] Update a pet listing' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePetDto) {
    return this.updatePet.execute(id, dto);
  }
}
