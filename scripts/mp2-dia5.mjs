import assert from 'node:assert/strict';
import { app } from '../dist/src/app.js';
import { prisma } from '../dist/src/config/prisma.js';
const server = app.listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const base = `http://127.0.0.1:${server.address().port}/api`;
const emails = [];
let checks = 0;
async function request(path, token, method = 'GET', body) {
  return fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
function status(response, expected) { assert.equal(response.status, expected); checks++; }
try {
  const tokens = {};
  const marca = Date.now();
  for (const role of ['GERENCIA', 'RECEPCIONISTA', 'MEDICO']) {
    const email = `mp2-dia5.${role.toLowerCase()}.${marca}@example.test`;
    const password = 'PruebaTemporalMP2!';
    const registered = await request('/auth/register', null, 'POST', { nombre: 'Prueba temporal Día 5', email, password, role });
    status(registered, 201);
    emails.push(email);
    const logged = await request('/auth/login', null, 'POST', { email, password });
    status(logged, 200);
    tokens[role] = (await logged.json()).token;
  }
  status(await request('/citas'), 401);
  status(await request('/citas', tokens.MEDICO), 403);
  const citas = await request('/citas', tokens.GERENCIA);
  status(citas, 200);
  const datos = await citas.json();
  assert(Array.isArray(datos.data)); checks++;
  status(await request('/citas', tokens.RECEPCIONISTA), 200);
  const reportes = await request('/reports/appointments-by-specialty', tokens.GERENCIA);
  status(reportes, 200);
  assert(Array.isArray(await reportes.json())); checks++;
  status(await request('/reports/appointments-by-specialty', tokens.RECEPCIONISTA), 403);
  status(await request('/citas', tokens.GERENCIA, 'POST', {}), 403);
  status(await request('/citas/2147483647/status', tokens.GERENCIA, 'PATCH', { status: 'COMPLETADA' }), 403);
  console.log(`OK: ${checks} comprobaciones reales de acceso, reportes y lectura de citas. No se crearon pacientes ni citas.`);
} finally {
  await prisma.user.deleteMany({ where: { email: { in: emails } } });
  await new Promise(resolve => server.close(resolve));
  await prisma.$disconnect();
}
