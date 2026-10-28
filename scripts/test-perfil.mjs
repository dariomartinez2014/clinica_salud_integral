import assert from 'node:assert/strict';
import { app } from '../dist/src/app.js';
import { prisma } from '../dist/src/config/prisma.js';
import { directorioFotos } from '../dist/src/controllers/perfil.controller.js';
import { unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
const server=app.listen(0,'127.0.0.1'); await new Promise(r=>server.once('listening',r));
const base=`http://127.0.0.1:${server.address().port}/api`; const email=`perfil.${Date.now()}@example.com`; let id;const fotos=[];let checks=0;
async function call(path,options={},status=200){const r=await fetch(base+path,options);const data=await r.json();assert.equal(r.status,status,JSON.stringify(data));checks++;return {data,headers:r.headers};}
try{
const {data:registro}=await call('/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nombre:'Usuario Temporal',email,password:'PruebaPerfil123!',role:'RECEPCIONISTA'})},201);id=registro.id;
const {data:login}=await call('/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:'PruebaPerfil123!'})});const headers={Authorization:`Bearer ${login.token}`};
await call('/auth/perfil',{method:'PUT',body:new FormData()},401);
await call('/auth/me',{headers});
const form=(nombre='Nombre Actualizado',telefono='12345678')=>{const f=new FormData();f.append('nombre',nombre);f.append('email',email);f.append('telefono',telefono);return f;};
await call('/auth/perfil',{method:'PUT',headers,body:form('AB')},400);
await call('/auth/perfil',{method:'PUT',headers,body:form('Nombre Valido','abc')},400);
let f=form();f.append('foto',new Blob(['texto falso'],{type:'image/png'}),'falsa.png');await call('/auth/perfil',{method:'PUT',headers,body:f},400);
f=form();f.append('foto',new Blob([new Uint8Array(5*1024*1024+1)],{type:'image/png'}),'grande.png');await call('/auth/perfil',{method:'PUT',headers,body:f},400);
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3ioAAAAASUVORK5CYII=','base64');
f=form();f.append('foto',new Blob([png],{type:'image/png'}),'avatar.png');const {data:u}=await call('/auth/perfil',{method:'PUT',headers,body:f});assert.equal(u.nombre,'Nombre Actualizado');assert.equal(u.telefono,'12345678');assert.ok(u.foto);assert.equal('password' in u,false);checks+=4;fotos.push(u.foto.split('/').pop());
const photo=await fetch(u.foto);assert.equal(photo.status,200);assert.ok(photo.headers.get('content-type').includes('image/png'));checks+=2;
const {data:u2}=await call('/auth/perfil',{method:'PUT',headers,body:form('Nombre Sin Foto','')});assert.equal(u2.foto,u.foto);assert.equal(u2.telefono,null);checks+=2;
const {data:login2}=await call('/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:'PruebaPerfil123!'})});assert.equal(login2.usuario.foto,u.foto);checks++;
console.log(`OK: ${checks} comprobaciones reales de perfil, multipart, archivos, persistencia y login.`);
}finally{if(id)await prisma.user.delete({where:{id}});for(const f of fotos)await unlink(resolve(directorioFotos,f)).catch(()=>{});await new Promise(r=>server.close(r));await prisma.$disconnect();}
