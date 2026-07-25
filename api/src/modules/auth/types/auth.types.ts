import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: Role;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface GoogleUser {
  googleId: string;
  email: string;
  fullName: string;
}
