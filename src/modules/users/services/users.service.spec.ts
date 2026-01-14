import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '@core/database/prisma.service';
import { UserEntity } from '../entities/user.entity';

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
});
