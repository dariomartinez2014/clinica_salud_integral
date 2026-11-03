import { spawnSync } from "node:child_process";
if (!process.env.DIRECT_DATABASE_URL) throw new Error("Falta DIRECT_DATABASE_URL");
const resultado = spawnSync(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "deploy", "--config", "prisma7.config.ts"], { env: { ...process.env, DATABASE_URL: process.env.DIRECT_DATABASE_URL }, stdio: "inherit" });
process.exitCode = resultado.status ?? 1;
