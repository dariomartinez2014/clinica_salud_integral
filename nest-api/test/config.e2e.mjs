import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { createServer } from 'node:net';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

const appModuleUrl = new URL('../dist/src/app.module.js', import.meta.url).href;
const originalCwd = process.cwd();
const temp = mkdtempSync(join(tmpdir(), 'nest-config-test-'));
const secret = 'test-only-config-secret-with-more-than-32-characters';
const database = 'postgresql://test:test@127.0.0.1:5432/test';
function clearConfig() {
  for (const key of ['DATABASE_URL', 'JWT_SECRET', 'PORT'])
    delete process.env[key];
}
try {
  process.chdir(temp);
  let scenario = 0;
  for (const [variables, message] of [
    [{ DATABASE_URL: database }, /JWT_SECRET.*required/],
    [{ DATABASE_URL: database, JWT_SECRET: 'short' }, /JWT_SECRET.*32/],
    [{ JWT_SECRET: secret }, /DATABASE_URL.*required/],
    [
      { DATABASE_URL: database, JWT_SECRET: secret, PORT: 'invalid' },
      /PORT.*number/,
    ],
    [
      { DATABASE_URL: database, JWT_SECRET: secret, PORT: '70000' },
      /PORT.*65535/,
    ],
  ]) {
    clearConfig();
    Object.assign(process.env, variables);
    await assert.rejects(async () => {
      const { AppModule } = await import(
        appModuleUrl + '?invalid=' + scenario++
      );
      await Promise.all(Reflect.getMetadata('imports', AppModule));
    }, message);
  }
  clearConfig();
  Object.assign(process.env, { DATABASE_URL: database, JWT_SECRET: secret });
  const { PrismaService } =
    await import('../dist/src/prisma/prisma.service.js');
  PrismaService.prototype.onModuleInit = async () => {};
  PrismaService.prototype.onModuleDestroy = async () => {};
  const { AppModule: DefaultModule } = await import(appModuleUrl + '?defaults');
  const context = await NestFactory.createApplicationContext(DefaultModule, {
    logger: false,
  });
  try {
    assert.equal(context.get(ConfigService).get('PORT'), 3000);
  } finally {
    await context.close();
  }

  const reservation = createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const port = reservation.address().port;
  await new Promise((resolve) => reservation.close(resolve));
  writeFileSync(
    join(temp, '.env'),
    `DATABASE_URL=${database}\nJWT_SECRET=${secret}\nPORT=${port}\n`,
  );
  for (const key of ['DATABASE_URL', 'JWT_SECRET', 'PORT'])
    delete process.env[key];
  process.chdir(temp);
  const { AppModule } = await import(appModuleUrl + '?env-file');
  // Solo se sustituye persistencia: AuthService, bcrypt y Guards son reales.
  PrismaService.prototype.onModuleInit = async () => {};
  PrismaService.prototype.onModuleDestroy = async () => {};
  const app = await NestFactory.create(AppModule, { logger: false });
  try {
    const config = app.get(ConfigService);
    assert.equal(config.getOrThrow('PORT'), port);
    assert.equal(config.getOrThrow('JWT_SECRET'), secret);
    assert.equal(config.getOrThrow('DATABASE_URL'), database);
    const prisma = app.get(PrismaService);
    const password = await bcrypt.hash('Prueba123456', 4);
    prisma.user.findUnique = async () => ({
      id: 1,
      email: 'test@example.com',
      role: 'RECEPCIONISTA',
      password,
    });
    prisma.paciente.findMany = async () => [];
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.listen(config.getOrThrow('PORT'), '127.0.0.1');
    const base = `http://127.0.0.1:${port}`;
    const login = await fetch(base + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Prueba123456',
      }),
    });
    assert.equal(login.status, 200);
    const { token } = await login.json();
    const payload = jwt.verify(token, secret);
    assert.equal(payload.id, 1);
    assert.equal(payload.exp - payload.iat, 8 * 60 * 60);
    assert.equal(
      (
        await fetch(base + '/pacientes', {
          headers: { Authorization: `Bearer ${token}` },
        })
      ).status,
      200,
    );
    assert.equal((await fetch(base + '/pacientes')).status, 401);
    const wrongToken = jwt.sign(
      { id: 1, email: 'test@example.com', role: 'RECEPCIONISTA' },
      'another-secret',
    );
    assert.equal(
      (
        await fetch(base + '/pacientes', {
          headers: { Authorization: `Bearer ${wrongToken}` },
        })
      ).status,
      401,
    );
    console.log(
      'OK: 5 rechazos de configuraci�n, variables sin .env, puerto por defecto 3000, .env con puerto alternativo, login JWT 8h y Guard 200/401. Persistencia simulada.',
    );
  } finally {
    await app.close();
  }
} finally {
  process.chdir(originalCwd);
  rmSync(temp, { recursive: true, force: true });
}
