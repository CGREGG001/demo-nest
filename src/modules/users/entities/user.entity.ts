import { ApiProperty } from '@nestjs/swagger';
import { user } from '../../../generated/prisma';

/**
 * UserEntity : Représente la structure des données envoyées au client (Sortie API).
 * * Pourquoi une classe et pas juste l'interface Prisma ?
 * 1. Pour Swagger : Permet d'ajouter les décorateurs @ApiProperty.
 * 2. Pour la Sécurité : Permet de filtrer les données (ex: cacher le password).
 * 3. Pour l'Intégrité : Garantit que l'objet est une instance réelle de classe.
 */

export class UserEntity implements user {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: 'c1a2b3c4-d5e6-7890-abcd-ef1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Display name of the user',
    example: 'John-Doe',
    nullable: true,
  })
  name: string | null;

  @ApiProperty({
    description: 'Date when the user was created',
    example: '2025-01-10T09:15:32.123Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the user was last updated',
    example: '2025-01-10T09:15:32.123Z',
  })
  updateAt: Date;

  /**
   * Si un champ 'password' est ajouté dans le schéma Prisma plus tard :
   * Utilisez @Exclude() ici pour qu'il ne soit JAMAIS envoyé dans le JSON de réponse,
   * même s'il est présent dans l'objet retourné par la base de données.
   */
  // @Exclude()
  // password: string;

  /**
   * Le constructeur permet de transformer un objet simple (littéral) provenant
   * de Prisma en une instance de cette classe.
   * Usage : return new UserEntity(prismaUser);
   */
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
