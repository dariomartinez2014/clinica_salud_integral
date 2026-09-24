# Martes — Documentación completa con Swagger

## Arranque

Desde nest-api:

```powershell
pnpm install
pnpm build
pnpm start:dev
```

Abre http://localhost:3000/api/docs (o el puerto definido en PORT). La definición OpenAPI está en /api/docs-json. Durante la verificación se utilizó temporalmente el puerto 3012.

## Demo sin Postman

1. Abre Autenticación → POST /auth/login → Try it out.
2. Escribe el correo y la contraseña de un usuario RECEPCIONISTA existente y pulsa Execute. Si necesitas uno nuevo, usa primero POST /auth/register con un correo distinto y role RECEPCIONISTA.
3. Copia el valor de token de la respuesta 200, sin comillas.
4. Pulsa Authorize, pega SOLO el token (sin Bearer), aplica las credenciales y cierra el diálogo.
5. Abre Pacientes → GET /pacientes → Try it out → Execute. Debe responder 200.
6. Abre Schemas para ver los campos, ejemplos y tipos de CreatePacienteDto, UpdatePacienteDto y CreateCitaDto. También están documentados Médicos y Autenticación.

Los candados indican las rutas protegidas. Sin token responden 401; con otro rol, 403. Login y registro permanecen públicos. Los ID de ejemplo se deben reemplazar por IDs que existan en tu base.

## Cambios

- @nestjs/swagger y configuración DocumentBuilder, con título Clínica Salud Integral, versión 1.0 y seguridad Bearer. main.ts invoca setupSwagger, compartido con las pruebas.
- ApiTags y ApiOperation en los cuatro controladores, con descripciones de respuestas HTTP.
- ApiProperty/ApiPropertyOptional en DTOs con ejemplos, tipos, formatos y campos opcionales.
- UpdatePacienteDto y UpdateMedicoDto utilizan PartialType de @nestjs/swagger para heredar documentación y validaciones con campos opcionales.
- CreateCitaDto reemplaza el contrato temporal: valida pacienteId y medicoId como enteros positivos, fecha ISO válida y motivo opcional. Conserva la consulta al PacientesService y no cambia el esquema Prisma.
- La colección del lunes usa ahora un ID positivo inexistente para probar el 404; los IDs negativos responden 400 por validación.

## Verificación realizada

Compilación TypeScript y lint correctos. Las suites anteriores pasaron sus 94 y 7 solicitudes. La suite Swagger verificó las 14 operaciones, los 7 DTOs con ejemplos y tipos, campos opcionales, publicación UI/JSON, Bearer 401/200 y cuatro cuerpos inválidos de Citas. Se comprobó manualmente login y GET /pacientes 200 dentro de Swagger UI. La cuenta temporal de esa comprobación fue eliminada.

```powershell
pnpm test:swagger
pnpm test:citas
pnpm test:e2e
pnpm lint
```

Rama feature/swagger; abrir PR hacia main y esperar revisión antes del merge. No publicar .env.
