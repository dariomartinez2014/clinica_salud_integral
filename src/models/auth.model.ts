import { prisma } from "../config/prisma.js";
import type { AuthPayload } from "../middlewares/auth.middleware.js";
// El modelo es la única capa que accede a la tabla users.
export function crearUsuario(data: { nombre: string; email: string; password: string; role: AuthPayload["role"] }) {
  return prisma.user.create({ data, select: { id: true, nombre: true, email: true, role: true } });
}
export function buscarUsuario(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

