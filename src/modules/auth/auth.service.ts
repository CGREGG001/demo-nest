import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '@modules/users/services/users.service';
import { UserEntity } from '@modules/users/entities/user.entity';
import * as argon2 from 'argon2';
import { UserAuthEntity } from '@modules/auth/entities/user-auth.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  // Injection du service Users
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Logique de validation interne
   * Utilisée pour vérifier les credentials avant de générer un token
   */
  async validateUser(email: string, pass: string): Promise<Omit<UserEntity, 'password'> | null> {
    const user: UserAuthEntity | null = await this.usersService.findByEmail(email);

    // Comparaison du hash Argon2
    if (user && (await argon2.verify(user.password, pass))) {
      // on extrait le password pour ne pas le renvoyer par erreur !
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(dto: LoginDto) {
    const user: any = await this.validateUser(dto.email, dto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    // pour l'instant retourne un user en attente du JWT
    // Todo : JWT
    return {
      message: 'Login successful',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      user: user,
    };
  }

  /**
   * Logique de création de compte (Register)
   * On délègue au UsersService qui gère déjà le hashage et Prisma
   */
  async register(dto: RegisterDto) {
    // Appel du service Users pour la création d'un nouvel utilisateur.
    return await this.usersService.create(dto);
  }
}
