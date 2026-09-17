import { ValidationPipe } from '@nestjs/common';
import { PacientesService } from '../dist/src/pacientes/pacientes.service.js';
import { MedicosService } from '../dist/src/medicos/medicos.service.js';
import { CreatePacienteDto } from '../dist/src/pacientes/dto/create-paciente.dto.js';
import { CreateMedicoDto } from '../dist/src/medicos/dto/create-medico.dto.js';
import 'dotenv/config';
import assert from 'node:assert/strict';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../dist/src/app.module.js';
import { PrismaService } from '../dist/src/prisma/prisma.service.js';

// Ejecutar contra la base de práctica. Solo se modifican registros creados aquí.
const app = await NestFactory.create(AppModule, { logger: false });
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
for (const [serviceType, dtoType] of [
  [PacientesService, CreatePacienteDto],
  [MedicosService, CreateMedicoDto],
]) {
  const service = app.get(serviceType);
  const create = service.create.bind(service);
  service.create = (dto) => {
    assert.ok(
      dto instanceof dtoType,
      'El Service debe recibir una instancia del DTO',
    );
    assert.equal(
      Object.hasOwn(dto, 'campoExtra'),
      false,
      'El campo extra debe desaparecer antes del Service',
    );
    return create(dto);
  };
}
const created = [];
let checks = 0;
try {
  await app.listen(0, '127.0.0.1');
  const base = await app.getUrl();
  const prisma = app.get(PrismaService);
  const specialty = await prisma.especialidad.findFirst({
    select: { id: true },
    orderBy: { id: 'asc' },
  });
  assert.ok(
    specialty,
    'Debe existir una especialidad en la base de práctica para crear el médico.',
  );
  console.log('Especialidad usada: ' + specialty.id);
  async function request(method, path, status, body) {
    const response = await fetch(base + path, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await response.json();
    assert.equal(
      response.status,
      status,
      method + ' ' + path + ': HTTP inesperado',
    );
    if (status >= 400) assert.equal(json.statusCode, status);
    checks++;
    console.log(method + ' ' + path + ' -> ' + status);
    return json;
  }
  for (const [route, model, extra] of [
    ['pacientes', 'paciente', { fechaNacimiento: '2000-01-15T00:00:00.000Z' }],
    ['medicos', 'medico', { especialidadId: specialty.id }],
  ]) {
    const payload = {
      nombre: 'Prueba CRUD',
      apellido: 'Temporal',
      email: 'crud-' + route + '-' + crypto.randomUUID() + '@example.com',
      telefono: '55550000',
      ...extra,
    };
    await request('POST', '/' + route, 400, {
      ...payload,
      email: 'correo-invalido',
    });
    await request('POST', '/' + route, 400, {});
    await request('POST', '/' + route, 400, { ...payload, nombre: 123 });
    if (route === 'pacientes') {
      await request('POST', '/' + route, 400, {
        ...payload,
        fechaNacimiento: '2099-01-01',
      });
      await request('POST', '/' + route, 400, {
        ...payload,
        fechaNacimiento: '2025-02-30',
      });
      payload.fechaNacimiento = '2000-01-15';
    } else {
      await request('POST', '/' + route, 400, {
        ...payload,
        especialidadId: 1.5,
      });
      await request('POST', '/' + route, 400, {
        ...payload,
        especialidadId: '1',
      });
    }
    const item = await request('POST', '/' + route, 201, {
      ...payload,
      campoExtra: 'descartar',
    });
    created.push({ model, id: item.id, email: payload.email });
    assert.ok(Number.isInteger(item.id));
    assert.equal(item.email, payload.email);
    await request('PUT', '/' + route + '/' + item.id, 400, {
      email: 'invalido',
    });
    await request('PUT', '/' + route + '/' + item.id, 400, { nombre: null });
    if (route === 'pacientes') {
      await request('PUT', '/' + route + '/' + item.id, 400, {
        fechaNacimiento: '2099-01-01',
      });
      await request('PUT', '/' + route + '/' + item.id, 200, {
        fechaNacimiento: '2001-02-03',
      });
    }
    const list = await request('GET', '/' + route, 200);
    assert.ok(Array.isArray(list));
    assert.ok(list.some((row) => row.id === item.id));
    const found = await request('GET', '/' + route + '/' + item.id, 200);
    assert.equal(found.email, payload.email);
    const updated = await request('PUT', '/' + route + '/' + item.id, 200, {
      nombre: 'Prueba actualizada',
      telefono: null,
    });
    assert.equal(updated.nombre, 'Prueba actualizada');
    assert.equal(updated.telefono, null);
    assert.equal(updated.apellido, payload.apellido);
    const persisted = await request('GET', '/' + route + '/' + item.id, 200);
    assert.equal(persisted.nombre, 'Prueba actualizada');
    assert.equal(persisted.telefono, null);
    const deleted = await request('DELETE', '/' + route + '/' + item.id, 200);
    assert.equal(deleted.id, item.id);
    await request('GET', '/' + route + '/' + item.id, 404);
    await request('PUT', '/' + route + '/' + item.id, 404, {
      nombre: 'No existe',
    });
    await request('DELETE', '/' + route + '/' + item.id, 404);
    for (const method of ['GET', 'PUT', 'DELETE']) {
      await request(
        method,
        '/' + route + '/abc',
        400,
        method === 'PUT' ? { nombre: 'ID inválido' } : undefined,
      );
    }
  }
  console.log(
    'OK: ' +
      checks +
      ' solicitudes; diez endpoints, persistencia, 404 y parámetros inválidos.',
  );
} finally {
  try {
    const prisma = app.get(PrismaService);
    for (const item of created.reverse()) {
      await prisma[item.model].deleteMany({
        where: { id: item.id, email: item.email },
      });
    }
  } finally {
    await app.close();
  }
}
