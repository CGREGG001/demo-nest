import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Service gérant la connexion à la base de données via Prisma.
 * Hérite de PrismaClient pour exposer toutes les méthodes CRUD (findMany, create, etc.).
 */
@Injectable()
export class PrismaService 
    extends PrismaClient 
    implements OnModuleInit, OnModuleDestroy {
  
    // Constructeur du PrismaService.
  constructor() {
    /**
     * super() appelle le constructeur de PrismaClient.
     * On lui passe un objet de configuration pour définir la source de données.
     */
    super({
      datasources: {
        db: {
          /**
           * Injection  Dynamique de l'URL de connexion.
           * En Prisma 7, l'URL est extraite des variables d'environnement ici
           * plutôt que d'être lue statiquement dans le fichier schema.prisma.
           */
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

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
