import { CreateMedicoDto } from './dto/create-medico.dto.js';
import { UpdateMedicoDto } from './dto/update-medico.dto.js';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class MedicosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.medico.findMany();
  }

  findOne(id: number) {
    return this.prisma.medico.findUnique({ where: { id } });
  }

  create(data: CreateMedicoDto) {
    return this.prisma.medico.create({ data });
  }

  async update(id: number, data: UpdateMedicoDto) {
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
