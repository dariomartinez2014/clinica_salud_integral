import { setupSwagger } from './swagger.js';
import { PrismaExceptionFilter } from './prisma/prisma-exception.filter.js';
import { ValidationPipe } from '@nestjs/common';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new PrismaExceptionFilter(app.getHttpAdapter()));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  setupSwagger(app);
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
