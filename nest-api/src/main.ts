// Apunte de estudio: Aquí monto la aplicación y conecto su entrada con el elemento raíz del HTML.
import { PrismaExceptionFilter } from './prisma/prisma-exception.filter.js';
import { ValidationPipe } from '@nestjs/common';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new PrismaExceptionFilter(app.getHttpAdapter()));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
