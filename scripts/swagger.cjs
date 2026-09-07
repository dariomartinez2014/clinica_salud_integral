const swaggerAutogen = require("swagger-autogen")({ openapi: "3.0.0" });
const fs = require("node:fs");
// Genero la documentación desde las rutas y completo ejemplos para Try it out.
const ref = name => ({ $ref: "#/components/schemas/" + name });
const body = name => ({ required: true, content: { "application/json": { schema: ref(name) } } });
const query = (name, required = false) => ({ name, in: "query", required, schema: { type: "string" } });
const id = { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 } };
const schemas = {
  Login: { type: "object", required: ["email","password"], properties: { email:{type:"string",example:"recepcion@clinica.com"}, password:{type:"string",example:"ClaveDemo123!"} } },
  Registro: { type:"object", required:["email","password","role"], properties:{ nombre:{type:"string",example:"Recepción"}, email:{type:"string",example:"recepcion@clinica.com"},password:{type:"string",example:"ClaveDemo123!"},role:{type:"string",enum:["RECEPCIONISTA","MEDICO","GERENCIA"]} } },
  Paciente: { type:"object", required:["nombre","apellido","email","fechaNacimiento"], properties:{nombre:{type:"string",example:"Luis"},apellido:{type:"string",example:"Prueba"},email:{type:"string",example:"luis@example.com"},fechaNacimiento:{type:"string",format:"date",example:"1998-05-15"},telefono:{type:"string"} } },
  Cita: {type:"object",required:["pacienteId","medicoId","fecha"],properties:{pacienteId:{type:"integer",example:1},medicoId:{type:"integer",example:1},fecha:{type:"string",format:"date-time",example:"2030-09-08T15:00:00Z"},motivo:{type:"string",example:"Consulta general"}}},
  Estado: {type:"object",required:["status"],properties:{status:{type:"string",enum:["COMPLETADA","CANCELADA"]}}},
  Especialidad: {type:"object",required:["nombre"],properties:{nombre:{type:"string"},descripcion:{type:"string"}}},
  Medico: {type:"object",required:["nombre","apellido","email","especialidadId"],properties:{nombre:{type:"string"},apellido:{type:"string"},email:{type:"string",format:"email"},especialidadId:{type:"integer"},telefono:{type:"string"}}},
};
const paths = {};
function op(path, method, tag, summary, role, requestBody, parameters = []) {
  paths[path] ??= {};
  paths[path][method] = { tags:[tag], summary, description:role ? "Rol: "+role+". Fechas de agenda y reportes en UTC." : "Flujo académico del kit JWT.",
    security:role ? [{bearerAuth:[]}] : [], parameters,
    ...(requestBody ? {requestBody:body(requestBody)} : {}),
    responses:{ [method==="post" && !path.endsWith("login") ? "201":"200"]:{description:"Operación correcta"}, "400":{description:"Datos inválidos"}, "401":{description:"Sin token válido"}, "403":{description:"Rol no autorizado"}, "404":{description:"Registro no encontrado"}, "409":{description:"Registro duplicado"} },
  };
}
op("/api/auth/register","post","Autenticación","Registrar cuenta de prueba",null,"Registro");
op("/api/auth/login","post","Autenticación","Obtener token",null,"Login");
op("/api/patients","post","Pacientes","Registrar paciente","RECEPCIONISTA","Paciente");
op("/api/patients","get","Pacientes","Listar pacientes","RECEPCIONISTA");
op("/api/patients/{id}","get","Pacientes","Expediente completo","RECEPCIONISTA",null,[id]);
op("/api/doctors","get","Directorio","Buscar médicos","RECEPCIONISTA",null,[query("specialty")]);
op("/api/specialties","get","Directorio","Listar especialidades","RECEPCIONISTA");
op("/api/especialidades","post","Directorio","Crear especialidad adicional","GERENCIA","Especialidad");
op("/api/medicos","post","Directorio","Crear médico adicional","GERENCIA","Medico");
op("/api/appointments","post","Citas","Agendar cita","RECEPCIONISTA","Cita");
op("/api/doctors/{id}/appointments","get","Citas","Agenda del médico","MEDICO",null,[id,query("from"),query("to")]);
op("/api/appointments/{id}/status","patch","Citas","Actualizar estado","MEDICO","Estado",[id]);
op("/api/reports/appointments-by-specialty","get","Reportes","Volumen por especialidad","GERENCIA");
op("/api/reports/daily-cutoff","get","Reportes","Corte por fecha de cita","GERENCIA",null,[query("date",true)]);
op("/api/health","get","Estado","Comprobar conexión",null);
(async () => {
  await swaggerAutogen("./swagger-generated.json", ["./src/routes/auth.routes.ts","./src/routes/cita.routes.ts","./src/routes/reporte.routes.ts"], {
    info:{title:"Clínica Salud Integral",version:"1.0.0"},
    components:{securitySchemes:{bearerAuth:{type:"http",scheme:"bearer",bearerFormat:"JWT"}}}
  });
  fs.writeFileSync("swagger-output.json",JSON.stringify({openapi:"3.0.0",info:{title:"Clínica Salud Integral",version:"1.0.0",description:"API académica con Prisma y JWT. Registro público por rol según kit del curso; no es una política de cuentas para producción."},paths,components:{schemas,securitySchemes:{bearerAuth:{type:"http",scheme:"bearer",bearerFormat:"JWT"}}}},null,2));
})();

