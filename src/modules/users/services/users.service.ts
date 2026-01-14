import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { Prisma } from '@prisma/client';
import { UserEntity } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Créer un nouveau user
   * Envoi ConflictException si l'email existe déjà.
   */
  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    //
    const { password, ...rest } = createUserDto;

    // Hashage du mot de passe
    const hashedPassword = await argon2.hash(password);

    try {
      const createdUser = await this.prismaService.user.create({
        data: {
          /*
           * ...rest contient toutes les propriétés du DTO sauf celles que nous avons
           * explicitement extraites (ici : password). Le spread operator ... permet donc
           * de reconstruire un objet propre et conforme au schéma Prisma.
           */
          ...rest,

          /*
           * On remplace le mot de passe en clair par sa version hashée.
           * Cela garantit que Prisma n’enregistre jamais le password brut en base.
           */
          password: hashedPassword,
        },
      });

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

  /**
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
   * Suppression d'un utilisateur
   */
  async delete(id: string): Promise<UserEntity> {
    // Vérifie si l'utilisateur existe
    await this.findOne(id);
    // Suppression en DB
    const deletedUser = await this.prismaService.user.delete({ where: { id } });

    return new UserEntity(deletedUser);
  }
}
