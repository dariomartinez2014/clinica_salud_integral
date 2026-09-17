import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

type CrearPaciente = Pick<
  Prisma.PacienteCreateInput,
  'nombre' | 'apellido' | 'email' | 'telefono' | 'fechaNacimiento'
>;

@Injectable()
export class PacientesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.paciente.findMany();
  }

  findOne(id: number) {
    return this.prisma.paciente.findUnique({ where: { id } });
  }

  create(data: CrearPaciente) {
    return this.prisma.paciente.create({ data });
  }

  async update(id: number, data: Partial<CrearPaciente>) {
    try {
      return await this.prisma.paciente.update({ where: { id }, data });
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
