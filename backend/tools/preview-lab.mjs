// Entorno local aislado para probar recuperación y varias pestañas.
// No forma parte del servidor de la aplicación.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
const fixture=new URL('../test/fixtures/storage-lab.html',import.meta.url);
const labPort=Number(process.env.KWH_QA_PORT||3198);
if(!Number.isInteger(labPort)||labPort<1024||labPort>65535)throw Error('KWH_QA_PORT debe ser un puerto local entre 1024 y 65535.');
http.createServer(async(req,res)=>{
 try{
  if(req.url==='/__qa/storage'){
   res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});return res.end(await readFile(fixture));
  }
  const chunks=[];for await(const chunk of req){chunks.push(chunk);if(chunks.reduce((s,c)=>s+c.length,0)>16000){res.writeHead(413);return res.end();}}
  const payload=Buffer.concat(chunks);
  const upstream=await fetch('http://127.0.0.1:3000'+req.url,{method:req.method,headers:{'Content-Type':req.headers['content-type']||'application/json'},...(['GET','HEAD'].includes(req.method)?{}:{body:payload})});
  res.writeHead(upstream.status,{'Content-Type':upstream.headers.get('content-type')||'text/plain','Cache-Control':'no-store'});res.end(Buffer.from(await upstream.arrayBuffer()));
 }catch{res.writeHead(502,{'Content-Type':'text/plain'});res.end('Inicia la aplicación en el puerto 3000 antes de usar el laboratorio.');}
}).listen(labPort,'127.0.0.1',()=>process.stdout.write(`Laboratorio aislado: http://127.0.0.1:${labPort}/__qa/storage\n`));
