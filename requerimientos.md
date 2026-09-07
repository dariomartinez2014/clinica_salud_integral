# Clínica Salud Integral: requerimientos

La API centraliza pacientes, médicos y citas para sustituir hojas de cálculo. El modelo separa las especialidades para consultar incluso áreas sin médicos.

## Entidades y atributos

| Entidad | Atributo | Tipo | Notas |
|---|---|---|---|
| Paciente | id | entero | PK, autoincremental |
| Paciente | nombre, apellido | texto | Obligatorios |
| Paciente | email | texto | Obligatorio, único, formato válido |
| Paciente | telefono | texto | Opcional |
| Paciente | fechaNacimiento | fecha | Obligatoria, no futura |
| Paciente | createdAt, updatedAt | fecha/hora | Auditoría |
| Especialidad | id | entero | PK, autoincremental |
| Especialidad | nombre | texto | Obligatorio, único |
| Especialidad | descripcion | texto | Opcional |
| Medico | id | entero | PK, autoincremental |
| Medico | nombre, apellido | texto | Obligatorios |
| Medico | email | texto | Obligatorio, único |
| Medico | telefono | texto | Opcional |
| Medico | especialidadId | entero | FK obligatoria |
| Medico | createdAt, updatedAt | fecha/hora | Auditoría |
| Cita | id | entero | PK, autoincremental |
| Cita | pacienteId, medicoId | entero | FK obligatorias |
| Cita | fecha | fecha/hora con zona | Obligatoria, futura al crear |
| Cita | motivo | texto | Opcional |
| Cita | estado | enum | PROGRAMADA por defecto; COMPLETADA o CANCELADA |
| Cita | createdAt, updatedAt | fecha/hora | Auditoría |

## Relaciones

- Una especialidad puede tener muchos médicos; cada médico pertenece a una especialidad.
- Un paciente puede tener muchas citas; cada cita pertenece a un paciente.
- Un médico puede tener muchas citas; cada cita corresponde a un médico.
- No se elimina en cascada el historial de citas.

## Reglas y permisos

Recepción registra pacientes, consulta expedientes, busca médicos y agenda citas. Un usuario MEDICO consulta agendas y cambia estados. GERENCIA consulta los dos reportes.
La tabla User es infraestructura del kit JWT. Role y User.role conservan los nombres SQL anteriores mediante mapeo.

Las citas requieren fecha ISO con hora y zona. La agenda recibe from y to juntos en AAAA-MM-DD; incluye ambos días completos en UTC. El corte diario cuenta por fecha programada de la cita, no por fecha de edición del estado.

## Alcance acordado con los entregables

No se exige editar o eliminar pacientes/médicos. El reto de pertenencia de citas no se implementó: cualquier cuenta MEDICO puede operar sobre la agenda indicada.
No se definieron duración de consulta ni intervalos; esta versión no bloquea solapamientos. Debe definirse esa política para resolver por completo los cruces de horarios mencionados en el contexto del negocio.

