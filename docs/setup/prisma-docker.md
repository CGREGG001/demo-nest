[⬅ Back to README](../README.md)

# Setup Prisma 5 + PostgreSQL (Docker)

## 1. Installation de Prisma 5.22

```bash
npm install prisma@5.22.0 @prisma/client@5.22.0
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

## 4. Configuration Prisma

`schema.prisma`

```json
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
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
