import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from '@core/config/swagger.config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Supprime les propriétés non attendues, seuls les champs définis dans les DTO sont acceptés
      forbidNonWhitelisted: true, // Erreur 400 immédiate si un champ inconnu est envoyé, le client est forcé de respecter le contrat
      transform: true, // Transforme automatiquement les types (string -> number, etc.)
      transformOptions: {
        enableImplicitConversion: false, // Chaque transformation doit être déclarée volontairement dans le DTO
      },
    }),
  );

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
