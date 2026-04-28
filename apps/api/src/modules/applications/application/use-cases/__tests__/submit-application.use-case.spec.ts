import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { SubmitApplicationUseCase } from '../submit-application.use-case';
import { PetEntity, PetStatus } from '../../../../pets/domain/entities/pet.entity';
import { ApplicationStatus } from '../../../domain/entities/adoption-application.entity';

const makePet = (status: PetStatus) =>
  new PetEntity('pet-1', 'Luna', 'dog', null, null, null, null, status, new Date(), new Date());

const makeApplication = () => ({
  id: 'app-1',
  userId: 'user-1',
  petId: 'pet-1',
  status: ApplicationStatus.Pending,
  message: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  isPending: () => true,
});

const petRepo = {
  findById: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

const appRepo = {
  create: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findPendingByPetId: jest.fn(),
  existsByUserAndPet: jest.fn(),
  updateStatus: jest.fn(),
  rejectAllPendingForPet: jest.fn(),
};

describe('SubmitApplicationUseCase', () => {
  let useCase: SubmitApplicationUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new SubmitApplicationUseCase(appRepo as never, petRepo as never);
  });

  it('throws NotFoundException when pet does not exist', async () => {
    petRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('user-1', { petId: 'pet-1' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws BadRequestException when pet is not available', async () => {
    petRepo.findById.mockResolvedValue(makePet(PetStatus.Adopted));

    await expect(useCase.execute('user-1', { petId: 'pet-1' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws ConflictException when user already applied', async () => {
    petRepo.findById.mockResolvedValue(makePet(PetStatus.Available));
    appRepo.existsByUserAndPet.mockResolvedValue(true);

    await expect(useCase.execute('user-1', { petId: 'pet-1' })).rejects.toThrow(
      ConflictException,
    );
  });

  it('throws ConflictException when pet already has a pending application', async () => {
    petRepo.findById.mockResolvedValue(makePet(PetStatus.Available));
    appRepo.existsByUserAndPet.mockResolvedValue(false);
    appRepo.findPendingByPetId.mockResolvedValue(makeApplication());

    await expect(useCase.execute('user-1', { petId: 'pet-1' })).rejects.toThrow(
      ConflictException,
    );
  });

  it('creates and returns an application for a valid request', async () => {
    petRepo.findById.mockResolvedValue(makePet(PetStatus.Available));
    appRepo.existsByUserAndPet.mockResolvedValue(false);
    appRepo.findPendingByPetId.mockResolvedValue(null);
    appRepo.create.mockResolvedValue(makeApplication());

    const result = await useCase.execute('user-1', { petId: 'pet-1', message: 'Hi' });

    expect(appRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1', petId: 'pet-1', message: 'Hi' }),
    );
    expect(result.status).toBe(ApplicationStatus.Pending);
  });
});
