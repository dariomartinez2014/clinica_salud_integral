// Los valores privados se reciben por variables de entorno, nunca por argumentos.
import { spawn } from "node:child_process";
for (const nombre of ["DATABASE_URL", "JWT_SECRET", "UPLOAD_STORAGE", "CORS_ALLOWED_ORIGINS"]) {
 const valor = process.env[nombre]; if (!valor) throw new Error(`Falta ${nombre}`);
 const comando = `npx --yes vercel@65.10.0 env add ${nombre} --environment production --force --yes --scope dariomartinez2014 --sensitive`;
 const hijo = spawn("cmd.exe", ["/d", "/s", "/c", comando], { stdio: ["pipe", "pipe", "pipe"] });
 hijo.stdin.end(valor);
 let output=""; hijo.stdout.on("data", data => { output += data; }); hijo.stderr.on("data", data => { output += data; });
 const codigo = await new Promise(resolve => hijo.on("close", resolve));
 console.log(output.split(valor).join("[REDACTADO]"));
 if (codigo !== 0) throw new Error(`No se pudo configurar ${nombre}`);
}
