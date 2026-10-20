# MP2 — Día 1: soporte para el dashboard React

Este cambio conecta el frontend `dariomartinez2014/clinica-frontend` con el backend Express existente.

- CORS permite el origen de Vite `http://localhost:5173` y el preflight de Authorization antes de ejecutar la autenticación.
- `GET /api/citas` exige JWT y rol `RECEPCIONISTA`, igual que el directorio y los pacientes.
- `estado=Programada` consulta `PROGRAMADA`.
- `estado=Completada` consulta `COMPLETADA` y la fecha de la cita dentro del día actual de Guatemala, para “Completadas Hoy”. No existe fecha independiente de finalización en el modelo actual.
- Un estado no admitido responde 400; sin estado se listan todas las citas.
- Respuesta: `{ data: Cita[], total: number }`. Los listados existentes de pacientes y médicos conservan sus arrays.

## Verificación

`npm run build` correcto. API real con PostgreSQL: health 200, preflight 204 con Authorization, consultas de pacientes/médicos/citas 200, sin token 401 y estado inválido 400. El frontend validó login, spinner, error, reintento y detalle con IDs numéricos.

No se alteraron los módulos NestJS ni los cambios de trabajo previos. No se incluyen credenciales de la cuenta local de prueba.
