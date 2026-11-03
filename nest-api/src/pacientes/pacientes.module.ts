// Apunte de estudio: Aquí conecto los controladores y proveedores que Nest necesita para este módulo.
import { Module } from '@nestjs/common';
import { PacientesController } from './pacientes.controller.js';
import { PacientesService } from './pacientes.service.js';

@Module({ controllers: [PacientesController], providers: [PacientesService] })
export class PacientesModule {}
