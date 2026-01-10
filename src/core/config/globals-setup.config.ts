import { ClassSerializerInterceptor, INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Configure global settings for the NestJS application.
 * This includes pipes for validation and interceptors for data transformation.
 */
export function setupGlobalSettings(app: INestApplication): void {
  const reflector = app.get(Reflector);

  app.setGlobalPrefix('api/v1'); // Ajoute le versionning

  app.useGlobalPipes(
    // 1. Validation (Entrée)
    new ValidationPipe({
      whitelist: true, // Supprime les propriétés non attendues, seuls les champs définis dans les DTO sont acceptés
      forbidNonWhitelisted: true, // Erreur 400 immédiate si un champ inconnu est envoyé, le client est forcé de respecter le contrat
      transform: true, // Transforme automatiquement les types (string -> number, etc.)
      transformOptions: {
        enableImplicitConversion: false, // Chaque transformation doit être déclarée volontairement dans le DTO
      },
    }),
  );

  // 2. Sérialisation (Sortie - Pour les UserEntity)
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));
}
