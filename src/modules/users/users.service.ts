import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Prisma } from '@prisma/client';
import { UserEntity } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

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

  /**
   * Retourne un user sur base de son id
   */
  async findOne(id: string): Promise<UserEntity> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found.`);
    }

    return new UserEntity(user);
  }

  /*
   * Mise à jour d'un utilisateur
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    // Vérifier si l'utilisateur existe
    await this.findOne(id);

    // Appliquer la mise à jour en DB
    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: updateUserDto, // Prisma ne met à jour que les élements présent
    });

    return new UserEntity(updatedUser);
  }

  /**
   * Suppression d"un utilisateur
   */
  async delete(id: string): Promise<UserEntity> {
    // Vérfie si l'utilisateur existe
    await this.findOne(id);
    // Suppression en DB
    const deletedUser = await this.prismaService.user.delete({ where: { id } });

    return new UserEntity(deletedUser);
  }
}
