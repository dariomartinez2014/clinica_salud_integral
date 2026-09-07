import { prisma } from "../config/prisma.js";
// Los nombres SQL corresponden a las tablas existentes y sus columnas reales.
export function citasPorEspecialidad() {
  return prisma.$queryRaw<{ specialty: string; total_appointments: number }[]>`
    SELECT s.nombre AS specialty, COUNT(c.id)::int AS total_appointments
    FROM especialidades s
    LEFT JOIN medicos m ON m."especialidadId" = s.id
    LEFT JOIN citas c ON c."medicoId" = m.id
    GROUP BY s.id, s.nombre
    ORDER BY total_appointments DESC, s.nombre ASC
  `;
}
export async function corteDiario(date: string) {
  const inicio = new Date(date + "T00:00:00.000Z");
  const fin = new Date(inicio.getTime() + 86400000);
  // El límite exclusivo incluye también los milisegundos del último segundo.
  const grupos = await prisma.cita.groupBy({
    by: ["estado"],
    where: { fecha: { gte: inicio, lt: fin }, estado: { in: ["COMPLETADA", "CANCELADA"] } },
    _count: { estado: true },
  });
  return {
    date, timezone: "UTC",
    completadas: grupos.find(g => g.estado === "COMPLETADA")?._count.estado ?? 0,
    canceladas: grupos.find(g => g.estado === "CANCELADA")?._count.estado ?? 0,
  };
}

