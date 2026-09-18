import { CreatePacienteDto } from './dto/create-paciente.dto.js';
import { UpdatePacienteDto } from './dto/update-paciente.dto.js';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
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

  async update(id: number, data: UpdatePacienteDto) {
    this.validarFechaNacimiento(data.fechaNacimiento);
    try {
      return await this.prisma.paciente.update({
        where: { id },
        data: {
          ...data,
          ...(data.fechaNacimiento !== undefined
            ? { fechaNacimiento: new Date(data.fechaNacimiento) }
            : {}),
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Paciente no encontrado');
      }
      throw error;
    }
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

  async remove(id: number) {
    try {
      return await this.prisma.paciente.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Paciente no encontrado');
      }
      throw error;
    }
  }
}
