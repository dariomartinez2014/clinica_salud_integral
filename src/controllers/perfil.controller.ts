import type { Request, Response } from "express";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { fileTypeFromBuffer } from "file-type";
import { z } from "zod";
import { prisma } from "../config/prisma.js";

export const directorioFotos = resolve("uploads/perfiles");
const schema = z.strictObject({
  nombre: z.string().trim().min(3).max(100),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  telefono: z.union([z.literal(""), z.string().regex(/^\d{8,15}$/)]).optional(),
});
export function serializarPerfil(u: { id: number; nombre: string; email: string; role: string; telefono: string | null; foto: string | null }, req: Request) {
  return { id: u.id, nombre: u.nombre, email: u.email, rol: u.role, telefono: u.telefono,
    foto: u.foto ? `${req.protocol}://${req.get("host")}/api/fotos/${u.foto}` : null };
}
const seleccion = { id: true, nombre: true, email: true, role: true, telefono: true, foto: true } as const;
export async function obtenerPerfil(req: Request, res: Response) {
  const u = await prisma.user.findUnique({ where: { id: req.user!.id }, select: seleccion });
  if (!u) { res.status(401).json({ mensaje: "Usuario no encontrado" }); return; }
  res.json(serializarPerfil(u, req));
}
export async function actualizarPerfil(req: Request, res: Response) {
  if (!req.is("multipart/form-data")) { res.status(415).json({ mensaje: "Usa multipart/form-data" }); return; }
  const datos = schema.parse(req.body);
  const anterior = await prisma.user.findUnique({ where: { id: req.user!.id }, select: seleccion });
  if (!anterior) { res.status(401).json({ mensaje: "Usuario no encontrado" }); return; }
  let nombreFoto: string | undefined;
  if (req.file) {
    let tipo;
    try { tipo = await fileTypeFromBuffer(req.file.buffer); } catch { /* Imagen inválida o truncada. */ }
    if (!tipo || !["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"].includes(tipo.mime)) {
      res.status(400).json({ mensaje: "Selecciona una imagen PNG, JPG, WebP, GIF o AVIF válida" }); return;
    }
    nombreFoto = `${randomUUID()}.${tipo.ext}`;
    await mkdir(directorioFotos, { recursive: true });
    await writeFile(resolve(directorioFotos, nombreFoto), req.file.buffer, { flag: "wx" });
  }
  try {
    const u = await prisma.user.update({ where: { id: req.user!.id }, data: {
      nombre: datos.nombre, email: datos.email,
      ...(datos.telefono !== undefined ? { telefono: datos.telefono || null } : {}),
      ...(nombreFoto ? { foto: nombreFoto } : {}),
    }, select: seleccion });
    res.json(serializarPerfil(u, req));
  } catch (error) {
    if (nombreFoto) await unlink(resolve(directorioFotos, nombreFoto)).catch(() => {});
    throw error;
  }
}
