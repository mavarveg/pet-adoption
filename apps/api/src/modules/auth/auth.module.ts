import { Module } from '@nestjs/common';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { USER_REPOSITORY } from './domain/ports/out/user.repository.port';
import { AuthController } from './infrastructure/adapters/in/auth.controller';
import { JwtStrategy } from './infrastructure/adapters/in/jwt.strategy';
import { SequelizeUserRepository } from './infrastructure/adapters/out/sequelize-user.repository';
import { UserModel } from './infrastructure/models/user.model';

@Module({
  imports: [
    SequelizeModule.forFeature([UserModel]),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (): JwtModuleOptions => ({
        secret: process.env['JWT_SECRET'] ?? 'dev_secret',
        signOptions: { expiresIn: (process.env['JWT_EXPIRATION'] ?? '7d') as '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    LoginUseCase,
    JwtStrategy,
    {
      provide: USER_REPOSITORY,
      useClass: SequelizeUserRepository,
    },
  ],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
