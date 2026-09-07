# API Clínica Salud Integral

API REST académica con Express, TypeScript, PostgreSQL, Prisma 7, Zod y el kit JWT del curso.

## Arranque

1. Instalar dependencias: npm install
2. Copiar .env.example a .env y configurar DATABASE_URL y JWT_SECRET (al menos 32 caracteres aleatorios).
3. Aplicar migraciones: npm run prisma:migrate
4. Generar cliente: npm run prisma:generate
5. Generar Swagger: npm run docs
6. Compilar: npm run build
7. Sembrar catálogo: npm run prisma:seed
8. Ejecutar: npm start

Desde la raíz del proyecto, abrir http://localhost:3000/api/docs.
En desarrollo puede usarse npm run dev. La configuración CLI existente se llama prisma7.config.ts.

## Demostración en Swagger

1. POST /api/auth/register: crear una cuenta por rol con email distinto, contraseña y role. nombre es opcional.
2. POST /api/auth/login: copiar el token devuelto.
3. Pulsar Authorize e introducir solo el token, sin escribir Bearer.
4. Con RECEPCIONISTA, crear paciente, consultar médicos con specialty y agendar cita.
5. Iniciar sesión como MEDICO, sustituir el token y cambiar status a COMPLETADA o CANCELADA.
6. Iniciar sesión como GERENCIA, sustituir el token y consultar los dos reportes.

Ejemplo registro:
{ "nombre": "Recepción", "email": "recepcion@clinica.com", "password": "ClaveDemo123!", "role": "RECEPCIONISTA" }

Ejemplo cita (usar IDs reales y fecha futura):
{ "pacienteId": 1, "medicoId": 1, "fecha": "2030-09-08T15:00:00Z", "motivo": "Consulta" }

El estado no se acepta al crear: lo asigna PostgreSQL. Para PATCH se envía { "status": "COMPLETADA" }.
Los campos del negocio permanecen en español, como permite la tarea.

## Endpoints

| Método | Ruta | Rol |
|---|---|---|
| POST | /api/auth/register | Público, kit académico |
| POST | /api/auth/login | Público |
| POST, GET | /api/patients | RECEPCIONISTA |
| GET | /api/patients/:id | RECEPCIONISTA |
| GET | /api/doctors?specialty=Cardiología | RECEPCIONISTA |
| GET | /api/specialties | RECEPCIONISTA |
| POST | /api/appointments | RECEPCIONISTA |
| GET | /api/doctors/:id/appointments?from=2030-09-08&to=2030-09-08 | MEDICO |
| PATCH | /api/appointments/:id/status | MEDICO |
| GET | /api/reports/appointments-by-specialty | GERENCIA |
| GET | /api/reports/daily-cutoff?date=2030-09-08 | GERENCIA |
| POST | /api/especialidades, /api/medicos | GERENCIA |

Se conservan los alias /api/pacientes, /api/medicos, /api/especialidades y /api/citas. Tras integrar JWT, abrir las rutas protegidas directamente en el navegador devuelve 401: usar Swagger con Authorize.

## Diseño

Rutas conectan middleware y controlador. Los modelos acceden a Prisma. Los controladores responden HTTP.
Zod rechaza correos, fechas, IDs y estados inválidos.
El kit conserva verifyToken, authorize, bcrypt y JWT de 8 horas; se adaptaron imports, validación de payload y separación MVC.
Prisma groupBy genera el corte; SQL con tagged template cruza citas, médicos y especialidades. El reporte incluye especialidades con cero citas.
UTC es la zona de agenda y reportes. El límite superior exclusivo incluye todo el último día.

## Validación

npm run test:integration

Compila y ejecuta 35 solicitudes HTTP contra un servidor temporal y PostgreSQL, además de comprobar Swagger. Verifica 401, 403, duplicados, correo, fecha futura, expediente, filtros, citas, estados y reportes. Crea y elimina únicamente sus registros temporales. Ejecutar seed antes.

## Límites del ejercicio

Registro público con selección de rol reproduce el kit académico; para un sistema real la creación de cuentas privilegiadas debe ser administrativa.
No incluye el reto extra de pertenencia ni una política de duración/solapamiento.
No hay actualizaciones ni eliminaciones de pacientes/médicos porque no las pide el entregable detallado.
Las pruebas no sustituyen revisión y aprobación de los PR por el docente.

## Git y entrega

Se documenta el trabajo real realizado en esta integración; no se recrean PR históricos ficticios.
Pendiente conectar el repositorio remoto y abrir el PR para revisión. No subir .env, node_modules, dist ni generated.

