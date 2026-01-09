import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Prisma, user } from '../../generated/prisma';

@Injectable()
export class UsersService {
  /**
   * Create a new user.
   * Throws ConflictException if the email already exists.
   */
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<user> {
    try {
      return await this.prismaService.user.create({
        data: createUserDto,
      });
    } catch (error: unknown) {
      // On vérifie si l'erreur vient de Prisma
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Prisma unique constraint violation
        if (error.code === 'P2002') {
          throw new ConflictException('This email is already registered.');
        }
      }
      throw error;
    }
  }
  /**
   * Return all users ordered by creation date (newest first).
   */
  async findAll(): Promise<user[]> {
    return this.prismaService.user.findMany({
      orderBy: { createdAt: 'desc' }, // les plus récents en premier
    });
  }
}
