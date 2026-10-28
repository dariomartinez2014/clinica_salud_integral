import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
export const authRouter = Router();
// Registro público por rol: flujo solicitado por el kit académico.
authRouter.post("/register", register);
authRouter.post("/login", login);


import multer from "multer";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { actualizarPerfil, obtenerPerfil } from "../controllers/perfil.controller.js";
const foto = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 3, fieldSize: 1000 } });
authRouter.get("/me", verifyToken, obtenerPerfil);
authRouter.put("/perfil", verifyToken, foto.single("foto"), actualizarPerfil);
