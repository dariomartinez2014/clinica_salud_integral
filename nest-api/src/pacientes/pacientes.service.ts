import { CreatePacienteDto } from './dto/create-paciente.dto.js';
import { UpdatePacienteDto } from './dto/update-paciente.dto.js';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PacientesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.paciente.findMany();
  }

  findOne(id: number) {
    return this.prisma.paciente.findUnique({ where: { id } });
  }

  create(data: CreatePacienteDto) {
    this.validarFechaNacimiento(data.fechaNacimiento);
    return this.prisma.paciente.create({
      data: { ...data, fechaNacimiento: new Date(data.fechaNacimiento) },
    });
  }

  update(id: number, data: UpdatePacienteDto) {
    this.validarFechaNacimiento(data.fechaNacimiento);
    return this.prisma.paciente.update({
      where: { id },
      data: {
        ...data,
        ...(data.fechaNacimiento !== undefined
          ? { fechaNacimiento: new Date(data.fechaNacimiento) }
          : {}),
      },
    });
  }

  private validarFechaNacimiento(fechaNacimiento?: string) {
    if (
      fechaNacimiento !== undefined &&
      new Date(fechaNacimiento) > new Date()
    ) {
      throw new BadRequestException(
        'La fecha de nacimiento no puede ser futura',
      );
    }
  }

  remove(id: number) {
    return this.prisma.paciente.delete({ where: { id } });
  }
}
