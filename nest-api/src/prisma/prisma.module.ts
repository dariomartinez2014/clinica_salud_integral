// Apunte de estudio: Aquí conecto los controladores y proveedores que Nest necesita para este módulo.
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Global()
@Module({ providers: [PrismaService], exports: [PrismaService] })
export class PrismaModule {}
