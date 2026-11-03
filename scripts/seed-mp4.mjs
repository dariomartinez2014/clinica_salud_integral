import bcrypt from "bcryptjs";
import { prisma } from "../dist/src/config/prisma.js";
const password = process.env.DEMO_PASSWORD;
if (!password || password.length < 16) throw new Error("Configura DEMO_PASSWORD para los datos ficticios.");
try {
 const hash = await bcrypt.hash(password,10);
 for (const [email,role,nombre] of [["recepcion.mp4@example.test","RECEPCIONISTA","Recepción Demo MP4"],["medico.mp4@example.test","MEDICO","Médico Demo MP4"],["gerencia.mp4@example.test","GERENCIA","Gerencia Demo MP4"]]) {
  await prisma.user.upsert({where:{email},update:{},create:{email,role,nombre,password:hash}});
 }
 const especialidad = await prisma.especialidad.upsert({where:{nombre:"Medicina general"},update:{},create:{nombre:"Medicina general",descripcion:"Datos ficticios para la tarea MP4"}});
 const medico = await prisma.medico.upsert({where:{email:"doctor.mp4@example.test"},update:{},create:{nombre:"Médico Demo",apellido:"MP4",email:"doctor.mp4@example.test",especialidadId:especialidad.id}});
 for (let i=1;i<=14;i++) {
  const paciente=await prisma.paciente.upsert({where:{email:`paciente.mp4.${i}@example.test`},update:{},create:{nombre:`Paciente de prueba ${i}`,apellido:"MP4",email:`paciente.mp4.${i}@example.test`,fechaNacimiento:new Date("1995-01-01"),telefono:"55551234"}});
  if (i===1 && !await prisma.cita.count({where:{pacienteId:paciente.id}})) {
   await prisma.cita.createMany({data:Array.from({length:14},(_,n)=>({pacienteId:paciente.id,medicoId:medico.id,fecha:new Date(Date.UTC(2026,10,n+1,15)),estado:n%3 ? "PROGRAMADA":"COMPLETADA",motivo:"Consulta de demostración MP4"}))});
  }
 }
 console.log("Datos ficticios MP4 preparados: tres cuentas por rol, 14 pacientes y un historial paginado. No se imprimen contraseñas.");
} finally { await prisma.$disconnect(); }
