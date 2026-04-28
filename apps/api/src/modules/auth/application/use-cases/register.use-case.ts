import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { Role } from '../../../../shared/domain/role.enum';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../domain/ports/out/user.repository.port';
import { RegisterDto } from '../../infrastructure/dtos/register.dto';

export interface AuthResult {
  accessToken: string;
  user: { id: string; email: string; name: string; role: string };
}

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: RegisterDto): Promise<AuthResult> {
    const exists = await this.userRepository.existsByEmail(dto.email);
    if (exists) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.userRepository.create({
      id: randomUUID(),
      email: dto.email,
      passwordHash,
      name: dto.name,
      role: Role.User,
    });

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }
}
