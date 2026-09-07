import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
export const authRouter = Router();
// Registro público por rol: flujo solicitado por el kit académico.
authRouter.post("/register", register);
authRouter.post("/login", login);

