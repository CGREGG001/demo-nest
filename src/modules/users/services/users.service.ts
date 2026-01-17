import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { Prisma } from '@prisma/client';
import { UserEntity } from '../entities/user.entity';
import { UserAuthEntity } from '@modules/auth/entities/user-auth.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdateUserPasswordDto } from '../dto/update-password.dto';
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
   * Mise à jour du password d'un utilisateur
   */
  async updatePassword(id: string, dto: UpdateUserPasswordDto): Promise<UserEntity> {
    // On cherche l'utilisateur directement via Prisma pour être sûr d'avoir le password (le champ est @Exclude dans l'entity)
    const user = await this.prismaService.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Vérifier si l'ancien password est correct
    const isPasswordMatching = await argon2.verify(user.password, dto.oldPassword);

    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid current password');
    }

    // Vérifier que le nouveau n'est pas identique à l'ancien
    if (dto.oldPassword === dto.newPassword) {
      throw new BadRequestException('New password must be different from the old one');
    }

    // Hachage du nouveau password
    const hashedNewPassword = await argon2.hash(dto.newPassword);

    // Mise à jour
    const updated = await this.prismaService.user.update({
      where: { id },
      data: { password: hashedNewPassword },
    });

    return new UserEntity(updated);
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

  /**
   * Trouver un utilisateur par email
   * A n'utiliser qu'en interne (pour le auth.service)
   */
  async findByEmail(email: string): Promise<UserAuthEntity | null> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (!user) {
      return null;
    }
    return new UserAuthEntity(user);
  }
}
