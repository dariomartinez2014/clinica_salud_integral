import type { Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client.js";
import {
  crearPacienteSchema,
  pacienteIdSchema,
} from "../schemas/paciente.schema.js";
import {
  insertarPaciente,
  consultarPacientes,
  consultarExpediente,
} from "../models/paciente.model.js";

export async function crearPaciente(req: Request, res: Response) {
  const resultado = crearPacienteSchema.safeParse(req.body);

  // Si hay datos incorrectos, responde sin intentar guardarlos.
  if (!resultado.success) {
    res.status(400).json({
      mensaje: "Revisa los datos del paciente",
      errores: resultado.error.issues,
    });
    return;
  }

  try {
    const paciente = await insertarPaciente(resultado.data);

    res.status(201).json({
      mensaje: "Paciente registrado correctamente",
      paciente,
    });
  } catch (error) {
    // La restricción unique de PostgreSQL evita correos repetidos.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res.status(409).json({
        mensaje: "Ya existe un paciente con ese correo",
      });
      return;
    }

    // Express 5 envía el error al manejador general de la aplicación.
    throw error;
  }
}

export async function listarPacientes(_req: Request, res: Response) {
  const pacientes = await consultarPacientes();
  res.status(200).json(pacientes);
}

export async function obtenerExpediente(req: Request, res: Response) {
  const resultado = pacienteIdSchema.safeParse(req.params);

  if (!resultado.success) {
    res.status(400).json({
      mensaje: "El ID del paciente no es válido",
      errores: resultado.error.issues,
    });
    return;
  }

  const paciente = await consultarExpediente(resultado.data.id);

  if (!paciente) {
    res.status(404).json({
      mensaje: "Paciente no encontrado",
    });
    return;
  }

  res.status(200).json(paciente);
}