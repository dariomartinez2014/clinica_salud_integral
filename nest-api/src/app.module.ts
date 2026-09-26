import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { CitasModule } from './citas/citas.module.js';
import { AuthModule } from './auth/auth.module.js';
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module.js';
import { PacientesModule } from './pacientes/pacientes.module.js';
import { MedicosModule } from './medicos/medicos.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().min(32).required(),
        PORT: Joi.number().integer().min(1).max(65535).default(3000),
      }),
    }),
    CitasModule,
    AuthModule,
    PrismaModule,
    PacientesModule,
    MedicosModule,
  ],
})
export class AppModule {}
