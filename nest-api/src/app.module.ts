import { CitasModule } from './citas/citas.module.js';
import { AuthModule } from './auth/auth.module.js';
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module.js';
import { PacientesModule } from './pacientes/pacientes.module.js';
import { MedicosModule } from './medicos/medicos.module.js';

@Module({
  imports: [
    CitasModule,
    AuthModule,
    PrismaModule,
    PacientesModule,
    MedicosModule,
  ],
})
export class AppModule {}
