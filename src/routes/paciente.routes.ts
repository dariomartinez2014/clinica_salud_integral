// Apunte de estudio: Aquí relaciono las URLs con sus controladores y los controles de acceso que necesita cada operación.
import { Router } from "express";
import {
  crearPaciente,
  listarPacientes,
  obtenerExpediente,
  actualizarPaciente,
  eliminarPaciente,
} from "../controllers/paciente.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validatePatient } from "../middlewares/validate-patient.js";
export const pacienteRouter = Router();
pacienteRouter.use(verifyToken, authorize("RECEPCIONISTA"));
pacienteRouter.post("/", validatePatient, crearPaciente);
pacienteRouter.get("/", listarPacientes);
pacienteRouter.get("/:id", obtenerExpediente);

pacienteRouter.put("/:id", actualizarPaciente);
pacienteRouter.delete("/:id", eliminarPaciente);
