import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import mysql from 'mysql2/promise';
const base=process.argv[2];
if(!base)throw Error('Indica la carpeta portable de MySQL como primer argumento.');
const runtime=path.join(process.env.LOCALAPPDATA||process.env.HOME,'kwhTrackRuntime');
const dataDir=path.join(runtime,'mysql-data'),adminFile=path.join(runtime,'mysql-admin.json');
await fs.access(path.join(base,'bin','mysqld.exe'));await fs.mkdir(runtime,{recursive:true});
let admin;try{admin=JSON.parse(await fs.readFile(adminFile,'utf8'));}catch(error){if(error.code!=='ENOENT')throw Error('No se pudo leer la configuración privada de MySQL. Se conservó el original.');admin={port:3316,password:randomBytes(32).toString('hex'),appPassword:randomBytes(32).toString('hex'),secured:false};await fs.writeFile(adminFile,JSON.stringify(admin),{flag:'wx'});}
async function run(args){return new Promise((resolve,reject)=>{const child=spawn(path.join(base,'bin','mysqld.exe'),args,{windowsHide:true,stdio:['ignore','ignore','pipe']});let error='';child.stderr.on('data',chunk=>error+=chunk);child.once('error',reject);child.once('exit',code=>code===0?resolve():reject(Error('No se pudo inicializar MySQL. Revisa '+runtime)));});}
let initialized=false;try{await fs.access(path.join(dataDir,'auto.cnf'));initialized=true;}catch{}
if(!initialized){await fs.mkdir(dataDir,{recursive:true});await run(['--no-defaults','--initialize-insecure','--basedir='+base,'--datadir='+dataDir]);}
async function connect(password){return mysql.createConnection({host:'127.0.0.1',port:admin.port,user:'root',password,connectTimeout:1000});}
async function connectAdmin(){try{return await connect(admin.password);}catch(error){if(!admin.secured)return connect('');throw error;}}
let connection;try{connection=await connectAdmin();}catch{
 const bootstrap=path.join(runtime,'mysql-bootstrap.sql');
 if(!admin.secured){if(!/^[a-f0-9]{64}$/.test(admin.password))throw Error('La clave administrativa local no tiene el formato esperado.');await fs.writeFile(bootstrap,`ALTER USER 'root'@'localhost' IDENTIFIED BY '${admin.password}';\nCREATE USER IF NOT EXISTS 'root'@'127.0.0.1' IDENTIFIED BY '${admin.password}';\nALTER USER 'root'@'127.0.0.1' IDENTIFIED BY '${admin.password}';\nGRANT ALL PRIVILEGES ON *.* TO 'root'@'127.0.0.1' WITH GRANT OPTION;\n`);}
 const child=spawn(path.join(base,'bin','mysqld.exe'),['--no-defaults','--basedir='+base,'--datadir='+dataDir,'--bind-address=127.0.0.1','--port='+admin.port,'--mysqlx=0','--log-error='+path.join(runtime,'mysql-error.log'),'--skip-name-resolve',...(!admin.secured?['--init-file='+bootstrap]:[])],{detached:true,windowsHide:true,stdio:'ignore'});child.unref();await fs.writeFile(path.join(runtime,'mysql.pid'),String(child.pid));
 for(let i=0;i<60;i++){try{connection=await connectAdmin();break;}catch{await new Promise(resolve=>setTimeout(resolve,500));}}
}
if(!connection)throw Error('MySQL no quedó disponible. Revisa '+path.join(runtime,'mysql-error.log'));
const [[server]]=await connection.query('SELECT @@datadir AS directory, VERSION() AS version');
if(path.resolve(server.directory).toLowerCase()!==path.resolve(dataDir).toLowerCase())throw Error('El puerto pertenece a otra carpeta de datos. No se modificó.');
if(!admin.secured){await connection.query("ALTER USER 'root'@'localhost' IDENTIFIED BY ?",[admin.password]);admin.secured=true;await fs.writeFile(adminFile,JSON.stringify(admin));}
await fs.rm(path.join(runtime,'mysql-bootstrap.sql'),{force:true});
await connection.query('CREATE DATABASE IF NOT EXISTS kwhtrack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
for(const host of ['127.0.0.1','localhost']){await connection.query('CREATE USER IF NOT EXISTS ?@? IDENTIFIED BY ?',['kwhtrack_app',host,admin.appPassword]);await connection.query('ALTER USER ?@? IDENTIFIED BY ?',['kwhtrack_app',host,admin.appPassword]);await connection.query('GRANT SELECT, INSERT, UPDATE, DELETE ON kwhtrack.* TO ?@?',['kwhtrack_app',host]);}
const ddl=await fs.readFile(new URL('../database/schema.sql',import.meta.url),'utf8');
for(const statement of ddl.split(';').map(x=>x.trim()).filter(Boolean))await connection.query(statement);
const envPath=new URL('../.env',import.meta.url);let existing=false;try{await fs.access(envPath);existing=true;}catch{}
if(!existing)await fs.writeFile(envPath,`PORT=3000\nDB_HOST=127.0.0.1\nDB_PORT=${admin.port}\nDB_USER=kwhtrack_app\nDB_PASSWORD=${admin.appPassword}\nDB_NAME=kwhtrack\nCOOKIE_SECURE=false\n`);
await connection.end();process.stdout.write(`MySQL ${server.version} preparado en 127.0.0.1:${admin.port}; datos aislados en ${dataDir}.\n${existing?'Se conservó .env existente.':'Configuración local guardada en backend/.env, excluida de Git.'}\n`);
