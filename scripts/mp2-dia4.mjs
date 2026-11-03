import assert from "node:assert/strict";
import { app } from "../dist/src/app.js";
import { prisma } from "../dist/src/config/prisma.js";
const server = app.listen(0, "127.0.0.1");
await new Promise((r) => server.once("listening", r));
const base = "http://127.0.0.1:" + server.address().port + "/api";
const marca = Date.now();
const email = "dia4." + marca + "@example.test";
const ids = [];
let checks = 0;
async function call(path, token, status = 200, body) {
  const res = await fetch(base + path, {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  assert.equal(res.status, status);
  checks++;
  return res.json();
}
try {
  await call("/auth/register", null, 201, {
    nombre: "Prueba día 4",
    email,
    password: "PruebaTemporalMP2!",
    role: "RECEPCIONISTA",
  });
  const { token } = await call("/auth/login", null, 200, {
    email,
    password: "PruebaTemporalMP2!",
  });
  for (const apellido of ["Uno", "Dos"]) {
    const { paciente } = await call("/pacientes", token, 201, {
      nombre: "Busqueda" + marca,
      apellido,
      email: apellido + "." + marca + "@example.test",
      fechaNacimiento: "1990-01-01",
    });
    ids.push(paciente.id);
  }
  const q = "Busqueda" + marca;
  const primera = await call(
    "/pacientes?query=" + q + "&pagina=1&limite=1",
    token,
  );
  assert.equal(primera.total, 2);
  assert.equal(primera.totalPaginas, 2);
  assert.equal(primera.data.length, 1);
  const segunda = await call(
    "/pacientes?query=" + q + "&pagina=2&limite=1",
    token,
  );
  assert.notEqual(primera.data[0].id, segunda.data[0].id);
  const palabras = await call(
    "/pacientes?query=" +
      encodeURIComponent(q.toLowerCase() + " UNO") +
      "&pagina=1",
    token,
  );
  assert.equal(palabras.total, 1);
  const correo = await call(
    "/pacientes?query=" +
      encodeURIComponent("Uno." + marca + "@example.test") +
      "&pagina=1",
    token,
  );
  assert.equal(correo.total, 1);
  const vacia = await call(
    "/pacientes?query=sincoincidencias" + marca + "&pagina=1",
    token,
  );
  assert.equal(vacia.total, 0);
  assert.deepEqual(vacia.data, []);
  const todos = await call("/pacientes?query=&pagina=1&limite=100", token);
  assert(todos.data.some((p) => p.id === ids[0]));
  const anterior = await call("/pacientes", token);
  assert(Array.isArray(anterior));
  await call("/pacientes?pagina=0", token, 400);
  await call("/pacientes?limite=101", token, 400);
  await call("/pacientes?pagina=1", null, 401);
  console.log(
    "OK día 4: " +
      checks +
      " solicitudes; búsqueda real, páginas, validación y compatibilidad.",
  );
} finally {
  await prisma.paciente.deleteMany({ where: { id: { in: ids } } });
  await prisma.user.deleteMany({ where: { email } });
  await new Promise((r) => server.close(r));
  await prisma.$disconnect();
}
