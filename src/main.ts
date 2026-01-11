import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from '@core/config/swagger.config';
import { setupGlobalSettings } from '@core/config/globals-setup.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurer les pipes et le préfixe /api/v1
  setupGlobalSettings(app);

  // Swagger
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document, {
    // Cette option est CRUCIALE quand on utilise un Global Prefix
    // Elle permet d'accéder à Swagger sur /api au lieu de /api/v1/api
    useGlobalPrefix: false,
  });

  // On lance tout (init() sera appelé en interne ici)
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
