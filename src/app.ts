// Apunte de estudio: Aquí configuro Express, los middlewares y las rutas que atienden las peticiones de la API.
import cors from 'cors';
import multer from 'multer';
import { directorioFotos, servirFoto } from './controllers/perfil.controller.js';
import express from "express";
import type { ErrorRequestHandler } from "express";
import swaggerUi from "swagger-ui-express";
import docs from "../swagger-output.json" with { type: "json" };
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
// Vite usa un origen distinto al de Express.
const origenes = (process.env.CORS_ALLOWED_ORIGINS ?? 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:5196,http://127.0.0.1:5196').split(',').map(origen => origen.trim()).filter(Boolean);
if (process.env.VERCEL) app.set('trust proxy', 1);
app.use(cors({ origin: origenes, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
if (process.env.VERCEL || process.env.UPLOAD_STORAGE === 'database') app.get('/api/fotos/:nombre', servirFoto);
app.use('/api/fotos', express.static(directorioFotos, { dotfiles: 'deny', index: false, setHeaders: (res) => { res.setHeader('X-Content-Type-Options', 'nosniff'); } }));
app.use(express.json({ limit: "1mb" }));
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
  if (error instanceof multer.MulterError) { res.status(400).json({ mensaje: error.code === "LIMIT_FILE_SIZE" ? "La imagen no puede superar los 5MB" : "Archivo o campos no permitidos" }); return; }
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



// Entrada de Express para Vercel; el servidor local mantiene src/index.ts.
export default app;
