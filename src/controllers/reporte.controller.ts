import type { Request, Response } from "express";
import { z } from "zod";
import * as modelo from "../models/reporte.model.js";
export const fechaReporteSchema = z.object({ date: z.iso.date() });
export async function porEspecialidad(_req: Request, res: Response) {
  // #swagger.tags = ['Reportes']
  // #swagger.security = [{ "bearerAuth": [] }]
  res.json(await modelo.citasPorEspecialidad());
}
export async function diario(req: Request, res: Response) {
  // #swagger.tags = ['Reportes']
  // #swagger.security = [{ "bearerAuth": [] }]
  res.json(await modelo.corteDiario(fechaReporteSchema.parse(req.query).date));
}

