// Aplica las migraciones empresariales (002 a 009) en orden sobre una base de PRUEBAS.
// Uso: node tools/apply-org-migrations.mjs  (lee DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME del entorno)
import fs from 'node:fs/promises';
import mysql from 'mysql2/promise';
const name=process.env.DB_NAME;
if(!name||!/_test$/.test(name))throw Error('Por seguridad solo se aplica sobre bases cuyo nombre termina en _test.');
const c=await mysql.createConnection({host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD||'',multipleStatements:true});
await c.query(`CREATE DATABASE IF NOT EXISTS \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);await c.query(`USE \`${name}\``);
const migrationFiles=(await fs.readdir(new URL('../database/migrations/',import.meta.url))).filter(f=>/^00[2-9]_.*\.up\.sql$/.test(f)).sort();
for(const f of migrationFiles){
 let sql;try{sql=await fs.readFile(new URL('../database/migrations/'+f,import.meta.url),'utf8');}catch{continue;}
 await c.query(sql);console.log('aplicada',f);
}
await c.end();
