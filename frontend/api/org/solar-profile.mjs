import {createRequire} from 'node:module';
const {solarProfile}=createRequire(import.meta.url)('../../server/solar-provider.cjs');
const attempts=new Map();
export const config={maxDuration:20};
const json=(res,status,data)=>{res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(data));};
/** Referencia solar pública para la demostración. No recibe ni guarda inventarios o credenciales. */
export default async function handler(req,res){
 try{
  if(req.method!=='POST'){res.setHeader('Allow','POST');return json(res,405,{error:'Usa POST para consultar la referencia solar.'});}
  const host=String(req.headers.host||''),origin=req.headers.origin;
  if(!host||!['https://'+host,...(/^(localhost|127\.0\.0\.1):\d+$/.test(host)?['http://'+host]:[])].includes(origin))return json(res,403,{error:'Origen no permitido.'});
  if(!String(req.headers['content-type']||'').toLowerCase().startsWith('application/json'))return json(res,415,{error:'Envía los ajustes como JSON.'});
  const now=Date.now(),ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'local').split(',')[0].trim();
  for(const [key,v]of attempts)if(v.until<now)attempts.delete(key);
  const attempt=attempts.get(ip)||{count:0,until:now+60000};attempt.count++;if(attempts.size>=1000&&!attempts.has(ip))attempts.delete(attempts.keys().next().value);attempts.set(ip,attempt);
  if(attempt.count>15)return json(res,429,{error:'Demasiadas consultas. Espera un minuto antes de reintentar.'});
  let body=req.body;
  if(body===undefined){let size=0;const chunks=[];for await(const chunk of req){size+=Buffer.byteLength(chunk);if(size>16000)return json(res,413,{error:'La configuración supera el tamaño permitido.'});chunks.push(Buffer.from(chunk));}body=Buffer.concat(chunks).toString('utf8');}
  if(Buffer.isBuffer(body))body=body.toString('utf8');
  if(Buffer.byteLength(typeof body==='string'?body:JSON.stringify(body??null))>16000)return json(res,413,{error:'La configuración supera el tamaño permitido.'});
  if(typeof body==='string'){try{body=JSON.parse(body);}catch{return json(res,400,{error:'El JSON no es válido.'});}}
  if(!body||typeof body!=='object'||Array.isArray(body)||!body.config)return json(res,400,{error:'Faltan los ajustes del escenario solar.'});
  return json(res,200,{production:await solarProfile(body.config)});
 }catch(e){return json(res,[400,429,502].includes(e.status)?e.status:500,{error:[400,429,502].includes(e.status)?e.message:'No se pudo consultar la referencia solar. Conserva tus ajustes y vuelve a intentar.'});}
}
