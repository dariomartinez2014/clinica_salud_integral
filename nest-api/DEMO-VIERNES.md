# Demo del viernes: autenticación y roles

Desde la carpeta nest-api:

```powershell
pnpm start:dev
```

Importa guards-viernes.postman_collection.json en Postman y ejecuta las solicitudes en orden. Los logins guardan automáticamente los tokens. El registro debe responder 201, el login 200 y los GET de pacientes y médicos deben responder 401 sin token, 200 con RECEPCIONISTA y 403 con MEDICO. Cambia los correos de las variables de la colección para repetir el registro; un correo existente responde 409. Los usuarios de la demo quedan guardados en la base.

## Qué explicar

- AuthController recibe los DTOs; AuthService reutiliza bcryptjs y jsonwebtoken de la Semana 5. El hash se guarda en User.password, respetando el modelo existente, y nunca se devuelve.
- JwtAuthGuard verifica la firma HS256 y la expiración del token y asigna request.user. Sin sesión válida responde 401.
- @Roles añade metadata. RolesGuard usa Reflector.getAllAndOverride sobre el método y el controlador; así reconoce el rol declarado a nivel de clase. Un rol sin permiso recibe 403.
- @UseGuards(JwtAuthGuard, RolesGuard) garantiza autenticación antes de autorización en ambos controladores.
- Login responde 200 gracias a @HttpCode(200). Los tokens duran ocho horas.
- Se conserva el registro con elección de rol porque lo exige el ejercicio. No debe exponerse así para altas públicas en producción.

## Verificación

```powershell
pnpm test:e2e
pnpm lint
```

La suite realiza 94 solicitudes contra la base de práctica: registro, login, roles, tokens inválidos, vencidos y con otra firma, además del CRUD y sus validaciones. Crea datos temporales y los elimina al terminar. Requiere una especialidad existente, DATABASE_URL y JWT_SECRET de al menos 32 caracteres en .env. Nunca subir .env a Git.

## Entrega en Git

La entrega del viernes se publica en feature/guards hacia main e implementa autenticación JWT y autorización por rol. Revisar y aprobar el PR antes del merge.

El reto extra de guard global es opcional y no está incluido; esta entrega usa guards por controlador como indican los puntos obligatorios.
