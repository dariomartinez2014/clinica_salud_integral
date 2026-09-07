import assert from "node:assert/strict";
import { app } from "../dist/src/app.js";
import { prisma } from "../dist/src/config/prisma.js";
const server=app.listen(0,"127.0.0.1");
await new Promise(r=>server.once("listening",r));
const base="http://127.0.0.1:"+server.address().port;
const stamp=Date.now();
const emails=[];
let patientId;
const appointments=[];
let count=0;
async function call(method,path,body,token,expected) {
 const res=await fetch(base+path,{method,headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const data=await res.json();
 assert.equal(res.status,expected,method+" "+path+" "+JSON.stringify(data)); count++;
 return data;
}
try {
 const tokens={};
 for(const role of ["RECEPCIONISTA","MEDICO","GERENCIA"]) {
  const email=role.toLowerCase()+"."+stamp+"@example.com"; emails.push(email);
  await call("POST","/api/auth/register",{email,password:"ClavePrueba123!",role},null,201);
  const result=await call("POST","/api/auth/login",{email,password:"ClavePrueba123!"},null,200); tokens[role]=result.token;
 }
 await call("GET","/api/patients",null,null,401);
 await call("GET","/api/patients",null,tokens.MEDICO,403);
 await call("GET","/api/reports/daily-cutoff?date=2035-01-01",null,tokens.RECEPCIONISTA,403);
 const patient={nombre:"Prueba automática",apellido:"Temporal",email:"patient."+stamp+"@example.com",fechaNacimiento:"1990-01-01"};
 await call("POST","/api/patients",{...patient,email:"incorrecto"},tokens.RECEPCIONISTA,400);
 await call("POST","/api/patients",{...patient,fechaNacimiento:"2099-01-01"},tokens.RECEPCIONISTA,400);
 const created=await call("POST","/api/patients",patient,tokens.RECEPCIONISTA,201); patientId=created.paciente.id;
 await call("POST","/api/patients",patient,tokens.RECEPCIONISTA,409);
 const empty=await call("GET","/api/patients/"+patientId,null,tokens.RECEPCIONISTA,200); assert.deepEqual(empty.citas,[]);
 const medicos=await call("GET","/api/doctors?specialty="+encodeURIComponent("cardiología"),null,tokens.RECEPCIONISTA,200);
 assert(medicos.length>=2); assert(medicos.every(m=>m.especialidad.nombre==="Cardiología"));
 const medicoId=medicos[0].id;
 const cita={pacienteId:patientId,medicoId,fecha:"2035-05-15T23:59:59.999Z",motivo:"Prueba temporal"};
 await call("POST","/api/appointments",{...cita,fecha:"2000-01-01T00:00:00Z"},tokens.RECEPCIONISTA,400);
 await call("POST","/api/appointments",{...cita,medicoId:2147483647},tokens.RECEPCIONISTA,404);
 await call("POST","/api/appointments",{...cita,pacienteId:2147483647},tokens.RECEPCIONISTA,404);
 await call("POST","/api/appointments",{...cita,estado:"COMPLETADA"},tokens.RECEPCIONISTA,400);
 const before=await call("GET","/api/reports/daily-cutoff?date=2035-05-15",null,tokens.GERENCIA,200);
 for(const status of ["COMPLETADA","CANCELADA"]) {
  const a=await call("POST","/api/appointments",cita,tokens.RECEPCIONISTA,201); appointments.push(a.id); assert.equal(a.estado,"PROGRAMADA");
  await call("PATCH","/api/appointments/"+a.id+"/status",{status},tokens.RECEPCIONISTA,403);
  const changed=await call("PATCH","/api/appointments/"+a.id+"/status",{status},tokens.MEDICO,200); assert.equal(changed.estado,status);
 }
 await call("PATCH","/api/appointments/2147483647/status",{status:"COMPLETADA"},tokens.MEDICO,404);
 await call("PATCH","/api/appointments/"+appointments[0]+"/status",{status:"PROGRAMADA"},tokens.MEDICO,400);
 const agenda=await call("GET","/api/doctors/"+medicoId+"/appointments?from=2035-05-15&to=2035-05-15",null,tokens.MEDICO,200);
 assert(appointments.every(id=>agenda.some(a=>a.id===id)));
 const outside=await call("GET","/api/doctors/"+medicoId+"/appointments?from=2035-05-16&to=2035-05-16",null,tokens.MEDICO,200);
 assert(outside.every(a=>!appointments.includes(a.id)));
 await call("GET","/api/doctors/"+medicoId+"/appointments?from=2035-05-16&to=2035-05-15",null,tokens.MEDICO,400);
 const corte=await call("GET","/api/reports/daily-cutoff?date=2035-05-15",null,tokens.GERENCIA,200);
 assert.equal(corte.completadas,before.completadas+1);assert.equal(corte.canceladas,before.canceladas+1);
 await call("GET","/api/reports/daily-cutoff?date=2035-02-30",null,tokens.GERENCIA,400);
 const report=await call("GET","/api/reports/appointments-by-specialty",null,tokens.GERENCIA,200);
 assert(report.find(r=>r.specialty==="Cardiología").total_appointments>=2);
 const exp=await call("GET","/api/patients/"+patientId,null,tokens.RECEPCIONISTA,200);
 assert.equal(exp.citas.length,2);assert(exp.citas[0].medico.especialidad.nombre);
 const docs=await fetch(base+"/api/docs/"); assert.equal(docs.status,200); assert((await docs.text()).includes("swagger-ui"));
 console.log("OK: "+count+" solicitudes verificadas + Swagger; datos temporales eliminados al finalizar.");
} finally {
 await prisma.cita.deleteMany({where:{id:{in:appointments}}});
 if(patientId) await prisma.paciente.delete({where:{id:patientId}});
 await prisma.user.deleteMany({where:{email:{in:emails}}});
 await new Promise(r=>server.close(r)); await prisma.$disconnect();
}

