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
import { CreateMedicoDto } from './dto/create-medico.dto.js';
import { UpdateMedicoDto } from './dto/update-medico.dto.js';
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
import { MedicosService } from './medicos.service.js';

@ApiTags('Médicos')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Token ausente, inválido o expirado' })
@ApiResponse({ status: 403, description: 'Se requiere el rol RECEPCIONISTA' })
@Controller('medicos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('RECEPCIONISTA')
export class MedicosController {
  constructor(private readonly service: MedicosService) {}

  @ApiOperation({ summary: 'Lista todos los médicos' })
  @ApiResponse({ status: 200, description: 'Operación exitosa' })
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @ApiOperation({ summary: 'Obtiene un médico por ID' })
  @ApiResponse({ status: 200, description: 'Operación exitosa' })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const medico = await this.service.findOne(id);
    if (!medico) {
      throw new NotFoundException('Médico no encontrado');
    }
    return medico;
  }

  @ApiOperation({ summary: 'Crea un médico' })
  @ApiResponse({ status: 201, description: 'Registro creado' })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un registro con ese valor único',
  })
  @Post()
  create(@Body() body: CreateMedicoDto) {
    return this.service.create(body);
  }

  @ApiOperation({ summary: 'Actualiza un médico' })
  @ApiResponse({ status: 200, description: 'Operación exitosa' })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un registro con ese valor único',
  })
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateMedicoDto) {
    return this.service.update(id, body);
  }

  @ApiOperation({ summary: 'Elimina un médico' })
  @ApiResponse({ status: 200, description: 'Operación exitosa' })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
