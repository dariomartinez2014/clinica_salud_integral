import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validateAppointment } from "../middlewares/validate-appointment.js";
import { validateStatus } from "../middlewares/validate-status.js";
import { agendar, agenda, actualizarEstado } from "../controllers/cita.controller.js";
export const citaRouter = Router();
citaRouter.use(verifyToken);
citaRouter.post(["/appointments", "/citas"], authorize("RECEPCIONISTA"), validateAppointment, agendar);
citaRouter.get(["/doctors/:id/appointments", "/medicos/:id/citas"], authorize("MEDICO"), agenda);
citaRouter.patch(["/appointments/:id/status", "/citas/:id/status"], authorize("MEDICO"), validateStatus, actualizarEstado);

