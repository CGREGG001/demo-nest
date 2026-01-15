import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '@core/database/prisma.service';
import { UserEntity } from '../entities/user.entity';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as argon2 from 'argon2';
import { instanceToPlain } from 'class-transformer';

// Simulation du module argon2
jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  verify: jest.fn().mockResolvedValue(true),
}));

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
    it('should create a user with a hashed password', async () => {
      const dto = { email: 'test@test.com', password: 'plainPassword123', name: 'Greg' };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = dto;

      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'uuid-123',
        ...rest,
        password: 'hashed_password',
      });

      const result: UserEntity = await service.create(dto);

      // Vérifier que le password n'est pas exposé après transformation (class-transformer)
      const plain: Record<string, any> = instanceToPlain(result);
      expect(plain.password).toBeUndefined();

      // Vérifier que le hash est bien appelé avec le password brut
      expect(argon2.hash).toHaveBeenCalledWith('plainPassword123');

      // Vérifier que Prisma reçoit le password hashé
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          ...rest,
          password: 'hashed_password',
        },
      });

      // Vérifier que Prisma n'a jamais reçu le password brut
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.user.create).not.toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.objectContaining({
            password: 'plainPassword123',
          }),
        }),
      );

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.id).toBe('uuid-123');
    });

    it('should throw ConflictException if email already exists (P2002)', async () => {
      const dto = { email: 'duplicate@test.com', password: 'password123' };

      // On simule une erreur typée Prisma avec le code P2002
      const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint', {
        code: 'P2002',
        clientVersion: '5.0.0',
      });

      (prisma.user.create as jest.Mock).mockRejectedValue(prismaError);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  /*
   * FINDALL
   */
  describe('findAll', () => {
    it('should return an array of users', async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([
        { id: '1', email: 'a@test.com', password: 'hashed_in_db', name: 'John Doe' },
        { id: '2', email: 'b@test.com', password: 'hashed_in_db', name: 'Jane Doe' },
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
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'uuid-1',
        email: 'test@test.com',
        password: 'hashed_in_db',
        name: 'John Doe',
      });

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

  /**
   * TEST UPDATEPASSWORD
   */
  describe('updatePassword', () => {
    const userId = 'uuid-123';
    const updatePasswordDto = {
      oldPassword: 'old_password_123',
      newPassword: 'new_password_456',
    };

    it('should successfully update the password', async () => {
      // 1. Simuler l'utilisateur trouvé en DB avec son mot de passe actuel
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        password: 'hashed_old_password',
      });

      // 2. Simuler que la vérification argon2 réussit
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      // 3. Simuler le retour de l'update Prisma
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: userId,
        email: 'test@test.com',
        password: 'hashed_password',
      });

      const result = await service.updatePassword(userId, updatePasswordDto);

      // Vérifications
      expect(argon2.verify).toHaveBeenCalledWith(
        'hashed_old_password',
        updatePasswordDto.oldPassword,
      );
      expect(argon2.hash).toHaveBeenCalledWith(updatePasswordDto.newPassword);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { password: 'hashed_password' },
      });
      expect(result).toBeInstanceOf(UserEntity);
    });

    it('should throw UnauthorizedException if old password is incorrect', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        password: 'hashed_old_password',
      });

      // Simuler l'échec de la vérification
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(service.updatePassword(userId, updatePasswordDto)).rejects.toThrow(
        UnauthorizedException,
      );

      // On vérifie que l'update n'a JAMAIS été appelé
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.updatePassword('invalid-id', updatePasswordDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if new password is same as old', async () => {
      const samePasswordDto = {
        oldPassword: 'password123',
        newPassword: 'password123',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        password: 'hashed_old_password',
      });
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      await expect(service.updatePassword(userId, samePasswordDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  /*
   * DELETE
   */
  describe('delete', () => {
    it('should delete a user successfully', async () => {
      const existingUser = { id: 'uuid-123', email: 'test@test.com' };

      // Simuler findOne (pour la vérification d'existence)
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);
      // Simuler le delete de Prisma
      (prisma.user.delete as jest.Mock).mockResolvedValue(existingUser);

      const result = await service.delete('uuid-123');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
      });

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.id).toBe('uuid-123');
    });

    it('should throw NotFoundException if user to delete does not exist', async () => {
      // Simuler que l'utilisateur n'est pas trouvé
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.delete('invalid-id')).rejects.toThrow(NotFoundException);

      // On vérifie que delete n'a JAMAIS été appelé si l'user n'existe pas
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.user.delete).not.toHaveBeenCalled();
    });
  });
});
