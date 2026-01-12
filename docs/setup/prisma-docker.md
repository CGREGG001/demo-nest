[⬅ Back to README](../README.md)

# Setup Prisma 7 + PostgreSQL (Docker)

## 1. Installation de Prisma 7

```bash
npm install prisma@latest @prisma/client@latest
```

---

## 2. Initialisation de Prisma

```bash
npx prisma init
```

cela crée :

```bash
prisma/
  schema.prisma
prisma.config.ts
.env
```

---

## 3. Configuration des variables d’environnement.

`.env` (local uniquement)

Exemple générique :

```text
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public"
```

---

## 4. Configuration Prisma 7

### 4.1 `schema.prisma`

<div style="border-left:4px solid #ffc002; padding-left:12px; margin:12px 0;">
⚠️ Prisma 7 ne supporte plus url dans le datasource.
</div>

L’URL est désormais définie dans `prisma.config.ts`.

```json
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

---

### 4.2 `prisma.config.ts`

<div style="border-left:4px solid #ffc002; padding-left:12px; margin:12px 0;">
👉 C’est ici que Prisma 7 lit la variable DATABASE_URL.
</div>

```ts
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  engine: 'classic',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
```

---

## 5. Docker PostgreSQL (développement)

Créer les fichiers :

```text
docker/db/docker-compose.yml
docker/db/envs/db.env
```

`docker/db/docker-compose.yml`

```yml
services:
  db:
    image: postgres:15-alpine # Version alégée
    container_name: demo-nest-db
    restart: always

    env_file:
      - ./envs/db.env # Récupération du .env

    ports:
      - '5432:5432'

    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data: # Nom du volume créé
```

`docker/db/envs/db.env` :

```text
POSTGRES_USER=<nom_user>
POSTGRES_PASSWORD=<le_password>
POSTGRES_DB=<nom_de_la_db>
```

Ajouter au `.gitignore` :

```text
docker/db/envs/db.env
```

---

## 6. Module Database (NestJS)

Créer :

```text
src/core/database/
  database.module.ts
  prisma.service.ts
```

`prisma.service.ts`

```ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

`database.module.ts`

```ts
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
```

---

## 7. Générer la migration initiale

Démarrer PostgreSQL :

```bash
docker compose -f docker/db/docker-compose.yml up -d
```

Créer la migration :

```bash
npx prisma migrate dev --name init
```

---

## 8. Vérifier la génération du client

```bash
npx prisma generate
```

_note: devra être relancé à chaque modification de `schema.prisma`._
