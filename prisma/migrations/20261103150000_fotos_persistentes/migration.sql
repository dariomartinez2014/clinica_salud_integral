CREATE TABLE "fotos_perfil" (
  "nombre" TEXT NOT NULL,
  "contenido" BYTEA NOT NULL,
  "tipo" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fotos_perfil_pkey" PRIMARY KEY ("nombre")
);
