import { CreateMedicoDto } from './dto/create-medico.dto.js';
import { UpdateMedicoDto } from './dto/update-medico.dto.js';
import { Injectable } from '@nestjs/common';
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

  update(id: number, data: UpdateMedicoDto) {
    return this.prisma.medico.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.medico.delete({ where: { id } });
  }
}
