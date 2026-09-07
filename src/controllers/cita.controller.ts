import type { Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client.js";
import { idSchema, agendaSchema } from "../middlewares/validate-appointment.js";
import type { DatosCita } from "../middlewares/validate-appointment.js";
import { appointmentStatusSchema } from "../middlewares/validate-status.js";
import * as modelo from "../models/cita.model.js";

export async function agendar(req: Request, res: Response) {
  // #swagger.tags = ['Citas']
  // #swagger.security = [{ "bearerAuth": [] }]
  const data = res.locals.cita as DatosCita;
  const [paciente, medico] = await Promise.all([
    modelo.buscarPaciente(data.pacienteId), modelo.buscarMedico(data.medicoId),
  ]);
  if (!paciente || !medico) {
    res.status(404).json({ mensaje: !paciente ? "Paciente no encontrado" : "Médico no encontrado" }); return;
  }
  res.status(201).json(await modelo.crearCita(data));
}
export async function agenda(req: Request, res: Response) {
  // #swagger.tags = ['Citas']
  // #swagger.security = [{ "bearerAuth": [] }]
  const { id } = idSchema.parse(req.params);
  const { from, to } = agendaSchema.parse(req.query);
  if (!await modelo.buscarMedico(id)) {
    res.status(404).json({ mensaje: "Médico no encontrado" }); return;
  }
  res.json(await modelo.consultarAgenda(id, from, to));
}
export async function actualizarEstado(req: Request, res: Response) {
  // #swagger.tags = ['Citas']
  // #swagger.security = [{ "bearerAuth": [] }]
  const { id } = idSchema.parse(req.params);
  const { status } = appointmentStatusSchema.parse(req.body);
  try {
    res.json(await modelo.cambiarEstado(id, status));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      res.status(404).json({ mensaje: "Cita no encontrada" }); return;
    }
    throw error;
  }
}

