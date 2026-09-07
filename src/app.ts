import express from "express";
import type { ErrorRequestHandler } from "express";
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "node:fs";
import { Prisma } from "../generated/prisma/client.js";
import { ZodError } from "zod";
import { prisma } from "./config/prisma.js";
import { secretoJWT } from "./middlewares/auth.middleware.js";
import { authRouter } from "./routes/auth.routes.js";
import { pacienteRouter } from "./routes/paciente.routes.js";
import { directorioRouter } from "./routes/directorio.routes.js";
import { citaRouter } from "./routes/cita.routes.js";
import { reporteRouter } from "./routes/reporte.routes.js";

secretoJWT();
export const app = express();
app.use(express.json({ limit: "1mb" }));
const docs = JSON.parse(readFileSync("swagger-output.json", "utf8").replace(/^\uFEFF/, "")) as object;
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(docs));
app.get("/", (_req, res) => { res.redirect("/api/docs"); });
app.get("/api/health", async (_req, res) => {
  try { await prisma.$queryRaw`SELECT 1`; res.json({ estado: "ok", baseDeDatos: "conectada" }); }
  catch { res.status(503).json({ mensaje: "Base de datos no disponible" }); }
});
app.use("/api/auth", authRouter);
// Conservo los enlaces en español y agrego los nombres del entregable.
app.use(["/api/patients", "/api/pacientes"], pacienteRouter);
app.use("/api", directorioRouter);
app.use("/api/reports", reporteRouter);
app.use("/api", citaRouter);
app.use((_req, res) => { res.status(404).json({ mensaje: "Ruta no encontrada" }); });

const errores: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof ZodError) { res.status(400).json({ mensaje: "Datos inválidos", errores: error.issues }); return; }
  if (error instanceof SyntaxError && "type" in error && error.type === "entity.parse.failed") {
    res.status(400).json({ mensaje: "JSON inválido" }); return;
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const status = error.code === "P2002" ? 409 : error.code === "P2025" ? 404 : error.code === "P2003" ? 400 : 500;
    res.status(status).json({ mensaje: status === 409 ? "El registro ya existe" : status === 404 ? "Registro no encontrado" : status === 400 ? "Referencia inválida" : "Error interno" }); return;
  }
  console.error(error);
  res.status(500).json({ mensaje: "Error interno del servidor" });
};
app.use(errores);

