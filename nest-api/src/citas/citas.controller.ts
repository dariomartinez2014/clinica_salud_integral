import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateCitaDto } from './dto/create-cita.dto.js';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CitasService } from './citas.service.js';

@ApiTags('Citas')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Token ausente, inválido o expirado' })
@ApiResponse({ status: 403, description: 'Se requiere el rol RECEPCIONISTA' })
@Controller('citas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('RECEPCIONISTA')
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @ApiOperation({ summary: 'Agenda una cita para un paciente existente' })
  @ApiResponse({ status: 201, description: 'Registro creado' })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos' })
  @ApiResponse({ status: 404, description: 'El paciente no existe' })
  @Post()
  create(@Body() body: CreateCitaDto) {
    return this.citasService.create(body);
  }

  @ApiOperation({ summary: 'Lista todas las citas' })
  @ApiResponse({ status: 200, description: 'Operación exitosa' })
  @Get()
  findAll() {
    return this.citasService.findAll();
  }
}
