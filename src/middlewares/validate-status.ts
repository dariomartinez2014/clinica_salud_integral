import { z } from "zod";
import type { RequestHandler } from "express";
export const appointmentStatusSchema = z.strictObject({
  status: z.enum(["COMPLETADA", "CANCELADA"]),
});
export const validateStatus: RequestHandler = (req, res, next) => {
  const parsed = appointmentStatusSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ errores: parsed.error.issues }); return; }
  req.body = parsed.data;
  next();
};

