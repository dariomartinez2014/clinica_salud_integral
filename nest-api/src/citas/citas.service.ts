import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { PacientesService } from '../pacientes/pacientes.service.js';

import type { CreateCitaDto } from './dto/create-cita.dto.js';

@Injectable()
export class CitasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pacientesService: PacientesService,
  ) {}

  async create(data: CreateCitaDto) {
    const paciente = await this.pacientesService.findOne(data.pacienteId);
    if (!paciente) throw new NotFoundException('El paciente no existe');

    return this.prisma.cita.create({
      data: {
        pacienteId: data.pacienteId,
        medicoId: data.medicoId,
        fecha: new Date(data.fecha),
        motivo: data.motivo,
      },
    });
  }

  findAll() {
    return this.prisma.cita.findMany();
  }
}
