import type { Request } from 'express';
import type { Role } from '../../generated/prisma/enums.js';
export interface AuthPayload {
  id: number;
  email: string;
  role: Role;
}
export type AuthRequest = Request & { user?: AuthPayload };
export function secretoJWT(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32)
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres');
  return secret;
}
