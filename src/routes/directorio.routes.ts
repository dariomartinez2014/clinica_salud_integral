import { Router } from "express";
import { crearEspecialidad, listarEspecialidades, crearMedico, listarMedicos } from "../controllers/directorio.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
export const directorioRouter = Router();
// Aplico permisos por ruta para no bloquear las rutas posteriores de citas.
directorioRouter.get(["/especialidades", "/specialties"], verifyToken, authorize("RECEPCIONISTA"), listarEspecialidades);
directorioRouter.get(["/medicos", "/doctors"], verifyToken, authorize("RECEPCIONISTA"), listarMedicos);
directorioRouter.post("/especialidades", verifyToken, authorize("GERENCIA"), crearEspecialidad);
directorioRouter.post("/medicos", verifyToken, authorize("GERENCIA"), crearMedico);

