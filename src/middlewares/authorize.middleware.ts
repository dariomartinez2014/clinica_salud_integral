import type { Request, Response, NextFunction } from "express";
import type { AuthPayload } from "./auth.middleware.js";

// Kit del curso: se ejecuta después de verificar la firma del token.
export function authorize(...roles: AuthPayload["role"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ mensaje: "No tienes permiso para acceder a este recurso" }); return;
    }
    next();
  };
}

