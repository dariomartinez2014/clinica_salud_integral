import { Controller, Get } from '@nestjs/common';
import { PacientesService } from './pacientes.service.js';

@Controller('pacientes')
export class PacientesController {
  constructor(private readonly service: PacientesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
