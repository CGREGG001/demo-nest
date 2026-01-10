import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from '@core/config/swagger.config';
import { setupGlobalSettings } from '@core/config/globals-setup.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupGlobalSettings(app);

  await app.init(); // Garanti que tous les modules sont bien initialisés

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
