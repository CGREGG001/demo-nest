[⬅ Back to README](../README.md)

# Setup Swagger

## 1. Installer les dépendances Swagger

```bash
npm install --save @nestjs/swagger swagger-ui-express
```

---

## 2. Créer la structure de configuration

Créer le dossier :

```bash
mkdir src/core/config/
```

Créer le fichier `swagger.config.ts` :

```ts
import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Demo API')
  .setDescription('API de démonstration NestJS')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
```

---

## 3. Configuration des alias TypeScript (`@core`)

Modifier `tsconfig.json`

```json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@core/*": ["core/*"]
    }
  }
}
```

_Note : Grâce à l'alias, vous pourrez importer la configuration via `@core/config/...` au lieu de chemins relatifs complexes._

```ts
import { swaggerConfig } from '@core/config/swagger.config';
```

---

## 4. Intégrer Swagger dans `main.ts`

Modifier `src/main.ts` :

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from '@core/config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
```

---

## 5. Tester Swagger

Lancer l’application :

```bash
npm run start:dev
```

Accéder à l’interface Swagger :

```text
http://localhost:3000/api
```
