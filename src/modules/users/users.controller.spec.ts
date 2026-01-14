import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './services/users.service';
import { UserEntity } from './entities/user.entity';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

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
      const dto = { email: 'test@test.com', name: 'Gregory' };
      const user = new UserEntity({ id: 'uuid-1', ...dto });

      (service.create as jest.Mock).mockResolvedValue(user);

      const result = await controller.create(dto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(user);
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
      const user = new UserEntity({ id: 'uuid-1', email: 'test@test.com' });

      (service.findOne as jest.Mock).mockResolvedValue(user);

      const result = await controller.findOne('uuid-1');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.findOne).toHaveBeenCalledWith('uuid-1');
      expect(result).toEqual(user);
    });
  });

  /*
   * TEST PATCH /users/:id (update)
   */
  describe('update', () => {
    it('should update a user', async () => {
      const dto = { name: 'Updated' };
      const user = new UserEntity({ id: 'uuid-1', email: 'test@test.com', name: 'Updated' });

      (service.update as jest.Mock).mockResolvedValue(user);

      const result = await controller.update('uuid-1', dto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.update).toHaveBeenCalledWith('uuid-1', dto);
      expect(result).toEqual(user);
    });
  });

  /*
   * TEST DELETE /users/:id (delete)
   */
  describe('delete', () => {
    it('should delete a user', async () => {
      const user = new UserEntity({ id: 'uuid-1', email: 'test@test.com' });

      (service.delete as jest.Mock).mockResolvedValue(user);

      const result = await controller.delete('uuid-1');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.delete).toHaveBeenCalledWith('uuid-1');
      expect(result).toEqual(user);
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
