import type { Request } from 'express';
import type { Role } from '../../generated/prisma/enums.js';
export interface AuthPayload {
  id: number;
  email: string;
  role: Role;
}
export type AuthRequest = Request & { user?: AuthPayload };
