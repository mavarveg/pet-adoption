import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { RegisterUseCase } from '../../../application/use-cases/register.use-case';
import { LoginUseCase } from '../../../application/use-cases/login.use-case';
import { RegisterDto } from '../../dtos/register.dto';
import { LoginDto } from '../../dtos/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({ description: 'User registered successfully' })
  register(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and receive JWT token' })
  @ApiOkResponse({ description: 'Authentication successful' })
  login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }
}
