import { Router } from "express";
import { crearPaciente, listarPacientes, obtenerExpediente } from "../controllers/paciente.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validatePatient } from "../middlewares/validate-patient.js";
export const pacienteRouter = Router();
pacienteRouter.use(verifyToken, authorize("RECEPCIONISTA"));
pacienteRouter.post("/", validatePatient, crearPaciente);
pacienteRouter.get("/", listarPacientes);
pacienteRouter.get("/:id", obtenerExpediente);

