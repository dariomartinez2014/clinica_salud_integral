# MP2 — Día 1: conexión con el dashboard

El frontend de la clínica necesita consultar las citas por estado. También necesita CORS porque Vite y Express usan puertos distintos.

## Cambios

- CORS permite peticiones desde `http://localhost:5173`, incluido el token en Authorization.
- `GET /api/citas` pide token y rol `RECEPCIONISTA`.
- `estado=Programada` busca citas con estado `PROGRAMADA`.
- `estado=Completada` busca citas `COMPLETADA` con fecha de hoy en Guatemala. La base no guarda una fecha aparte de finalización.
- Si el estado no es válido, responde 400. Sin filtro devuelve todas las citas.
- La respuesta tiene `{ data, total }`. Los pacientes y médicos siguen devolviendo arrays.

## Pruebas

`npm run build` pasa. Con PostgreSQL conectado, las consultas responden 200 y el preflight de CORS responde 204. Sin token se recibe 401; con un estado inválido, 400.

En el frontend también se probaron el login, el spinner, el error, el botón Reintentar y el detalle con IDs numéricos.

Los cambios anteriores de NestJS quedaron fuera de este commit. Las credenciales de prueba no se suben a Git.
