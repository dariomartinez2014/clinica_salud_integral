import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { app } from '../dist/src/app.js';
import { prisma } from '../dist/src/config/prisma.js';
import { secretoJWT } from '../dist/src/middlewares/auth.middleware.js';
const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base='http://127.0.0.1:'+server.address().port+'/api';
const email='mp3.auth.'+Date.now()+'@example.test';let checks=0;
async function call(path,body,token,status=200){const res=await fetch(base+path,{signal:AbortSignal.timeout(10000),method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});assert.equal(res.status,status);checks++;return res.json();}
try{
 await call('/auth/register',{nombre:'Cuenta temporal MP3',email,password:'TemporalMP3!',role:'RECEPCIONISTA'},null,201);
 const sesion=await call('/auth/login',{email,password:'TemporalMP3!'});
 assert.equal(sesion.usuario.email,email);assert.equal(sesion.usuario.rol,'RECEPCIONISTA');assert.equal(sesion.usuario.nombre,'Cuenta temporal MP3');assert.equal(typeof sesion.usuario.id,'number');assert(!('password' in sesion.usuario));assert.deepEqual(Object.keys(sesion).sort(),['token','usuario']);checks+=6;
 const payload=jwt.verify(sesion.token,secretoJWT(),{algorithms:['HS256']});assert.equal(payload.id,sesion.usuario.id);checks++;
 await call('/pacientes',null,sesion.token);
 await call('/auth/login',{email,password:'equivocada'},null,401);
 await call('/auth/login',{email:'invalido',password:'123'},null,400);
 await call('/pacientes',null,'token-invalido',401);
 const vencido=jwt.sign({id:sesion.usuario.id,email,role:'RECEPCIONISTA'},secretoJWT(),{algorithm:'HS256',expiresIn:-1});await call('/pacientes',null,vencido,401);
 console.log('OK MP3: '+checks+' comprobaciones; contrato, credenciales, Bearer y token expirado.');
}finally{await prisma.user.deleteMany({where:{email}});await new Promise(r=>server.close(r));await prisma.$disconnect();}
