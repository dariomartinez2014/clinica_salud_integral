# Lunes — Módulo de Citas y comunicación entre módulos

## Implementación

PacientesModule exporta PacientesService. CitasModule importa PacientesModule e inyecta ese servicio en CitasService junto con PrismaService. Antes de crear, CitasService llama a pacientesService.findOne(pacienteId); si no existe, lanza NotFoundException con el mensaje "El paciente no existe". La consulta al paciente no se duplica en CitasService.

El modelo real es Cita. Sus campos son pacienteId, medicoId, fecha y motivo; no se modificó schema.prisma. medicoId se pasa como valor plano, sin importar MedicosModule ni inyectar MedicosService. La clave foránea de la base sigue requiriendo un médico existente. fecha se convierte del texto ISO recibido a Date. El estado inicial PROGRAMADA lo asigna Prisma según el modelo.

POST /citas crea una cita y GET /citas lista las citas. Ambas rutas conservan los guards JWT y de rol RECEPCIONISTA. El contrato CrearCita solo aporta tipos a TypeScript; no es un DTO ni introduce validación del cuerpo en esta entrega.

## Demo

En nest-api ejecuta pnpm start:dev. Importa citas-lunes.postman_collection.json y configura email y password de un usuario RECEPCIONISTA existente. La colección inicia sesión, guarda el token y toma los primeros IDs disponibles de pacientes y médicos. Debe existir al menos un paciente y un médico. Puedes sustituir las variables por otros IDs.

Ejecuta en orden:

1. Login: 200.
2. Consultar pacientes y médicos: 200, guarda IDs.
3. Crear con pacienteId -1 (inexistente en los datos normales): 404, "El paciente no existe".
4. Crear con IDs válidos: 201.
5. Listar /citas: 200, incluye la cita creada.

Ejemplo de cuerpo (reemplazar IDs por los de tu base):

```json
{"pacienteId":1,"medicoId":1,"fecha":"2030-10-01T15:00:00.000Z","motivo":"Control general"}
```

Las citas creadas manualmente con Postman permanecen guardadas. Las pruebas automatizadas crean sus propios datos y los eliminan al terminar.

## Pruebas

- pnpm test:citas: siete solicitudes HTTP que prueban 401/403, 404, 201 y listado; además comprueban que se llama al PacientesService real, el estado inicial y la persistencia.
- pnpm test:e2e: regresión de autenticación, roles, pacientes y médicos.
- pnpm lint.

Se requiere PostgreSQL accesible y el .env local con DATABASE_URL y JWT_SECRET. No subir .env a Git. Rama: feature/modulo-citas. Abrir el PR hacia main y esperar revisión antes del merge.
