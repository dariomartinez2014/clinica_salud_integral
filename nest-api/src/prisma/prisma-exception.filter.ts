import {
  ArgumentsHost,
  Catch,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '../../generated/prisma/client.js';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    switch (exception.code) {
      case 'P2002':
        return super.catch(
          new ConflictException('Ya existe un registro con ese valor único'),
          host,
        );
      case 'P2025':
        return super.catch(
          new NotFoundException('Registro no encontrado'),
          host,
        );
      default:
        // Nest responde 500 sin exponer detalles internos de Prisma.
        return super.catch(exception, host);
    }
  }
}
