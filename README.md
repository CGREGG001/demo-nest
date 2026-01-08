# Demo Nest API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

🇬🇧 English version  
🇫🇷 Version française → [README.fr.md](./README.fr.md)

## Description

Backend API built with NestJS, Prisma 7, and PostgreSQL (Docker).  
The project follows a clean modular architecture with professional tooling (Husky, Swagger, global validation, Git workflow).

---

## Requirements

- Node.js ≥ 20.19 (required by Prisma 7)
- npm ≥ 10 (bundled with Node 20+)
- Docker & Docker Compose
- Nest CLI

A `.nvmrc` file is included to enforce Node.js 20.19.

```bash
npm install -g @nestjs/cli
```

---

## Installation

```bash
npm install
```

---

## Start the database (Docker)

```bash
docker compose -f docker/db/docker-compose.yml up -d
```

---

## Prisma

**To generate the client**

```bash
npx prisma generate
```

**Apply migrations**

```bash
npx prisma migrate dev
```

---

## Run the application

**Development**

```bash
npm run start:dev
```

**Production**

```bash
npm run start:prod
```

---

## API Documentation (Swagger)

Available once the application is running

```text
http://localhost:3000/api
```

---

## Project structure

```text
src/
  core/
    database/
      prisma.service.ts
      database.module.ts
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

## Scripts

```bash
npm run format
npm run lint
npm run prepare   # Husky
```

---

## Inner documentation

- [docs/setup-projects.md](docs/setup-project.md)

---

## Stay in touch

- Author - [Gregory Colard](https://github.com/CGREGG001)

---

## License

This project is licensed under the [MIT License](./LICENSE).
