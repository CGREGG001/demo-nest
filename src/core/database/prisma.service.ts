import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';

/**
 * Service gérant la connexion à la base de données via Prisma.
 * Hérite de PrismaClient pour exposer toutes les méthodes CRUD (findMany, create, etc.).
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /**
   * Initialisation du module.
   * Se déclenche automatiquement au démarrage de l'application NestJS.
   */
  async onModuleInit() {
    // Établit la connexion avec la base de données
    await this.$connect();
  }

  /**
   * Destruction du module.
   * Assure une fermeture propre des connexions lors de l'arrêt du serveur (Graceful Shutdown).
   */
  async onModuleDestroy() {
    // Libère les ressources et ferme la connexion
    await this.$disconnect();
  }
}
