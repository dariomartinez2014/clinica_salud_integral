import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

type CrearMedico = Pick<
  Prisma.MedicoUncheckedCreateInput,
  'nombre' | 'apellido' | 'email' | 'telefono' | 'especialidadId'
>;

@Injectable()
export class MedicosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.medico.findMany();
  }

  findOne(id: number) {
    return this.prisma.medico.findUnique({ where: { id } });
  }

  create(data: CrearMedico) {
    return this.prisma.medico.create({ data });
  }

  async update(id: number, data: Partial<CrearMedico>) {
    try {
      return await this.prisma.medico.update({ where: { id }, data });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Médico no encontrado');
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.medico.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Médico no encontrado');
      }
      throw error;
    }
  }
}
