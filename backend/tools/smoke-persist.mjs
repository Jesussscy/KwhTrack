// Humo de persistencia contra el servidor en marcha. Fase 1: crea cuenta+edificio y guarda estado en un archivo temporal.
// Fase 2 (tras reiniciar el servidor): inicia sesión, comprueba que el edificio persiste y borra la cuenta de humo.
// Uso: node tools/smoke-persist.mjs <1|2> http://127.0.0.1:3000
import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import {randomUUID} from 'node:crypto';
import mysql from 'mysql2/promise';
const [phase,base]=[process.argv[2],process.argv[3]],state=path.join(os.tmpdir(),'kwh-smoke.json');
async function req(p,{method='GET',body,cookie,csrf}={}){const h={Origin:base};if(body!==undefined)h['Content-Type']='application/json';if(cookie)h.Cookie=cookie;if(csrf)h['X-CSRF-Token']=csrf;const r=await fetch(base+'/api/org'+p,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};}
if(phase==='1'){
 const email='humo-'+randomUUID()+'@kwhtrack.test',password=randomUUID()+'-Pw1';
 const reg=await req('/auth/register',{method:'POST',body:{name:'Humo',organization:'Humo temporal',email,password}});if(reg.status!==201)throw Error('registro '+reg.status+' '+JSON.stringify(reg.data));
 const b=await req('/buildings',{method:'POST',cookie:reg.cookie,csrf:reg.data.csrfToken,body:{name:'Edificio humo',floors:[{name:'P1'}],spacesPerFloor:2}});if(b.status!==201)throw Error('edificio '+b.status);
 await fs.writeFile(state,JSON.stringify({email,password,id:b.data.building.id}),{mode:0o600});console.log('fase 1 ok: registro 201, edificio',b.data.building.id,'creado');
}else{
 const s=JSON.parse(await fs.readFile(state,'utf8'));
 const bad=await req('/auth/login',{method:'POST',body:{email:s.email,password:'incorrecta-incorrecta'}});console.log('login con clave incorrecta ->',bad.status);
 const log=await req('/auth/login',{method:'POST',body:{email:s.email,password:s.password}});console.log('login tras reinicio ->',log.status);
 const got=await req('/buildings/'+s.id,{cookie:log.cookie});console.log('edificio recuperado ->',got.status,got.data.building?.name,'pisos:',got.data.building?.floors.length);
 const out=await req('/auth/logout',{method:'POST',cookie:log.cookie,csrf:log.data.csrfToken,body:{}});console.log('logout ->',out.status);
 console.log('sesión tras logout ->',(await req('/session',{cookie:log.cookie})).data.authenticated);
 // limpieza: solo la organización de humo (por correo), con credenciales de administración locales
 const adm=JSON.parse(await fs.readFile(path.join(process.env.LOCALAPPDATA,'kwhTrackRuntime','mysql-admin.json'),'utf8'));
 const c=await mysql.createConnection({host:'127.0.0.1',port:adm.port,user:'root',password:adm.password,database:process.env.KWH_DB_NAME||'kwhtrack'});
 const [u]=await c.execute('SELECT organization_id FROM org_users WHERE email=? AND email LIKE ?',[s.email,'humo-%@kwhtrack.test']);if(u[0])await c.execute('DELETE FROM organizations WHERE id=?',[u[0].organization_id]);
 const [[n]]=await c.query('SELECT (SELECT COUNT(*) FROM organizations) AS orgs,(SELECT COUNT(*) FROM org_users) AS users');console.log('cuenta de humo eliminada; organizaciones restantes:',n.orgs,'usuarios:',n.users);await c.end();await fs.rm(state,{force:true});
}
