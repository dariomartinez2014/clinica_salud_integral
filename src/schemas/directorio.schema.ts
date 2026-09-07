import { z } from "zod";

// Valida los datos de una especialidad.
export const especialidadSchema = z.strictObject({
  nombre: z.string().trim().min(1).max(100),
  descripcion: z.string().trim().max(500).optional(),
});

// Valida los datos del médico antes de guardarlos.
export const medicoSchema = z.strictObject({
  nombre: z.string().trim().min(1).max(100),
  apellido: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  telefono: z.string().trim().min(1).max(30).optional(),
  especialidadId: z.number().int().positive().max(2147483647),
});

// El filtro llega como texto en la URL y lo convierto a número.
export const filtroMedicosSchema = z.object({
  specialty: z.string().trim().min(1).max(100).optional(),
  especialidadId: z.string()
    .regex(/^[1-9]\d*$/, "La especialidad debe tener un ID válido")
    .transform(Number)
    .pipe(z.number().int().max(2147483647))
    .optional(),
});

export type EspecialidadDatos = z.infer<typeof especialidadSchema>;
export type MedicoDatos = z.infer<typeof medicoSchema>;