# API de Clínica en Vercel

API pública: https://clinica-funval-api-demr.vercel.app/api
Health: /api/health devuelve estado ok y baseDeDatos conectada.
Frontend: https://clinica-funval-mp4-demr.vercel.app

Node 24 y TypeScript 6; Express exporta app para Vercel. Swagger se importa como JSON estático para incluirlo en el bundle. La conexión usa un pool limitado y attachDatabasePool. Las fotos se almacenan en Postgres en producción, con una migración nueva para fotos_perfil.

Variables del proyecto Vercel: DATABASE_URL (URL agrupada de Neon), JWT_SECRET, UPLOAD_STORAGE=database y CORS_ALLOWED_ORIGINS (origen HTTPS exacto del frontend). Los valores privados se configuran por stdin; no están en el repositorio. Para migraciones usar la conexión directa a Neon con scripts/run-cloud-migration.mjs. scripts/seed-mp4.mjs requiere DEMO_PASSWORD y crea únicamente datos ficticios.

Base independiente clinica-funval-mp4, con rama de validación y rama production. Migraciones y datos ficticios aplicados con autorización. No se reutilizó la base de otra aplicación.

Validación: build local y remoto aprobados; 20 pruebas de perfil y archivos aprobadas en la rama de validación; health, login, dashboard y pacientes verificados contra producción. La recarga de /pacientes conserva sesión en el frontend.

Despliegue manual: npx vercel --prod --yes --scope dariomartinez2014. Proyecto clinica-funval-api-demr. La integración automática GitHub no quedó conectada; los cambios posteriores necesitan ejecutar el despliegue manual.

Las dependencias de ejecución se actualizaron sin cambios forzados. Quedan avisos bajos/moderados en herramientas de desarrollo de generación Swagger.
