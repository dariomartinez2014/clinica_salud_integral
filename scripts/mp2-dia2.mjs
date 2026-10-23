import assert from "node:assert/strict";
import { app } from "../dist/src/app.js";
import { prisma } from "../dist/src/config/prisma.js";

const server = app.listen(0, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));
const base = `http://127.0.0.1:${server.address().port}/api`;
const stamp = Date.now();
const emails = [];
const pacientes = [];
const citas = [];
let checks = 0;
async function call(method, path, body, token, expected) {
  const res = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = res.status === 204 ? null : await res.json();
  assert.equal(
    res.status,
    expected,
    `${method} ${path}: ${JSON.stringify(data)}`,
  );
  checks++;
  return data;
}
try {
  const tokens = {};
  for (const role of ["RECEPCIONISTA", "MEDICO"]) {
    const email = `mp2-dia2.${role.toLowerCase()}.${stamp}@example.test`;
    emails.push(email);
    const account = {
      nombre: "Prueba temporal MP2",
      email,
      password: "PruebaTemporalMP2!",
      role,
    };
    await call("POST", "/auth/register", account, null, 201);
    tokens[role] = (
      await call(
        "POST",
        "/auth/login",
        { email, password: account.password },
        null,
        200,
      )
    ).token;
  }
  const datos = {
    nombre: "Prueba MP2",
    apellido: "Temporal",
    email: `mp2-paciente.${stamp}@example.test`,
    fechaNacimiento: "1990-01-01",
    telefono: "55550000",
  };
  const creado = (
    await call("POST", "/pacientes", datos, tokens.RECEPCIONISTA, 201)
  ).paciente;
  pacientes.push(creado.id);
  await call("POST", "/pacientes", datos, tokens.RECEPCIONISTA, 409);
  await call(
    "POST",
    "/pacientes",
    { ...datos, fechaNacimiento: "2099-01-01" },
    tokens.RECEPCIONISTA,
    400,
  );
  const actualizado = await call(
    "PUT",
    `/pacientes/${creado.id}`,
    { nombre: "Prueba actualizada", telefono: "55551111" },
    tokens.RECEPCIONISTA,
    200,
  );
  assert.equal(actualizado.nombre, "Prueba actualizada");
  const persistido = await call(
    "GET",
    `/pacientes/${creado.id}`,
    null,
    tokens.RECEPCIONISTA,
    200,
  );
  assert.equal(persistido.telefono, "55551111");
  await call("PUT", `/pacientes/${creado.id}`, {}, tokens.RECEPCIONISTA, 400);
  await call(
    "PUT",
    `/pacientes/${creado.id}`,
    { id: 999 },
    tokens.RECEPCIONISTA,
    400,
  );
  await call(
    "PUT",
    `/pacientes/${creado.id}`,
    { email: "invalido" },
    tokens.RECEPCIONISTA,
    400,
  );
  await call(
    "PUT",
    "/pacientes/2147483647",
    { nombre: "No existe" },
    tokens.RECEPCIONISTA,
    404,
  );
  await call("DELETE", `/pacientes/${creado.id}`, null, null, 401);
  await call("DELETE", `/pacientes/${creado.id}`, null, tokens.MEDICO, 403);
  await call(
    "PUT",
    `/pacientes/${creado.id}`,
    { nombre: "Sin permiso" },
    tokens.MEDICO,
    403,
  );
  const medicos = await call(
    "GET",
    "/medicos",
    null,
    tokens.RECEPCIONISTA,
    200,
  );
  assert(medicos.length > 0, "Se necesita un médico registrado");
  const cita = await call(
    "POST",
    "/citas",
    {
      pacienteId: creado.id,
      medicoId: medicos[0].id,
      fecha: "2036-06-10T16:00:00.000Z",
      motivo: "Prueba temporal de CRUD MP2",
    },
    tokens.RECEPCIONISTA,
    201,
  );
  citas.push(cita.id);
  await call(
    "DELETE",
    `/pacientes/${creado.id}`,
    null,
    tokens.RECEPCIONISTA,
    409,
  );
  await call(
    "PATCH",
    `/citas/${cita.id}/status`,
    { status: "COMPLETADA" },
    tokens.RECEPCIONISTA,
    403,
  );
  let agenda = await call(
    "GET",
    `/medicos/${medicos[0].id}/citas`,
    null,
    tokens.MEDICO,
    200,
  );
  assert.equal(agenda.find((item) => item.id === cita.id).estado, "PROGRAMADA");
  const cambio = await call(
    "PATCH",
    `/citas/${cita.id}/status`,
    { status: "COMPLETADA" },
    tokens.MEDICO,
    200,
  );
  assert.equal(cambio.estado, "COMPLETADA");
  await call(
    "PATCH",
    `/citas/${cita.id}/status`,
    { status: "PROGRAMADA" },
    tokens.MEDICO,
    400,
  );
  agenda = await call(
    "GET",
    `/medicos/${medicos[0].id}/citas`,
    null,
    tokens.MEDICO,
    200,
  );
  assert.equal(agenda.find((item) => item.id === cita.id).estado, "COMPLETADA");
  await prisma.cita.deleteMany({ where: { id: { in: citas } } });
  await call(
    "DELETE",
    `/pacientes/${creado.id}`,
    null,
    tokens.RECEPCIONISTA,
    204,
  );
  await call("GET", `/pacientes/${creado.id}`, null, tokens.RECEPCIONISTA, 404);
  await call(
    "DELETE",
    `/pacientes/${creado.id}`,
    null,
    tokens.RECEPCIONISTA,
    404,
  );
  console.log(
    `OK MP2 día 2: ${checks} solicitudes comprobadas; CRUD persistido, errores y permisos correctos.`,
  );
} finally {
  await prisma.cita.deleteMany({ where: { id: { in: citas } } });
  await prisma.paciente.deleteMany({ where: { id: { in: pacientes } } });
  await prisma.user.deleteMany({ where: { email: { in: emails } } });
  await new Promise((resolve) => server.close(resolve));
  await prisma.$disconnect();
}
