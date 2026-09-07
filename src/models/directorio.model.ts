import { prisma } from "../config/prisma.js";
import type {
  EspecialidadDatos,
  MedicoDatos,
} from "../schemas/directorio.schema.js";

// Guarda una especialidad en PostgreSQL.
export function insertarEspecialidad(datos: EspecialidadDatos) {
  return prisma.especialidad.create({
    data: {
      nombre: datos.nombre,
      descripcion: datos.descripcion ?? null,
    },
  });
}

export function consultarEspecialidades() {
  return prisma.especialidad.findMany({
    orderBy: { nombre: "asc" },
  });
}

// Guarda el médico y devuelve también su especialidad.
export function insertarMedico(datos: MedicoDatos) {
  return prisma.medico.create({
    data: {
      nombre: datos.nombre,
      apellido: datos.apellido,
      email: datos.email,
      telefono: datos.telefono ?? null,
      especialidadId: datos.especialidadId,
    },
    include: {
      especialidad: true,
    },
  });
}

export function consultarMedicos(especialidadId?: number, specialty?: string) {
  return prisma.medico.findMany({
    // Sin filtro devuelve todos; con filtro devuelve los de esa área.
    where: { ...(especialidadId === undefined ? {} : { especialidadId }), ...(specialty ? { especialidad: { nombre: { equals: specialty, mode: "insensitive" } } } : {}) },
    include: {
      especialidad: true,
    },
    orderBy: [
      { apellido: "asc" },
      { nombre: "asc" },
    ],
  });
}