import { DocumentBuilder } from '@nestjs/swagger';

/*
 * Configuration de base pour Swagger.
 * On utilise DocumentBuilder pour construire les métadonnées de la documentation.
 */
export const swaggerConfig = new DocumentBuilder()
  .setTitle('Demo API') // Le grand titre qui apparaîtra en haut de la page Swagger
  .setDescription('Demonstration of API')
  .setVersion('1.0')
  /**
   * .addBearerAuth() : Prépare Swagger pour l'authentification JWT.
   * Cela ajoute un bouton "Authorize" (cadenas) dans l'interface.
   * Même sans sécurité active, cela définit le format "Bearer" (Token) par défaut.
   */
  .addBearerAuth()
  .build();
