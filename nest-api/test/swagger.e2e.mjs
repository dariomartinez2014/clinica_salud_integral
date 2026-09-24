import 'dotenv/config';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../dist/src/app.module.js';
import { setupSwagger } from '../dist/src/swagger.js';
import { PrismaExceptionFilter } from '../dist/src/prisma/prisma-exception.filter.js';
const app = await NestFactory.create(AppModule, { logger: false });
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
app.useGlobalFilters(new PrismaExceptionFilter(app.getHttpAdapter()));
const document = setupSwagger(app);
let operations = 0;
try {
  assert.equal(document.info.title, 'Clínica Salud Integral');
  assert.equal(document.info.version, '1.0');
  assert.equal(document.components.securitySchemes.bearer.scheme, 'bearer');
  for (const [path, methods] of Object.entries(document.paths)) {
    for (const operation of Object.values(methods)) {
      operations++;
      assert.ok(operation.summary);
      assert.ok(operation.tags.length);
      if (!path.startsWith('/auth/')) assert.deepEqual(operation.security, [{ bearer: [] }]);
      else assert.ok(!operation.security?.length);
    }
  }
  assert.equal(operations, 14);
  const schemas = document.components.schemas;
  for (const name of ['CreatePacienteDto', 'UpdatePacienteDto', 'CreateMedicoDto', 'UpdateMedicoDto', 'CreateCitaDto', 'LoginDto', 'RegisterDto']) {
    assert.ok(schemas[name], name);
    for (const [field, property] of Object.entries(schemas[name].properties)) {
      assert.ok(property.type, name + '.' + field + ' necesita tipo');
      assert.notEqual(property.example, undefined, name + '.' + field + ' necesita ejemplo');
    }
  }
  assert.deepEqual(schemas.CreateCitaDto.required.sort(), ['fecha', 'medicoId', 'pacienteId']);
  assert.ok(!schemas.UpdatePacienteDto.required?.length);
  assert.ok(!schemas.UpdateMedicoDto.required?.length);
  assert.equal(schemas.CreatePacienteDto.properties.fechaNacimiento.format, 'date');
  assert.equal(schemas.CreateCitaDto.properties.fecha.format, 'date-time');
  assert.equal(schemas.CreateCitaDto.properties.pacienteId.type, 'number');
  await app.listen(0, '127.0.0.1');
  const base = await app.getUrl();
  const ui = await fetch(base + '/api/docs');
  assert.equal(ui.status, 200);
  assert.ok((await ui.text()).includes('Swagger UI'));
  const json = await fetch(base + '/api/docs-json');
  assert.equal(json.status, 200);
  assert.equal((await json.json()).info.title, document.info.title);
  assert.equal((await fetch(base + '/pacientes')).status, 401);
  const token = jwt.sign({ id: 1, email: 'test@example.com', role: 'RECEPCIONISTA' }, process.env.JWT_SECRET, { expiresIn: '5m' });
  const headers = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };
  assert.equal((await fetch(base + '/pacientes', { headers })).status, 200);
  for (const body of [{}, { pacienteId: -1, medicoId: 1, fecha: '2030-01-01' }, { pacienteId: 1, medicoId: '1', fecha: '2030-01-01' }, { pacienteId: 1, medicoId: 1, fecha: 'no-fecha' }]) {
    assert.equal((await fetch(base + '/citas', { method: 'POST', headers, body: JSON.stringify(body) })).status, 400);
  }
  console.log('OK: 14 operaciones, 7 DTOs con tipos y ejemplos, PartialType, Swagger UI/JSON, Bearer 401/200 y 4 cuerpos inválidos de Citas.');
} finally { await app.close(); }
