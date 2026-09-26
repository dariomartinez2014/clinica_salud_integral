import { Injectable, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service.js';
import { ConfigService } from '@nestjs/config';
import type { RegisterDto } from './dto/register.dto.js';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}
  async register(data: RegisterDto) {
    const password = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        password,
        role: data.role,
      },
      select: { id: true, nombre: true, email: true, role: true },
    });
  }
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      this.configService.getOrThrow<string>('JWT_SECRET'),
      { algorithm: 'HS256', expiresIn: '8h' },
    );
    return { token };
  }
}
