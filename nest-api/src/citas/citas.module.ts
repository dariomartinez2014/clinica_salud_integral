import { Module } from '@nestjs/common';
import { PacientesModule } from '../pacientes/pacientes.module.js';
import { CitasController } from './citas.controller.js';
import { CitasService } from './citas.service.js';

@Module({
  imports: [PacientesModule],
  controllers: [CitasController],
  providers: [CitasService],
})
export class CitasModule {}
