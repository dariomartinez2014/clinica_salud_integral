# Viernes — Demo y entrega final

## Preparación

Desde `nest-api`, instala dependencias con `pnpm install`, genera el cliente con `pnpm prisma:generate` y configura `.env` siguiendo `.env.example`. Reutiliza tu archivo si ya existe. Arranca con `pnpm start:dev` y abre `http://localhost:3000/api/docs`, ajustando el puerto a `PORT`.

Usa la base de práctica. Necesitas una cuenta `RECEPCIONISTA`, un paciente y un médico existentes; los ID del ejemplo no garantizan que esos registros existan en tu base.

## Recorrido en Swagger

1. En **Autenticación → POST /auth/login**, pulsa **Try it out**, introduce las credenciales de tu cuenta de práctica y ejecuta. Debe responder **200** con `{ "token": "..." }`.
2. Copia únicamente el valor de `token`. En **Authorize**, pégalo sin escribir `Bearer`, autoriza y cierra el diálogo.
3. Consulta **GET /pacientes** y **GET /medicos**. Anota un ID real de cada uno. Para el caso negativo, escoge un entero positivo y comprueba con **GET /pacientes/{id}** que responde **404**. Un ID negativo no sirve para este caso: fallaría el DTO con 400.
4. En **Citas → POST /citas**, ejecuta este body cambiando `pacienteId` por el ID inexistente verificado y `medicoId` por el médico real:

   ```json
   {
     "pacienteId": 2147483647,
     "medicoId": 1,
     "fecha": "2030-10-01T15:00:00.000Z",
     "motivo": "Demo de cierre de semana"
   }
   ```

   Debe responder **404**, con `message: "El paciente no existe"`. Explica que `CitasService` consultó a `PacientesService` antes de intentar guardar.
5. Sustituye únicamente `pacienteId` por el ID del paciente real y ejecuta otra vez. Debe responder **201** con la cita creada y `estado: "PROGRAMADA"`. Anota su ID. El médico también debe existir para no provocar un error de relación.
6. En la terminal del servidor, confirma un mensaje **`[HTTP] POST /citas — Nms`**, donde N es el tiempo medido. Este log corresponde a la creación exitosa; el `tap()` actual no registra el 404.
7. Ejecuta **GET /citas** y comprueba que aparece el ID recién creado. Una repetición del POST crea otra cita: evita repetirlo sin necesidad. El recurso todavía no expone DELETE /citas; conserva o limpia los datos de demo mediante el procedimiento habitual de tu base de práctica.

Para explicarlo oralmente: «Los Guards deciden si puedo entrar; el interceptor empieza a medir; el Pipe valida; el Controller delega al Service; el Service comprueba el paciente y guarda con Prisma; el interceptor registra el éxito. Si aparece una excepción, se toma la salida de error y actúa el filtro que corresponda».

## Verificación automática existente

Este proyecto no define `pnpm test`. Sus suites se ejecutan con estos comandos:

```powershell
pnpm build
pnpm lint
pnpm test:config
pnpm test:swagger
pnpm test:citas
pnpm test:e2e
```

`test:config` simula la persistencia. Las otras tres suites usan la base PostgreSQL configurada; Citas y CRUD crean registros temporales y los limpian al terminar. CRUD requiere al menos una especialidad existente. Estas suites complementan la demo manual; no sustituyen la comprobación visual del log en Swagger.

## Evidencia del cierre (25 de septiembre de 2026)

- Cliente Prisma generado, compilación Nest y lint sin errores.
- `test:config`: cinco configuraciones inválidas rechazadas, variables de proceso y archivo `.env`, puertos y login/Guard correctos; persistencia simulada.
- `test:swagger`: 14 operaciones, 7 DTOs, Swagger UI/JSON, autorización y cuatro bodies inválidos comprobados.
- `test:citas`: 7 solicitudes correctas, incluidos 404, 201, listado y persistencia en PostgreSQL.
- `test:e2e`: 94 solicitudes correctas contra PostgreSQL.
- Swagger UI sobre el arranque real de `main.ts`, puerto temporal 3015: login 200, paciente inexistente 404 con `El paciente no existe`, paciente existente 201 con estado `PROGRAMADA`.
- Log observado en la terminal: `[HTTP] POST /citas — 13ms`.
- La cuenta, especialidad, médico, paciente y cita temporales de esta demo fueron eliminados al terminar.

En el entorno de verificación se invocaron directamente las CLI con Node y los archivos `test/*.e2e.mjs` después de compilar, porque la ejecución de scripts de instalación mediante el shell estaba restringida. Se usaron las dependencias del lockfile sin modificarlo.

## Pull Request final

Revisa `git diff` y `git status` desde la raíz. Incluye solo los archivos de esta entrega, nunca `.env`, `node_modules` ni archivos generados. Usa el mensaje:

```text
docs: repaso integrador, documentacion y cierre de la semana
```

Publica `feature/cierre-semana` y abre el PR hacia `main`. Espera su aprobación antes del merge. Esa versión será la base para contenerizar y desplegar en la Semana 9.
