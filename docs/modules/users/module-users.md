[⬅ Back to README](../../../README.md)

## 1. Présentation du module Users

Le module `Users` gère :

- la création d’utilisateurs
- la récupération individuelle ou globale
- la mise à jour du profil
- la mise à jour sécurisée du mot de passe
- la suppression d’un utilisateur

Il s’appuie sur :

- Prisma 5.22 pour l’accès à la base de données
- DTOs pour la validation stricte des entrées
- Entities pour la sérialisation et Swagger
- NestJS pour l’architecture modulaire
- Argon2 pour le hash des mots de passe

## 2. Architecture du module

```code
src/modules/users
├── dto
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   └── update-password.dto.ts
├── entities
│   └── user.entity.ts
├── services
│   └── users.service.ts
├── users.controller.ts
└── users.module.ts
```

Rôle de chaque fichier

| Fichier                    | Rôle                                                  |
| -------------------------- | ----------------------------------------------------- |
| users.module.ts            | Déclare le module et ses dépendances                  |
| users.controller.ts        | Expose les endpoints HTTP                             |
| users.service.ts           | Contient la logique métier                            |
| dto/create-user.dto.ts     | Valide les données d’entrée pour la création          |
| dto/update-user.dto.ts     | Valide les mises à jour du profil (hors password)     |
| dto/update-password.dto.ts | Valide les mises à jour du mot de passe               |
| entities/user.entity.ts    | Structure les données de sortie et masque le password |

## 3. Modèle Prisma associé

```code
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

```

## 4. DTO : validation des entrées

`CreateUserDto`

- email normalisé (trim, toLowerCase)
- validation stricte (IsEmail, MaxLength)
- password obligatoire et sécurisé

`UpdateUserDto`

- **ne contient pas le password**
- permet uniquement la mise à jour du profil (ex : name)

`UpdateUserPasswordDto`

- oldPassword obligatoire
- newPassword obligatoire
- vérification métier dans le service :
  - ancien password correct
  - nouveau différent de l’ancien
  - hash Argon2

## 5. Entity : structure de sortie

`UserEntity` :

- masque automatiquement le champ password grâce à @Exclude()
- garantit une sortie propre et cohérente
- synchronise Swagger avec la réalité de la DB

Exemple de réponse :

```json
{
  "id": "uuid",
  "email": "john.doe@example.com",
  "name": "John",
  "createdAt": "2025-01-10T09:15:32.123Z",
  "updatedAt": "2025-01-10T09:15:32.123Z"
}
```

## 6. Endpoints exposés

### ➤ POST `/users`

Créer un utilisateur.

Body attendu

```json
{
  "email": "john.doe@example.com",
  "name": "John",
  "password": "StrongPassword123!"
}
```

### Réponse

Réponse `201 Created`

```json
{
  "id": "uuid",
  "email": "john.doe@example.com",
  "name": "John",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### Erreurs possibles

| Code  | Raison             |
| ----- | ------------------ |
| `400` | DTO invalide       |
| `409` | Email déjà utilisé |

### ➤ GET `/users`

Retourne tous les utilisateurs triés par date de création (plus récent en premier).

Réponse `200` OK

```json
[
  {
    "id": "uuid",
    "email": "john.doe@example.com",
    "name": "John",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

### ➤ GET `/users/:id`

Récupère un utilisateur par son UUID.

- **Validation** : `ParseUUIDPipe` sur l'ID.
- **404** : si non trouvé.

### ➤ PATCH `/users/:id`

Met à jour le profil d'un utilisateur (hors password).

- **DTO** : `UpdateUserDto`
- **Validation** : `ParseUUIDPipe` sur l'ID.
- **404** : si non trouvé.

### ➤ PATCH `/users/:id/password`

Met à jour le mot de passe d’un utilisateur.

Body attendu :

```json
{
  "oldPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

Réponses :

| Code | Raison                                |
| ---- | ------------------------------------- |
| 200  | Mot de passe mis à jour               |
| 400  | Nouveau password identique à l’ancien |
| 401  | Ancien password incorrect             |
| 404  | Utilisateur non trouvé                |

Le password n’apparaît jamais dans la réponse.

### ➤ DELETE `/users/:id`

Supprime un utilisateur.

- **Validation** : `ParseUUIDPipe` sur l'ID.
- **Réponse** : `200 OK` avec l'entité supprimée.

## 7. Flux interne (Controller → Service → Prisma → Entity)

### Création

```code
POST /users
   ↓
UsersController.create()
   ↓
UsersService.create()
   ↓
argon2.hash(password)
   ↓
Prisma.user.create()
   ↓
new UserEntity()
   ↓
Réponse API

```

### Mise à jour du mot de passe

```code
PATCH /users/:id/password
   ↓
ParseUUIDPipe
   ↓
UsersController.updatePassword()
   ↓
UsersService.updatePassword()
   ↓
Prisma.user.findUnique()
   ↓
argon2.verify(oldPassword)
   ↓
argon2.hash(newPassword)
   ↓
Prisma.user.update()
   ↓
new UserEntity()

```

![alt text](../../assets/usersSequenceDiagram.png)

## 8. Points forts du module

- Séparation claire entre update profil et update password
- Password toujours masqué dans les réponses
- Hash Argon2 sécurisé
- Validation stricte via DTO
- Documentation Swagger complète
- Tests unitaires complets (service + controller)
- Architecture NestJS propre et scalable
- Code lisible, maintenable et prêt pour la production
