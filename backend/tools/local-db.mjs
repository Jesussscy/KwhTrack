// Operación de la base MySQL local persistente de kwhTrack (no toca bases _test ni ajenas).
// Uso: node tools/local-db.mjs <status|start|stop|migrate|backup|restore <archivo.sql> <base_nueva>>
// Lee las credenciales de administración de %LOCALAPPDATA%\kwhTrackRuntime\mysql-admin.json (nunca se imprimen).
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {spawn,spawnSync} from 'node:child_process';
import mysql from 'mysql2/promise';
const runtime=path.join(process.env.LOCALAPPDATA||os.homedir(),'kwhTrackRuntime'),dataDir=path.join(runtime,'mysql-data');
const DB=process.env.KWH_DB_NAME||'kwhtrack';
const admin=JSON.parse(await fs.readFile(path.join(runtime,'mysql-admin.json'),'utf8'));
const base=process.env.KWH_MYSQL_BASE||(await fs.readFile(path.join(runtime,'mysql-base.txt'),'utf8').catch(()=>'')).trim();
const conn=(database)=>mysql.createConnection({host:'127.0.0.1',port:admin.port,user:'root',password:admin.password,database,multipleStatements:true,connectTimeout:1500});
const alive=async()=>{try{const c=await conn();await c.end();return true;}catch{return false;}};
const need=()=>{if(!base)throw Error('Falta la ruta de MySQL portable: crea '+path.join(runtime,'mysql-base.txt')+' o define KWH_MYSQL_BASE.');return base;};
const cmd=process.argv[2];
async function start(){
 if(await alive()){console.log('MySQL ya está activo en 127.0.0.1:'+admin.port);return;}
 const b=need();const child=spawn(path.join(b,'bin','mysqld.exe'),['--no-defaults','--basedir='+b,'--datadir='+dataDir,'--bind-address=127.0.0.1','--port='+admin.port,'--mysqlx=0','--skip-name-resolve','--log-error='+path.join(runtime,'mysql-error.log')],{detached:true,windowsHide:true,stdio:'ignore'});child.unref();
 await fs.writeFile(path.join(runtime,'mysql.pid'),String(child.pid));
 for(let i=0;i<80;i++){if(await alive()){console.log('MySQL activo en 127.0.0.1:'+admin.port);return;}await new Promise(r=>setTimeout(r,500));}
 throw Error('MySQL no arrancó; revisa '+path.join(runtime,'mysql-error.log'));
}
async function migrate(){
 const c=await conn();await c.query(`CREATE DATABASE IF NOT EXISTS \`${DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);await c.query(`USE \`${DB}\``);
 await c.query('CREATE TABLE IF NOT EXISTS schema_migrations (version VARCHAR(80) PRIMARY KEY,applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
 const dir=new URL('../database/migrations/',import.meta.url);const files=(await fs.readdir(dir)).filter(f=>/^\d{3}_.*\.up\.sql$/.test(f)).sort();
 const [done]=await c.query('SELECT version FROM schema_migrations');const seen=new Set(done.map(r=>r.version));let n=0;
 for(const f of files){if(seen.has(f))continue;await c.query(await fs.readFile(new URL(f,dir),'utf8'));await c.query('INSERT INTO schema_migrations (version) VALUES (?)',[f]);console.log('aplicada',f);n++;}
 console.log(n?`${n} migración(es) aplicada(s) a ${DB}.`:`${DB} ya está al día.`);await c.end();
}
function defaultsFile(){const f=path.join(os.tmpdir(),'kwh-my-'+process.pid+'.cnf');return fs.writeFile(f,`[client]\nuser=root\npassword=${admin.password}\nhost=127.0.0.1\nport=${admin.port}\n`,{mode:0o600}).then(()=>f);}
async function backup(){
 const b=need(),f=await defaultsFile();await fs.mkdir(path.join(runtime,'backup'),{recursive:true});
 const out=path.join(runtime,'backup',`${DB}-${new Date().toISOString().replace(/[:.]/g,'-')}.sql`);
 const r=spawnSync(path.join(b,'bin','mysqldump.exe'),['--defaults-extra-file='+f,'--single-transaction','--routines','--set-gtid-purged=OFF','--result-file='+out,DB],{encoding:'utf8'});
 await fs.rm(f,{force:true});if(r.status!==0)throw Error('mysqldump falló: '+(r.stderr||'').replace(/password=\S+/gi,'***').slice(0,300));
 console.log('Respaldo creado:',out,'('+Math.round((await fs.stat(out)).size/1024)+' KB)');
}
async function restore(file,target){
 if(!file||!target)throw Error('Uso: restore <archivo.sql> <base_nueva>');if(!/^[a-z0-9_]{1,40}$/i.test(target)||['mysql','sys','performance_schema','information_schema'].includes(target.toLowerCase()))throw Error('Nombre de base no permitido.');
 const c=await conn();const [ex]=await c.query('SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME=?',[target]);
 if(ex.length)throw Error(`La base ${target} ya existe: la restauración solo crea bases nuevas para no sobrescribir datos. Elige otro nombre.`);
 await c.query(`CREATE DATABASE \`${target}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);await c.end();
 const b=need(),f=await defaultsFile();const r=spawnSync(path.join(b,'bin','mysql.exe'),['--defaults-extra-file='+f,target],{input:await fs.readFile(file),encoding:'utf8'});await fs.rm(f,{force:true});
 if(r.status!==0)throw Error('La restauración falló: '+(r.stderr||'').replace(/password=\S+/gi,'***').slice(0,300));
 console.log(`Restaurado en la base nueva "${target}". Para usarla: KWH_DB_NAME/.env DB_NAME=${target} (y otorga permisos a kwhtrack_app).`);
}
try{
 if(cmd==='status'){console.log((await alive())?'MySQL activo en 127.0.0.1:'+admin.port:'MySQL apagado');}
 else if(cmd==='start')await start();
 else if(cmd==='stop'){if(!await alive())console.log('MySQL ya estaba apagado');else{const c=await conn();try{await c.query('SHUTDOWN');}catch{}console.log('MySQL apagado');}}
 else if(cmd==='migrate'){await start();await migrate();}
 else if(cmd==='backup'){await start();await backup();}
 else if(cmd==='restore'){await start();await restore(process.argv[3],process.argv[4]);}
 else console.log('Uso: node tools/local-db.mjs <status|start|stop|migrate|backup|restore <archivo.sql> <base_nueva>>');
}catch(e){console.error('Error:',e.message);process.exitCode=1;}
process.exit(process.exitCode||0);
