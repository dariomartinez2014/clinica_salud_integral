// Apunte de estudio: Aquí reviso la petición antes del controlador; si los datos no cumplen las reglas, detengo la operación.
import type { RequestHandler } from "express";
import { crearPacienteSchema } from "../schemas/paciente.schema.js";
export { crearPacienteSchema as patientSchema };
// Valido antes de llegar al controlador.
export const validatePatient: RequestHandler = (req, res, next) => {
  const result = crearPacienteSchema.safeParse(req.body);
  if (!result.success) { res.status(400).json({ mensaje: "Revisa los datos del paciente", errores: result.error.issues }); return; }
  req.body = result.data;
  next();
};

