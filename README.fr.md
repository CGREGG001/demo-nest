# Demo Nest API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

🇫🇷 Version française  
🇬🇧 English version → [README.md](./README.md)

## Description

Backend API construite avec NestJS, Prisma 7, et PostgreSQL (Docker).  
Le projet suit une architecture modulaire propre, avec une configuration professionnelle (Husky, Swagger, validation globale, Git workflow).

---

## Prérequis

- Node.js ≥ 20.19 (requis pour Prisma 7)
- npm ≥ 10 (fournie avec Node 20+)
- Docker & Docker Compose
- Nest CLI

un fichier `.nvmrc` est inclus pour forcer Node.js 20.19.

```bash
npm install -g @nestjs/cli
```

---

## Installation du projet

```bash
npm install
```

---

## Lancer la base de données (Docker)

```bash
docker compose -f docker/db/docker-compose.yml up -d
```

---

## Prisma

**Générer le client**

```bash
npx prisma generate
```

**Appliquer les migrations**

```bash
npx prisma migrate dev
```

---

## Lancer l'application

**Développement**

```bash
npm run start:dev
```

**Production**

```bash
npm run start:prod
```

---

## Documentation API (Swagger)

Une fois l'application lancée

```text
http://localhost:3000/api
```

---

## Structure du projet

```text
src/
  core/
    database/
      prisma.service.ts
      database.module.ts
  modules/
  shared/
  main.ts
prisma/
docker/
```

---

## Tests

```bash
npm run test
npm run test:e2e
npm run test:cov
```

---

## Scripts utiles

```bash
npm run format
npm run lint
npm run prepare   # Husky
```

---

## Restons en contact

- Auteur - [Gregory Colard](https://github.com/CGREGG001)

---

## Licence

Ce projet est distribué sous [licence MIT](./LICENSE).
