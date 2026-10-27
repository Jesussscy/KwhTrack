// Origen desechable: almacenamiento y cookie separados de la aplicación principal.
import {readFile} from 'node:fs/promises';
import {createAppServer} from '../server.js';
process.env.COOKIE_NAME='kwhtrack_qa_session';
const server=createAppServer(),handler=server.listeners('request')[0];server.removeAllListeners('request');
server.on('request',async(req,res)=>{if(req.url==='/__qa/storage'&&req.method==='GET'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});return res.end(await readFile(new URL('../test/fixtures/storage-lab.html',import.meta.url)));}return handler(req,res);});
server.listen(3199,'127.0.0.1',()=>process.stdout.write('Laboratorio de cuentas: http://127.0.0.1:3199/__qa/storage\n'));
