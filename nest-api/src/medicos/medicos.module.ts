// Apunte de estudio: Aquí conecto los controladores y proveedores que Nest necesita para este módulo.
import { Module } from '@nestjs/common';
import { MedicosController } from './medicos.controller.js';
import { MedicosService } from './medicos.service.js';

@Module({ controllers: [MedicosController], providers: [MedicosService] })
export class MedicosModule {}
