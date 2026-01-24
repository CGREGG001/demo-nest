export interface JwtPayload {
  sub: string; // L'ID de l'utilisateur (Subject)
  email: string; // Pour faciliter les récupérations côté client
}
