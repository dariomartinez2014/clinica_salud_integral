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
- @Body usa DTOs con class-validator. ValidationPipe global transforma el body en una instancia y descarta campos no declarados antes del Service.
- Los Services reciben PrismaService por constructor y usan findMany, findUnique, create, update y delete.
- findUnique devuelve null si no existe el registro. El Controller espera la promesa con await y lanza NotFoundException para responder 404.
- El filtro global PrismaExceptionFilter traduce P2002 a 409 y P2025 a 404. Los Services ya no capturan esos errores.
- Los DTOs declaran los campos editables del modelo Prisma. PartialType permite omitir campos al actualizar; skipNullProperties: false rechaza null en campos obligatorios. telefono conserva su opción de null.

Paciente requiere nombre, apellido, email y fechaNacimiento en formato ISO, por ejemplo 2000-01-15T00:00:00.000Z. Medico requiere nombre, apellido, email y especialidadId de una especialidad existente. telefono es opcional y acepta null.
Los emails deben ser únicos. Los cuerpos inválidos responden 400. Las respuestas específicas para emails duplicados o relaciones inválidas quedan para una entrega posterior. No elimines registros con citas relacionadas: el esquema restringe esa operación.

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

## Miércoles — DTOs y validación

Rama: feature/dtos-validacion, basada en el merge del martes.

Dependencias: class-validator, class-transformer y @nestjs/mapped-types. Los cuatro DTOs están en src/pacientes/dto y src/medicos/dto. El ValidationPipe de src/main.ts usa whitelist: true y transform: true.

Nombre y apellido requieren texto no vacío; email debe ser válido; telefono es texto opcional; especialidadId es un entero positivo. fechaNacimiento exige ISO válido y el Service rechaza fechas futuras tanto en POST como PUT, antes de Prisma. Se aceptan fechas como 2000-01-15 y se convierten a Date para Prisma.

Pruebas: pnpm run test:e2e y pnpm run lint. Se verificaron 40 solicitudes HTTP contra PostgreSQL, incluidos correos inválidos, campos obligatorios, fechas inválidas/futuras, actualizaciones parciales y CRUD. La prueba comprueba directamente que el Service recibe una instancia del DTO sin campoExtra.

Para Postman importa validacion-miercoles.postman_collection.json y ejecuta en orden. Ajusta baseUrl y especialidadId. Los registros de prueba se eliminan después de cada creación. Si Express ocupa 3000, inicia Nest con el puerto 3101:

~~~powershell
$env:PORT='3101'
pnpm run start:dev
~~~

El PR del miércoles debe revisarse antes del merge.

## Jueves — Exception Filters

Rama feature/exception-filters, desde el merge del PR #4 del miércoles.

El filtro src/prisma/prisma-exception.filter.ts captura únicamente PrismaClientKnownRequestError del cliente generado. Convierte P2002 en ConflictException (409) y P2025 en NotFoundException (404). Extiende BaseExceptionFilter para enviar la respuesta HTTP usando las excepciones built-in. Devolver solamente getResponse() desde catch no enviaría la respuesta; tampoco se relanza el error desde el filtro. Los demás códigos se delegan al filtro base con una respuesta 500 genérica.

Se registra en main.ts con app.useGlobalFilters(new PrismaExceptionFilter(app.getHttpAdapter())). Se eliminaron los try/catch de Prisma de ambos Services. Los Controllers no tienen try/catch y sus GET conservan NotFoundException. La validación del miércoles sigue activa.

Verificación: compilación y 42 solicitudes HTTP contra PostgreSQL, incluidos POST duplicados 409, PUT/DELETE inexistentes 404, GET inexistentes 404 y validaciones 400 en ambos módulos. Importa errores-jueves.postman_collection.json y ejecuta en orden en la base de práctica; ajusta baseUrl (3101 por defecto) y especialidadId si es necesario. Los datos temporales se eliminan en el recorrido.

El PR del jueves debe permanecer abierto hasta su revisión.

## Swagger (martes)

Documentación interactiva en `/api/docs`, definición OpenAPI en `/api/docs-json`. Consulta `DEMO-SWAGGER.md` para ejecutar el login y usar Authorize con solo el token.

## Configuración de entornos (jueves)

`ConfigModule` es global y valida la configuración al arrancar. `ConfigService` obtiene las variables tanto de `.env` como del entorno del proceso; en Docker se pueden inyectar sin crear un archivo `.env` dentro de la imagen. Las variables del proceso tienen prioridad.

- `DATABASE_URL`: obligatoria.
- `JWT_SECRET`: obligatoria, mínimo 32 caracteres; conserva el requisito anterior del proyecto, más estricto que el mínimo de 10 del ejemplo del curso.
- `PORT`: entero entre 1 y 65535, predeterminado 3000.

AuthService, JwtAuthGuard, PrismaService y main usan ConfigService. Los Guards ya estaban registrados como providers y aplicados por clase con `@UseGuards(JwtAuthGuard, RolesGuard)`. La configuración de la CLI de Prisma conserva dotenv porque se ejecuta fuera de Nest.

### Comprobación

Desde `nest-api`, con las dependencias y el cliente Prisma generados:

```sh
pnpm run test:config
```

La prueba usa un `.env` temporal y persistencia simulada. Comprueba cinco configuraciones inválidas, variables inyectadas sin `.env`, puerto predeterminado, un puerto alternativo cargado desde `.env`, login con bcrypt/JWT reales y acceso protegido 200/401. No modifica tu `.env` ni accede a una base de datos real.

Para comprobarlo manualmente contra tu base de datos, arranca con `pnpm start:dev`, realiza login desde Swagger y usa el token en Authorize. Cambia PORT en `.env`, reinicia y abre Swagger en el nuevo puerto. Quita temporalmente JWT_SECRET (también del entorno del proceso, si está definido) y reinicia: debe aparecer `Config validation error` indicando que JWT_SECRET es obligatorio. Restaura el secreto al finalizar.
