import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";

// Kit del curso: el token identifica al usuario y su rol.
export interface AuthPayload {
  id: number;
  email: string;
  role: "RECEPCIONISTA" | "MEDICO" | "GERENCIA";
}
declare global {
  namespace Express { interface Request { user?: AuthPayload; } }
}
export function secretoJWT(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error("JWT_SECRET debe tener al menos 32 caracteres");
  return secret;
}
export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ mensaje: "Token no proporcionado" }); return;
  }
  try {
    const payload = jwt.verify(header.slice(7), secretoJWT(), { algorithms: ["HS256"] });
    if (typeof payload === "string" || !Number.isInteger(payload.id) ||
        typeof payload.email !== "string" ||
        !["RECEPCIONISTA", "MEDICO", "GERENCIA"].includes(payload.role)) {
      res.status(401).json({ mensaje: "Token inválido" }); return;
    }
    req.user = { id: payload.id, email: payload.email, role: payload.role };
  } catch {
    res.status(401).json({ mensaje: "Token inválido o expirado" }); return;
  }
  next();
}

