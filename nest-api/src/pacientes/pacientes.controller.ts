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

@Controller('pacientes')
export class PacientesController {
  constructor(private readonly service: PacientesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const paciente = await this.service.findOne(id);
    if (!paciente) {
      throw new NotFoundException('Paciente no encontrado');
    }
    return paciente;
  }

  @Post()
  create(@Body() body: CreatePacienteDto) {
    return this.service.create(body);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePacienteDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
