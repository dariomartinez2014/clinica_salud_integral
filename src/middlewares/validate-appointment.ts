import { z } from "zod";
import type { RequestHandler } from "express";
// La comparación se ejecuta en cada petición, no solo al iniciar el servidor.
export const appointmentSchema = z.strictObject({
  pacienteId: z.number().int().positive().max(2147483647),
  medicoId: z.number().int().positive().max(2147483647),
  fecha: z.iso.datetime({ offset: true }).transform(v => new Date(v))
    .refine(v => v.getTime() > Date.now(), "No puedes agendar una cita en una fecha que ya pasó"),
  motivo: z.string().trim().max(1000).optional(),
});
export const idSchema = z.object({
  id: z.string().regex(/^[1-9]\d*$/).transform(Number).pipe(z.number().int().max(2147483647)),
});
export const agendaSchema = z.object({
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
}).refine(v => Boolean(v.from) === Boolean(v.to), "Envía from y to juntos")
  .refine(v => !v.from || !v.to || v.from <= v.to, "from no puede ser posterior a to");

export type DatosCita = z.infer<typeof appointmentSchema>;
export const validateAppointment: RequestHandler = (req, res, next) => {
  const parsed = appointmentSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ errores: parsed.error.issues }); return; }
  res.locals.cita = parsed.data;
  next();
};

