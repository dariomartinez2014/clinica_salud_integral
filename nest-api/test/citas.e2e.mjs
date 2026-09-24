import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../dist/src/app.module.js';
import { PrismaService } from '../dist/src/prisma/prisma.service.js';
import { PacientesService } from '../dist/src/pacientes/pacientes.service.js';
import { PrismaExceptionFilter } from '../dist/src/prisma/prisma-exception.filter.js';

const app = await NestFactory.create(AppModule, { logger: false });
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
app.useGlobalFilters(new PrismaExceptionFilter(app.getHttpAdapter()));
const prisma = app.get(PrismaService);
const pacientes = app.get(PacientesService);
const originalFindOne = pacientes.findOne.bind(pacientes);
const consultas = [];
pacientes.findOne = (id) => {
  consultas.push(id);
  return originalFindOne(id);
};
const created = {};
let checks = 0;
try {
  await app.listen(0, '127.0.0.1');
  const base = await app.getUrl();
  // Tokens locales de prueba: no se crean cuentas ni se guardan contraseñas.
  const token = jwt.sign(
    { id: 1, email: 'test@example.com', role: 'RECEPCIONISTA' },
    process.env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '5m' },
  );
  const medicoToken = jwt.sign(
    { id: 1, email: 'test@example.com', role: 'MEDICO' },
    process.env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '5m' },
  );
  const request = async (method, status, body, auth = token) => {
    const res = await fetch(base + '/citas', {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: 'Bearer ' + auth } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const json = await res.json();
    assert.equal(res.status, status, JSON.stringify(json));
    checks++;
    console.log(method + ' /citas -> ' + status);
    return json;
  };
  for (const method of ['GET', 'POST']) {
    await request(method, 401, undefined, null);
    await request(method, 403, undefined, medicoToken);
  }
  created.especialidad = await prisma.especialidad.create({
    data: { nombre: 'Test citas ' + randomUUID() },
  });
  created.medico = await prisma.medico.create({
    data: {
      nombre: 'Test',
      apellido: 'Citas',
      email: randomUUID() + '@example.com',
      especialidadId: created.especialidad.id,
    },
  });
  created.paciente = await prisma.paciente.create({
    data: {
      nombre: 'Test',
      apellido: 'Citas',
      email: randomUUID() + '@example.com',
      fechaNacimiento: new Date('2000-01-01'),
    },
  });
  const payload = {
    pacienteId: created.paciente.id,
    medicoId: created.medico.id,
    fecha: '2030-10-01T15:00:00.000Z',
    motivo: 'Prueba de comunicación entre módulos',
  };
  // Buscar un ID realmente inexistente, sin depender de los datos del usuario.
  let missingId = 2147483647;
  while (await prisma.paciente.findUnique({ where: { id: missingId } }))
    missingId--;
  const missing = await request('POST', 404, {
    ...payload,
    pacienteId: missingId,
  });
  assert.equal(missing.message, 'El paciente no existe');
  assert.deepEqual(
    consultas,
    [missingId],
    'El 404 debe pasar por PacientesService.findOne',
  );
  assert.equal(
    await prisma.cita.count({ where: { medicoId: created.medico.id } }),
    0,
  );
  const cita = await request('POST', 201, payload);
  assert.deepEqual(
    consultas,
    [missingId, created.paciente.id],
    'La creación debe reutilizar el mismo PacientesService',
  );
  assert.equal(cita.pacienteId, payload.pacienteId);
  assert.equal(cita.medicoId, payload.medicoId);
  assert.equal(cita.fecha, payload.fecha);
  assert.equal(cita.estado, 'PROGRAMADA');
  assert.equal(cita.motivo, payload.motivo);
  const list = await request('GET', 200);
  assert.ok(Array.isArray(list));
  assert.ok(list.some((row) => row.id === cita.id));
  assert.equal(
    (await prisma.cita.findUnique({ where: { id: cita.id } })).pacienteId,
    payload.pacienteId,
  );
  console.log(
    'OK: ' +
      checks +
      ' solicitudes; inyección entre módulos, 404, creación, listado, persistencia y guards.',
  );
} finally {
  try {
    if (created.medico)
      await prisma.cita.deleteMany({ where: { medicoId: created.medico.id } });
    if (created.paciente)
      await prisma.paciente.delete({ where: { id: created.paciente.id } });
    if (created.medico)
      await prisma.medico.delete({ where: { id: created.medico.id } });
    if (created.especialidad)
      await prisma.especialidad.delete({
        where: { id: created.especialidad.id },
      });
  } finally {
    await app.close();
  }
}
