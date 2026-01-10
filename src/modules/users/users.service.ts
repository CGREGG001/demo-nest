import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Prisma } from '../../generated/prisma';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  /**
   * Créer un nouveau user
   * Envoi ConflictException si l'email existe déjà.
   */
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    try {
      const createdUser = await this.prismaService.user.create({ data: createUserDto });
      return new UserEntity(createdUser);
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
   * Retourne tous les users triés par date de création (plus récent en premier)
   */
  async findAll(): Promise<UserEntity[]> {
    const users = await this.prismaService.user.findMany({
      orderBy: { createdAt: 'desc' }, // les plus récents en premier
    });

    // Prisma retourne un objet brut de la db. Il faut mapper (map) chaque résultat dans un UserEntity
    // pour assurer une sortie API cohérente, la documentation Swagger et l'isolation du domain.
    return users.map((u) => new UserEntity(u));
  }
}
