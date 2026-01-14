import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './services/users.service';
import { UserEntity } from './entities/user.entity';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { instanceToPlain } from 'class-transformer';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  /*
   * TEST POST /users (create)
   */
  describe('create', () => {
    it('should call service.create and return result', async () => {
      const dto = { email: 'test@test.com', password: 'Password123!', name: 'John Doe' };
      const createdUser = new UserEntity({
        id: 'uuid-1',
        email: dto.email,
        name: dto.name,
        password: 'hashed_password',
      });

      (service.create as jest.Mock).mockResolvedValue(createdUser);

      const result = await controller.create(dto);

      // Vérifie que le controller transmet bien le DTO complet (avec password)
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.create).toHaveBeenCalledWith(dto);

      // Vérifie que le retour est bien une UserEntity
      expect(result).toBeInstanceOf(UserEntity);

      // Vérifie que le password n'est pas exposé après transformation
      const plain = instanceToPlain(result);
      expect(plain.password).toBeUndefined();
    });

    it('should propagate ConflictException from service', async () => {
      (service.create as jest.Mock).mockRejectedValue(new ConflictException());

      await expect(controller.create({ email: 'x', password: 'y' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  /*
   * TEST GET /users (findAll)
   */
  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [
        new UserEntity({ id: '1', email: 'a@test.com' }),
        new UserEntity({ id: '2', email: 'b@test.com' }),
      ];

      (service.findAll as jest.Mock).mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result).toEqual(users);
    });
  });

  /*
   * TEST GET /users/:id (findOne)
   */
  describe('findOne', () => {
    it('should return a user', async () => {
      const user = new UserEntity({
        id: 'uuid-1',
        email: 'test@test.com',
        name: 'Greg',
        password: 'hashed',
      });

      (service.findOne as jest.Mock).mockResolvedValue(user);

      const result = await controller.findOne('uuid-1');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.findOne).toHaveBeenCalledWith('uuid-1');
      expect(result).toBeInstanceOf(UserEntity);

      const plain = instanceToPlain(result);
      expect(plain.password).toBeUndefined();
    });

    it('should throw NotFoundException if user not found', async () => {
      (service.findOne as jest.Mock).mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  /*
   * TEST PATCH /users/:id (update)
   */
  describe('update', () => {
    it('should update a user', async () => {
      const updated = new UserEntity({
        id: 'uuid-1',
        email: 'test@test.com',
        name: 'Updated',
        password: 'hashed',
      });

      (service.update as jest.Mock).mockResolvedValue(updated);

      const result = await controller.update('uuid-1', { name: 'Updated' });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.update).toHaveBeenCalledWith('uuid-1', { name: 'Updated' });
      expect(result).toBeInstanceOf(UserEntity);

      const plain = instanceToPlain(result);
      expect(plain.password).toBeUndefined();
    });
  });

  /*
   * TEST DELETE /users/:id (delete)
   */
  describe('delete', () => {
    it('should delete a user', async () => {
      const deleted = new UserEntity({
        id: 'uuid-1',
        email: 'test@test.com',
        name: 'John Doe',
        password: 'hashed',
      });

      (service.delete as jest.Mock).mockResolvedValue(deleted);

      const result = await controller.delete('uuid-1');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.delete).toHaveBeenCalledWith('uuid-1');
      expect(result).toBeInstanceOf(UserEntity);

      const plain = instanceToPlain(result);
      expect(plain.password).toBeUndefined();
    });
  });

  /*
   * TEST INDÉPENDANT DES PIPES
   */
  describe('Global Validations', () => {
    const target = new ValidationPipe({ whitelist: true, transform: true });

    it('should validate CreateUserDto', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const metadata = { type: 'body', metatype: CreateUserDto } as any;
      const dto = { email: 'invalid-email' }; // Manque 'name' et email invalide

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await expect(target.transform(dto, metadata)).rejects.toThrow(BadRequestException);
    });
  });
});
