import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { fechaReporteSchema, porEspecialidad, diario } from "../controllers/reporte.controller.js";
export const reporteRouter = Router();
reporteRouter.use(verifyToken, authorize("GERENCIA"));
reporteRouter.get("/appointments-by-specialty", porEspecialidad);
reporteRouter.get("/daily-cutoff", (req, res, next) => {
  const parsed = fechaReporteSchema.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ errores: parsed.error.issues }); return; }
  next();
}, diario);

