import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import jwt from 'jsonwebtoken';
import type { AuthRequest } from '../auth-token.js';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const match = /^Bearer ([^\s]+)$/i.exec(
      request.headers.authorization ?? '',
    );
    if (!match) throw new UnauthorizedException('Token no proporcionado');
    try {
      const payload = jwt.verify(
        match[1],
        this.configService.getOrThrow<string>('JWT_SECRET'),
        {
          algorithms: ['HS256'],
        },
      );
      if (
        typeof payload === 'string' ||
        !Number.isInteger(payload.id) ||
        typeof payload.email !== 'string' ||
        !['RECEPCIONISTA', 'MEDICO', 'GERENCIA'].includes(payload.role)
      ) {
        throw new Error('Payload inválido');
      }
      request.user = {
        id: payload.id,
        email: payload.email,
        role: payload.role,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
