import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard JWT utilisé pour protéger les routes.
 *
 * - Vérifie la présence d'un token Bearer
 * - Déclenche la JwtStrategy
 * - Injecte req.user si le token est valide
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
