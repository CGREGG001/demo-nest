import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/payload.interface';

/**
 * Strategy JWT utilisée par Passport pour valider les tokens.
 *
 * - Récupère le token dans l'en-tête Authorization: Bearer <token>
 * - Vérifie la signature avec JWT_SECRET
 * - Appelle validate() si le token est valide
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // 1. On extrait le Bearer token du header Authorization
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 2. On refuse les tokens expirés
      ignoreExpiration: false,
      // 3. La clé secrète (doit être la même que dans le module)
      secretOrKey: process.env.JWT_SECRET || 'votre_secret_de_secours',
    });
  }

  /**
   * Cette méthode est appelée après que Passport a vérifié la signature du JWT.
   * Ce qu'on retourne ici sera injecté dans l'objet 'req.user'.
   */
  validate(payload: JwtPayload) {
    return { id: payload.sub, email: payload.email };
  }
}
