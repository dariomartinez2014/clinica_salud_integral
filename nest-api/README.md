# Clínica — CRUD con NestJS y PrismaService

La API NestJS vive en nest-api. Reutiliza los modelos Paciente y Medico y la base PostgreSQL de la Semana 5.

## Arrancar

Desde la carpeta nest-api, con Node.js 22.12 o posterior y pnpm 11:

~~~powershell
pnpm install
pnpm prisma:generate
pnpm run start:dev
~~~

Debe existir un archivo .env local con DATABASE_URL. Si el puerto 3000 está ocupado, usa otra terminal y ejecuta $env:PORT='3001' antes de iniciar. Cambia también baseUrl en Postman.
No se necesitan migraciones ni seed para esta entrega.

## Endpoints

| Método | Pacientes | Médicos | Resultado |
| --- | --- | --- | --- |
| GET | /pacientes | /medicos | 200: lista |
| GET | /pacientes/:id | /medicos/:id | 200: registro; 404 si no existe |
| POST | /pacientes | /medicos | 201: registro creado |
| PUT | /pacientes/:id | /medicos/:id | 200: registro actualizado; 404 si no existe |
| DELETE | /pacientes/:id | /medicos/:id | 200: registro eliminado; 404 si no existe |

## Cómo funciona

- Los decoradores @Get, @Post, @Put y @Delete definen las rutas en cada Controller.
- @Param extrae el ID; ParseIntPipe lo convierte a number y responde 400 si no es un entero válido.
- @Body extrae el JSON y lo entrega al Service. El tipo any es temporal: los DTO con class-validator corresponden a la siguiente clase.
- Los Services reciben PrismaService por constructor y usan findMany, findUnique, create, update y delete.
- findUnique devuelve null si no existe el registro. El Controller espera la promesa con await y lanza NotFoundException para responder 404.
- En update y delete, el Service transforma el error P2025 de Prisma en 404. Los demás errores se propagan.
- Los tipos de creación toman los campos editables del modelo Prisma. Partial permite enviar solo los campos que cambian al actualizar.

Paciente requiere nombre, apellido, email y fechaNacimiento en formato ISO, por ejemplo 2000-01-15T00:00:00.000Z. Medico requiere nombre, apellido, email y especialidadId de una especialidad existente. telefono es opcional y acepta null.
Los emails deben ser únicos. La validación de cuerpos y las respuestas específicas para emails duplicados o relaciones inválidas quedan para una entrega posterior. No elimines registros con citas relacionadas: el esquema restringe esa operación.

## Prueba con Postman

1. Inicia la API e importa crud-martes.postman_collection.json.
2. Revisa las variables baseUrl y especialidadId. En la base de práctica se comprobó que existe la especialidad 1.
3. Ejecuta las carpetas en orden, desde Crear hasta Confirmar 404 después de eliminar, o utiliza el Collection Runner.
4. Los POST guardan automáticamente pacienteId y medicoId. Cada ejecución usa emails de ejemplo únicos.
5. Comprueba los doce resultados: los diez endpoints y ambos GET con ID inexistente después de eliminar los registros de prueba.

solicitudes.http incluye el mismo recorrido para la extensión REST Client de VS Code. Sus referencias a respuestas pertenecen a REST Client; para Postman usa el JSON de la colección.

## Prueba automática

~~~powershell
pnpm run test:e2e
pnpm run lint
~~~

La prueba compila y abre Nest en un puerto libre. Ejecuta 24 solicitudes HTTP contra PostgreSQL: los diez endpoints, persistencia de actualizaciones parciales, 404 en GET/PUT/DELETE y 400 con IDs inválidos. Crea datos temporales con email de example.com y los elimina al terminar, incluso si falla una comprobación. Solo modifica esos registros; usa una base de práctica con al menos una especialidad.

Verificado el 15 de septiembre de 2026: compilación y lint correctos; las 24 solicitudes pasaron. Los casos manuales de Postman quedan listos para repetirlos.

## Git

La rama feature/crud-pacientes parte de main después del merge del PR #2 del lunes. El PR del martes debe revisarse antes de su merge.
