// Carga las variables guardadas en el archivo .env.
import "dotenv/config";

import { defineConfig } from "prisma/config";

// Obtiene la conexión a PostgreSQL.
const databaseUrl = process.env["DATABASE_URL"];

// Si falta la conexión, detiene el proceso con un mensaje claro.
// Después de esta comprobación, TypeScript sabe que es un texto.
if (!databaseUrl) {
  throw new Error("Falta configurar DATABASE_URL en el archivo .env");
}

export default defineConfig({
  // Ubicación de los modelos de la base de datos.
  schema: "prisma/schema.prisma",

  migrations: {
    // Guarda el historial de cambios de las tablas.
    path: "prisma/migrations",
  },

  datasource: {
    // Usa la conexión que ya comprobamos.
    url: databaseUrl,
  },
});