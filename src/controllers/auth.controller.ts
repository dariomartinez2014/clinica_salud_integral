import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { crearUsuario, buscarUsuario } from "../models/auth.model.js";
import { secretoJWT } from "../middlewares/auth.middleware.js";

const loginSchema = z.strictObject({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(6).max(72),
});
const registerSchema = loginSchema.extend({
  nombre: z.string().trim().min(1).max(100).default("Usuario"),
  role: z.enum(["RECEPCIONISTA", "MEDICO", "GERENCIA"]),
});
export async function register(req: Request, res: Response) {
  // #swagger.tags = ['Autenticación']
  const data = registerSchema.parse(req.body);
  // Adaptación del kit: conservo bcrypt y separo Prisma en el modelo.
  const password = await bcrypt.hash(data.password, 10);
  res.status(201).json(await crearUsuario({ ...data, password }));
}
export async function login(req: Request, res: Response) {
  // #swagger.tags = ['Autenticación']
  const data = loginSchema.parse(req.body);
  const user = await buscarUsuario(data.email);
  if (!user || !await bcrypt.compare(data.password, user.password)) {
    res.status(401).json({ mensaje: "Credenciales inválidas" }); return;
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role },
    secretoJWT(), { algorithm: "HS256", expiresIn: "8h" });
  res.json({ token });
}

