import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterUseCase } from '../register.use-case';
import { Role } from '../../../../../shared/decorators/roles.decorator';
import { UserEntity } from '../../../domain/entities/user.entity';

const makeUser = () =>
  new UserEntity('u-1', 'ada@test.com', 'hashed', 'Ada', Role.User, new Date(), new Date());

const userRepo = {
  existsByEmail: jest.fn(),
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
};

const jwtService = { sign: jest.fn().mockReturnValue('token') } as unknown as JwtService;

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new RegisterUseCase(userRepo as never, jwtService);
  });

  it('throws ConflictException when email is already taken', async () => {
    userRepo.existsByEmail.mockResolvedValue(true);

    await expect(
      useCase.execute({ name: 'Ada', email: 'ada@test.com', password: 'pass1234' }),
    ).rejects.toThrow(ConflictException);
  });

  it('creates user and returns token on success', async () => {
    userRepo.existsByEmail.mockResolvedValue(false);
    userRepo.create.mockResolvedValue(makeUser());

    const result = await useCase.execute({
      name: 'Ada',
      email: 'ada@test.com',
      password: 'pass1234',
    });

    expect(result.accessToken).toBe('token');
    expect(result.user.email).toBe('ada@test.com');
  });
});
