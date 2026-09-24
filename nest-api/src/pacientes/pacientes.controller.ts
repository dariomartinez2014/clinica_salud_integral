import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CreatePacienteDto } from './dto/create-paciente.dto.js';
import { UpdatePacienteDto } from './dto/update-paciente.dto.js';
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { PacientesService } from './pacientes.service.js';

@ApiTags('Pacientes')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Token ausente, inválido o expirado' })
@ApiResponse({ status: 403, description: 'Se requiere el rol RECEPCIONISTA' })
@Controller('pacientes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('RECEPCIONISTA')
export class PacientesController {
  constructor(private readonly service: PacientesService) {}

  @ApiOperation({ summary: 'Lista todos los pacientes' })
  @ApiResponse({ status: 200, description: 'Operación exitosa' })
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @ApiOperation({ summary: 'Obtiene un paciente por ID' })
  @ApiResponse({ status: 200, description: 'Operación exitosa' })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const paciente = await this.service.findOne(id);
    if (!paciente) {
      throw new NotFoundException('Paciente no encontrado');
    }
    return paciente;
  }

  @ApiOperation({ summary: 'Crea un paciente' })
  @ApiResponse({ status: 201, description: 'Registro creado' })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un registro con ese valor único',
  })
  @Post()
  create(@Body() body: CreatePacienteDto) {
    return this.service.create(body);
  }

  @ApiOperation({ summary: 'Actualiza un paciente' })
  @ApiResponse({ status: 200, description: 'Operación exitosa' })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un registro con ese valor único',
  })
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePacienteDto,
  ) {
    return this.service.update(id, body);
  }

  @ApiOperation({ summary: 'Elimina un paciente' })
  @ApiResponse({ status: 200, description: 'Operación exitosa' })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
