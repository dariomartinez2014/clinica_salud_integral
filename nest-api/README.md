# NestJS — tarea del lunes

API de la Clínica Salud Integral con arquitectura Module / Controller / Service.
Reutiliza exactamente el schema y la base de datos de la Semana 5.

## Arranque

Requisitos: Node.js 22.12 o posterior y pnpm 11.19.
Desde esta carpeta:

```sh
pnpm install
# Copiar el .env de Semana 5 a esta carpeta, conservando DATABASE_URL.
pnpm prisma generate
pnpm run build
pnpm run start:dev
```

No ejecutar migraciones ni seed. Si Express ocupa el puerto 3000, detenerlo o elegir otro PORT en .env.
El .env es local y no se incluye en Git.

## Endpoints

| Método | Ruta | Consulta |
| --- | --- | --- |
| GET | /pacientes | prisma.paciente.findMany() |
| GET | /medicos | prisma.medico.findMany() |

Probar http://localhost:3000/pacientes y http://localhost:3000/medicos en Postman o Thunder Client. También se incluye solicitudes.http.

## Arquitectura

Cada Controller llama a su Service. Los Services reciben PrismaService por constructor.
PrismaModule usa @Global(), exporta PrismaService y se importa una sola vez en AppModule.
PrismaService usa PrismaPg, conecta al iniciar y desconecta al cerrar Nest.
main.ts carga dotenv/config antes de los demás imports.

El schema genera el cliente en generated/prisma. Desde src/prisma/prisma.service.ts corresponde ../../generated/prisma/client.js; se corrige así la ruta inconsistente del ejemplo de la tarea. La extensión .js se usa por ESM.
La compilación incluye el cliente generado, por lo que producción arranca con `pnpm run start:prod` desde dist/src/main.js.

## Verificación del 14 de septiembre de 2026

- Generación del cliente y compilación con Nest correctas.
- GET /pacientes: HTTP 200, 3 registros.
- GET /medicos: HTTP 200, 7 registros.
- Las respuestas coinciden con las consultas a PostgreSQL usando el .env original.
- Se usó un puerto temporal para la prueba, sin modificar registros, migraciones ni seed.

Los endpoints sin autenticación corresponden al alcance académico del lunes.
La API Express anterior permanece en la raíz del repositorio.
El Pull Request debe revisarse antes del merge hacia main.
