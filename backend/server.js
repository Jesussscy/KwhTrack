import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {calculateDevice} from './src/calculations.js';
import {database,configured} from './src/database.js';
import {handleApi,readJson} from './src/api.js';
import {HttpError} from './src/errors.js';
const frontend=fileURLToPath(new URL('../frontend/',import.meta.url));
const port=Number(process.env.PORT||3000);
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
export function createAppServer(){const server=http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
 res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
 res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
 try{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/api/health'&&req.method==='GET')return json(res,200,{status:'ok',storage:'browser-local',accountsConfigured:configured()});
 if(url.pathname==='/api/calculate'&&req.method==='POST'){const input=await readJson(req,16000);try{const kwh=calculateDevice(input.device);if(typeof input.rate!=='number'||!Number.isFinite(input.rate)||input.rate<=0||input.rate>100000)throw new Error('Tarifa inválida');return json(res,200,{kwh,cost:kwh*input.rate});}catch(error){throw new HttpError(400,error.message);}}
 if(url.pathname==='/api/database-status'&&req.method==='GET'){try{const db=await database();await db.query('SELECT 1');return json(res,200,{connected:true});}catch{return json(res,503,{connected:false,message:'Configura MySQL en backend/.env e importa database/schema.sql.'});}}
 if(await handleApi(req,res,url,json))return;
 if(url.pathname.startsWith('/api/'))return json(res,404,{error:'Ruta no disponible.'});
 if(!['GET','HEAD'].includes(req.method))return json(res,405,{error:'Método no permitido'});
 const routes={'/appliance-catalog.js':'appliance-catalog.js','/appliance-finder.js':'appliance-finder.js','/appliance-finder.css':'appliance-finder.css','/bill-analysis.js':'bill-analysis.js','/polish.css':'polish.css','/tariff-guide.js':'tariff-guide.js','/energy-experience.js':'energy-experience.js','/energy-experience.css':'energy-experience.css','/':'index.html','/index.html':'index.html','/styles.css':'styles.css','/app.js':'app.js','/accounts.js':'accounts.js','/comparison.js':'comparison.js','/session-recovery.js':'session-recovery.js','/account-transport.js':'account-transport.js','/chart-details.js':'chart-details.js','/bill-experience.js':'bill-experience.js','/experience.js':'experience.js','/experience.css':'experience.css','/insights.js':'insights.js','/processes.js':'processes.js','/backup.js':'backup.js','/continuity.js':'continuity.js','/planner.js':'planner.js','/annual.js':'annual.js','/forms.js':'forms.js','/storage.js':'storage.js','/recovery.js':'recovery.js'};
 const file=routes[url.pathname];if(!file)return json(res,404,{error:'Archivo no encontrado'});
 const data=await readFile(path.join(frontend,file));res.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':'text/javascript; charset=utf-8'});res.end(req.method==='HEAD'?undefined:data);
 }catch(error){const unavailable=['ECONNREFUSED','ETIMEDOUT','PROTOCOL_CONNECTION_LOST','ER_ACCESS_DENIED_ERROR','ER_NO_SUCH_TABLE','ER_BAD_FIELD_ERROR'].includes(error.code);json(res,error instanceof HttpError?error.status:unavailable?503:500,{...(error instanceof HttpError&&error.code?{code:error.code}:{}),error:error instanceof HttpError?error.message:unavailable?'No se pudo conectar con los datos de tu cuenta. Intenta más tarde.':'No se pudo procesar la solicitud.'});}
});
server.requestTimeout=15000;server.headersTimeout=10000;return server;}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))createAppServer().listen(port,'127.0.0.1',()=>process.stdout.write(`kwhTrack disponible en http://127.0.0.1:${port}\n`));
