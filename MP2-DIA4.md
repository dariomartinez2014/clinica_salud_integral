# MP2 — Día 4

Se agregó búsqueda real al listado de pacientes sin cambiar los permisos del router.

```text
GET /api/pacientes?query=nombre&pagina=1&limite=12
```

Devuelve `{ data, total, pagina, totalPaginas }`. Busca cada palabra en nombre, apellido o correo, sin distinguir mayúsculas. La query puede tener hasta 150 caracteres. La página empieza en 1 y el límite permitido es de 1 a 100.

Sin parámetros de paginación se conserva la respuesta anterior de array, para las pantallas existentes. La query vacía no aplica condiciones de búsqueda.

## Comprobaciones

```bash
npm run build
node scripts/mp2-dia4.mjs
node scripts/mp2-dia2.mjs
```

Pasaron el build, las 14 solicitudes de búsqueda y las 27 comprobaciones del CRUD. Los datos ficticios del script se limpian al finalizar.

Esta rama continúa el backend del día 2. Ese PR debe integrarse primero.
