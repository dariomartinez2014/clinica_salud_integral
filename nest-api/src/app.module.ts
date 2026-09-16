import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module.js';
import { PacientesModule } from './pacientes/pacientes.module.js';
import { MedicosModule } from './medicos/medicos.module.js';

@Module({ imports: [PrismaModule, PacientesModule, MedicosModule] })
export class AppModule {}
