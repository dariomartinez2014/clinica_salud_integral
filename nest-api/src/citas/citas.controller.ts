import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CitasService, type CrearCita } from './citas.service.js';

@Controller('citas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('RECEPCIONISTA')
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Post()
  create(@Body() body: CrearCita) {
    return this.citasService.create(body);
  }

  @Get()
  findAll() {
    return this.citasService.findAll();
  }
}
