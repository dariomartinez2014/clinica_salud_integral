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

