import "dotenv/config";
import { app } from "./app.js";
import { prisma } from "./config/prisma.js";

// Usa el puerto del .env o el 3000 si no está definido.
const PORT = Number(process.env.PORT ?? 3000);

async function iniciarServidor() {
  if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    throw new Error("PORT debe ser un número entre 1 y 65535");
  }

  // Verifica la conexión antes de aceptar solicitudes.
  await prisma.$connect();

  const servidor = app.listen(PORT, () => {
    console.log(`Servidor disponible en http://localhost:${PORT}`);
    console.log(`Prueba de conexión: http://localhost:${PORT}/api/health`);
  });

  // Cierra las conexiones cuando detengo el servidor.
  let cerrando = false;

  function cerrarServidor() {
    if (cerrando) return;
    cerrando = true;

    console.log("Cerrando servidor...");

    servidor.close(() => {
      void prisma.$disconnect().catch((error: unknown) => {
        console.error("Error al cerrar la conexión:", error);
        process.exitCode = 1;
      });
    });
  }

  process.on("SIGINT", cerrarServidor);
  process.on("SIGTERM", cerrarServidor);

  servidor.on("error", (error) => {
    console.error("No se pudo abrir el puerto:", error);
    void prisma.$disconnect().finally(() => process.exit(1));
  });
}

iniciarServidor().catch(async (error: unknown) => {
  console.error("No se pudo iniciar el servidor:", error);
  await prisma.$disconnect();
  process.exitCode = 1;
});