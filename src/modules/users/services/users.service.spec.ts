import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '@core/database/prisma.service';
import { UserEntity } from '../entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            // On simule l'objet user de Prisma et ses méthodes
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /*
   * CREATE
   */
  describe('create', () => {
    it('should create a user and return UserEntity', async () => {
      const dto = { email: 'john.doe@example.com', name: 'John Doe' };

      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'uuid-123',
        email: dto.email,
        name: dto.name,
      });

      const result = await service.create(dto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: dto,
      });

      expect(result).toBeDefined();
      expect(result.id).toBe('uuid-123');
      expect(result.email).toBe(dto.email);
      expect(result).toBeInstanceOf(UserEntity);
    });

    it('should throw if prisma fails (ex: duplicate email)', async () => {
      const dto = { email: 'john.doe@example.com', name: 'John Doe' };

      (prisma.user.create as jest.Mock).mockRejectedValue(new Error('Unique constraint'));

      await expect(service.create(dto)).rejects.toThrow();
    });
  });

  /*
   * FINDALL
   */
  describe('findAll', () => {
    it('should return an array of users', async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([
        { id: '1', email: 'a@test.com' },
        { id: '2', email: 'b@test.com' },
      ]);

      const result = await service.findAll();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.user.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[0]).toBeInstanceOf(UserEntity);
    });

    it('should return an empty array when no users exist', async () => {
      // On simule un retour de tableau vide de Prisma
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  /*
   * FINDONE
   */
  describe('findOne', () => {
    it('should return a user entity if found', async () => {
      const user = { id: 'uuid-1', email: 'test@test.com' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);

      const result = await service.findOne('uuid-1');

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.id).toBe('uuid-1');
    });

    it('should throw NotFoundException if user not found', async () => {
      // On simule un retour nule de Prisma
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // On vérifie que la promesse est rejetée avec l'erreur 404
      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  /*
   * TESTS UPDATE
   */
  describe('update', () => {
    it('should update a user and return UserEntity', async () => {
      const existingUser = { id: 'uuid-123', email: 'old@test.com', name: 'Old Name' };
      const updateDto = { name: 'New Name' };
      const updatedUser = { ...existingUser, ...updateDto };

      // 1. Simuler findOne (pour la vérification d'existence)
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);
      // 2. Simuler l'update réel
      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await service.update('uuid-123', updateDto);

      // Vérifier que Prisma update a été appelé avec les bons arguments
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
        data: updateDto,
      });

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.name).toBe('New Name');
    });

    it('should throw NotFoundException if user to update does not exist', async () => {
      // Simuler que l'utilisateur n'est pas trouvé par findOne
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.update('invalid-id', { name: 'New Name' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
