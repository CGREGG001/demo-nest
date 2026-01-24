import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '@modules/users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { UserEntity } from '@modules/users/entities/user.entity';
import * as argon2 from 'argon2';

// Simulation de argon2
jest.mock('argon2', () => ({
  verify: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  // Mock du JwtService
  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('fake_jwt_token'), // Simulation du token
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService, // AJOUT DU MOCK JWT
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /**
   * TESTS VALIDATE_USER
   */
  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      const rawPassword = 'Password123!';
      const hashedPassword = 'hashed';

      (argon2.verify as jest.Mock).mockResolvedValue(true);

      mockUsersService.findByEmail.mockResolvedValue({
        id: '8f3c2c4e-9d2a-4b0a-9f3a-1b2c3d4e5f6a',
        email: 'test@example.com',
        password: hashedPassword,
      });

      const result = await service.validateUser('test@example.com', rawPassword);

      expect(result).not.toHaveProperty('password');
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      expect(result.email).toBe('test@example.com');
    });

    it('should return null if password does not match', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        email: 'test@example.com',
        password: 'hashed_password',
      });

      (argon2.verify as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrong_pass');
      expect(result).toBeNull();
    });
  });

  /**
   * TESTS LOGIN
   */
  describe('login', () => {
    it('should return a success message and user when credentials are valid', async () => {
      const dto = { email: 'test@example.com', password: 'password123' };

      // Mock validateUser pour renvoyer un user sans password
      const mockUser = { id: '1', email: dto.email };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser);

      const result = await service.login(dto);

      expect(result).toEqual({
        message: 'Login successful',
        access_token: 'fake_jwt_token', // Vérifie qu'on a bien le token
        user: mockUser,
      });

      expect(mockJwtService.signAsync).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      const dto = { email: 'wrong@example.com', password: 'wrongpass' };

      // validateUser renvoie null → credentials invalides
      jest.spyOn(service, 'validateUser').mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should call validateUser with correct parameters', async () => {
      const dto = { email: 'test@example.com', password: 'password123' };

      const validateSpy = jest.spyOn(service, 'validateUser').mockResolvedValue({
        id: '1',
        email: dto.email,
        name: 'John Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.login(dto);

      expect(validateSpy).toHaveBeenCalledWith(dto.email, dto.password);
    });
  });

  /**
   * TESTS REGISTER
   */
  describe('register', () => {
    it('should call usersService.create with the DTO and return the created user', async () => {
      const dto = {
        email: 'new@example.com',
        password: 'Password123!',
        name: 'John Doe',
      };

      const mockCreatedUser = {
        id: '8f3c2c4e-9d2a-4b0a-9f3a-1b2c3d4e5f6a',
        email: dto.email,
        name: dto.name,
        password: 'hashed_password',
      };

      mockUsersService.create.mockResolvedValue(mockCreatedUser);

      const result: UserEntity = await service.register(dto);

      expect(mockUsersService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockCreatedUser);
    });

    it('should propagate errors thrown by usersService.create', async () => {
      const dto = {
        email: 'existing@example.com',
        password: 'Password123!',
        name: 'John Doe',
      };

      mockUsersService.create.mockRejectedValue(new Error('Email already exists'));

      await expect(service.register(dto)).rejects.toThrow('Email already exists');
    });
  });
});
