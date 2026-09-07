import type { Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client.js";
import {
  especialidadSchema,
  medicoSchema,
  filtroMedicosSchema,
} from "../schemas/directorio.schema.js";
import {
  insertarEspecialidad,
  consultarEspecialidades,
  insertarMedico,
  consultarMedicos,
} from "../models/directorio.model.js";

export async function crearEspecialidad(req: Request, res: Response) {
  const resultado = especialidadSchema.safeParse(req.body);

  if (!resultado.success) {
    res.status(400).json({
      mensaje: "Revisa los datos de la especialidad",
      errores: resultado.error.issues,
    });
    return;
  }

  try {
    const especialidad = await insertarEspecialidad(resultado.data);
    res.status(201).json(especialidad);
  } catch (error) {
    // El nombre de la especialidad no puede repetirse.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res.status(409).json({
        mensaje: "Ya existe una especialidad con ese nombre",
      });
      return;
    }

    throw error;
  }
}

export async function listarEspecialidades(_req: Request, res: Response) {
  const especialidades = await consultarEspecialidades();
  res.status(200).json(especialidades);
}

export async function crearMedico(req: Request, res: Response) {
  const resultado = medicoSchema.safeParse(req.body);

  if (!resultado.success) {
    res.status(400).json({
      mensaje: "Revisa los datos del médico",
      errores: resultado.error.issues,
    });
    return;
  }

  try {
    const medico = await insertarMedico(resultado.data);
    res.status(201).json(medico);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        res.status(409).json({
          mensaje: "Ya existe un médico con ese correo",
        });
        return;
      }

      // La base impide relacionar el médico con una especialidad inexistente.
      if (error.code === "P2003") {
        res.status(400).json({
          mensaje: "La especialidad indicada no existe",
        });
        return;
      }
    }

    throw error;
  }
}

export async function listarMedicos(req: Request, res: Response) {
  const resultado = filtroMedicosSchema.safeParse(req.query);

  if (!resultado.success) {
    res.status(400).json({
      mensaje: "El filtro de especialidad no es válido",
      errores: resultado.error.issues,
    });
    return;
  }

  const medicos = await consultarMedicos(resultado.data.especialidadId, resultado.data.specialty);
  res.status(200).json(medicos);
}