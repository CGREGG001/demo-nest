import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Module responsable de la gestion de la base de données.
 * Il centralise la configuration de Prisma et permet son injection
 * dans les services métiers (ex: UsersService, PostsService).
 */
@Module({
  // Déclare le service pour qu'il soit instancié par le système d'injection de NestJS
  providers: [PrismaService],

  // Rend le service accessible aux autres modules qui importeront DatabaseModule
  exports: [PrismaService],
})
export class DatabaseModule {}
