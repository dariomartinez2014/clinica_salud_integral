# MP2 — Día 2

Se agregaron PUT y DELETE de pacientes para conectar los botones del frontend.

- `PUT /api/pacientes/:id` recibe campos parciales y devuelve el paciente actualizado. Valida el ID, los campos y que el cuerpo no esté vacío.
- `DELETE /api/pacientes/:id` responde 204. Si el paciente tiene citas, responde 409 y conserva sus datos.
- Ambas rutas mantienen el token y el rol RECEPCIONISTA del router.
- Para citas se usan los endpoints existentes: POST de recepción y PATCH de estado con rol MEDICO. No se cambiaron permisos.

## Pruebas

```bash
npm run build
node scripts/mp2-dia2.mjs
npm run test:integration
```

Pasaron las 27 comprobaciones del CRUD y las 35 comprobaciones de integración existentes. Incluyen creación, edición persistida, eliminación, validación, duplicados, registros inexistentes, permisos y cambios de estado.

El script crea sus propios registros ficticios y los elimina al finalizar. Necesita la base de datos local configurada en `.env`.

Esta rama continúa el trabajo del día 1. Su PR debe integrarse antes que este.
