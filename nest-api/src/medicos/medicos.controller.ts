import { Controller, Get } from '@nestjs/common';
import { MedicosService } from './medicos.service.js';

@Controller('medicos')
export class MedicosController {
  constructor(private readonly service: MedicosService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
