import { prisma } from "../src/config/prisma.js";
// Upsert permite repetir el seed sin duplicar estos registros.
async function seed() {
  for (const [i, nombre] of ["Cardiología", "Pediatría", "Medicina general"].entries()) {
    const especialidad = await prisma.especialidad.upsert({
      where: { nombre }, update: {}, create: { nombre },
    });
    for (let n = 1; n <= 2; n++) {
      await prisma.medico.upsert({
        where: { email: `medico.${i}.${n}@example.com` }, update: {},
        create: { nombre: `Médico ${n}`, apellido: nombre, email: `medico.${i}.${n}@example.com`, especialidadId: especialidad.id },
      });
    }
  }
  console.log("Seed listo: 3 especialidades con al menos 2 médicos cada una.");
}
seed().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());

