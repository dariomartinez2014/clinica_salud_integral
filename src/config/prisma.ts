// Carga las variables que guardé en el archivo .env.
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";

// Obtiene la conexión sin escribir la contraseña en el código.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Falta configurar DATABASE_URL en el archivo .env");
}

// El adaptador permite que Prisma se comunique con PostgreSQL.
const adapter = new PrismaPg({ connectionString });

// Comparto este cliente para usarlo en los diferentes módulos.
export const prisma = new PrismaClient({ adapter });