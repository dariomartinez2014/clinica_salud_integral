import { prisma } from "../config/prisma.js";
import type { DatosCita } from "../middlewares/validate-appointment.js";
export function buscarPaciente(id: number) { return prisma.paciente.findUnique({ where: { id } }); }
export function buscarMedico(id: number) { return prisma.medico.findUnique({ where: { id } }); }
export function crearCita(data: DatosCita) {
  return prisma.cita.create({ data, include: { paciente: true, medico: { include: { especialidad: true } } } });
}
// Uso UTC para que los rangos sean reproducibles en cualquier computadora.
export function consultarAgenda(medicoId: number, from?: string, to?: string) {
  const fecha = from && to ? {
    gte: new Date(from + "T00:00:00.000Z"),
    lt: new Date(new Date(to + "T00:00:00.000Z").getTime() + 86400000),
  } : undefined;
  return prisma.cita.findMany({
    where: { medicoId, ...(fecha ? { fecha } : {}) },
    include: { paciente: true }, orderBy: { fecha: "asc" },
  });
}
export function cambiarEstado(id: number, estado: "COMPLETADA" | "CANCELADA") {
  return prisma.cita.update({ where: { id }, data: { estado } });
}


export function consultarCitas(estado?: 'Programada' | 'Completada') {
  // La tarjeta Completadas Hoy usa el día de Guatemala (UTC-6).
  const dia = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Guatemala' }).format(new Date());
  const inicio = new Date(`${dia}T00:00:00-06:00`);
  return prisma.cita.findMany({
    where: {
      estado: estado === 'Programada' ? 'PROGRAMADA' : estado === 'Completada' ? 'COMPLETADA' : undefined,
      ...(estado === 'Completada' ? { fecha: { gte: inicio, lt: new Date(inicio.getTime() + 86400000) } } : {}),
    },
    orderBy: { fecha: 'asc' },
  });
}
