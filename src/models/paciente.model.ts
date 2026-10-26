import { prisma } from "../config/prisma.js";
import type { CrearPacienteDatos } from "../schemas/paciente.schema.js";

export function insertarPaciente(datos: CrearPacienteDatos) {
  return prisma.paciente.create({
    data: {
      nombre: datos.nombre,
      apellido: datos.apellido,
      email: datos.email,
      telefono: datos.telefono ?? null,

      // Convierte el texto recibido al tipo Date que necesita Prisma.
      fechaNacimiento: new Date(`${datos.fechaNacimiento}T00:00:00.000Z`),
    },
  });
}

export function consultarPacientes() {
  return prisma.paciente.findMany({
    orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
  });
}

export function consultarExpediente(id: number) {
  return prisma.paciente.findUnique({
    where: { id },

    // Incluye todas las citas del paciente y los datos del médico.
    include: {
      citas: {
        orderBy: { fecha: "desc" },
        include: {
          medico: {
            include: {
              especialidad: true,
            },
          },
        },
      },
    },
  });
}
export function modificarPaciente(
  id: number,
  datos: import("../schemas/paciente.schema.js").ActualizarPacienteDatos,
) {
  const { fechaNacimiento, ...campos } = datos;
  return prisma.paciente.update({
    where: { id },
    data: {
      ...campos,
      ...(fechaNacimiento
        ? { fechaNacimiento: new Date(`${fechaNacimiento}T00:00:00.000Z`) }
        : {}),
    },
  });
}

export function borrarPaciente(id: number) {
  // La base impide borrar un paciente que tenga citas.
  return prisma.paciente.delete({ where: { id } });
}

export async function buscarPacientes(
  query: string,
  pagina: number,
  limite: number,
) {
  const palabras = query.split(/\s+/).filter(Boolean);
  const where: import("../../generated/prisma/client.js").Prisma.PacienteWhereInput =
    {
      AND: palabras.map((palabra) => ({
        OR: [
          { nombre: { contains: palabra, mode: "insensitive" } },
          { apellido: { contains: palabra, mode: "insensitive" } },
          { email: { contains: palabra, mode: "insensitive" } },
        ],
      })),
    };
  const [total, data] = await prisma.$transaction([
    prisma.paciente.count({ where }),
    prisma.paciente.findMany({
      where,
      orderBy: [{ apellido: "asc" }, { nombre: "asc" }, { id: "asc" }],
      skip: (pagina - 1) * limite,
      take: limite,
    }),
  ]);
  return { data, total, pagina, totalPaginas: Math.ceil(total / limite) };
}
