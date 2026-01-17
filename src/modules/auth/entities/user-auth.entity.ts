import { User } from '@prisma/client';

/**
 * Cette entité est dédiée à la logique d'authentification.
 * Elle contient le mot de passe car l'AuthService en a besoin pour Argon2.
 */
export class UserAuthEntity implements User {
  id: string;
  email: string;
  password: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserAuthEntity>) {
    Object.assign(this, partial);
  }
}
