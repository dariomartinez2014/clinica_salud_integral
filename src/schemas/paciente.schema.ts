import { z } from "zod";

// Obtiene la fecha de hoy según el calendario local del servidor.
function obtenerHoy() {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

// Define los datos que acepto al registrar un paciente.
export const crearPacienteSchema = z.strictObject({
  nombre: z.string().trim().min(1).max(100),
  apellido: z.string().trim().min(1).max(100),

  // Elimina espacios, normaliza el correo y comprueba su formato.
  email: z.string().trim().toLowerCase().pipe(z.email()),

  telefono: z.string().trim().min(1).max(30).optional(),

  // Rechaza fechas inválidas y fechas de nacimiento futuras.
  fechaNacimiento: z.iso.date().refine(
    (fecha) => fecha <= obtenerHoy(),
    { message: "La fecha de nacimiento no puede estar en el futuro" },
  ),
});

// Valida el identificador recibido en la dirección de la solicitud.
export const pacienteIdSchema = z.object({
  id: z.string()
    .regex(/^[1-9]\d*$/, "El ID debe ser un entero positivo")
    .transform(Number)
    .pipe(z.number().int().max(2147483647)),
});

// Obtiene el tipo TypeScript a partir de las reglas de validación.
export type CrearPacienteDatos = z.infer<typeof crearPacienteSchema>;