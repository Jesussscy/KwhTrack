import {database,configured} from './database.js';
import {HttpError} from './errors.js';
import {credentials} from './validation.js';
import {passwordHash,passwordMatches,cookieToken,tokenHash,sessionCookie,newSession,sameOrigin,csrf,throttle} from './security.js';
import {createHome,loadHome,publicHome,replaceHome,mutateEntity,summary,transaction} from './home-store.js';
export async function readJson(req,limit=1000000){
 if(!(req.headers['content-type']||'').toLowerCase().startsWith('application/json'))throw new HttpError(415,'Envía los datos como JSON.');
 let size=0,overflow=false;const chunks=[];
 for await(const chunk of req){size+=chunk.length;if(size>limit)overflow=true;else chunks.push(chunk);}
 if(overflow)throw new HttpError(413,'La solicitud supera el tamaño permitido.');
 try{const body=JSON.parse(Buffer.concat(chunks).toString('utf8'));if(!body||typeof body!=='object'||Array.isArray(body))throw Error();return body;}catch{throw new HttpError(400,'No se pudo leer el JSON de la solicitud.');}
}
async function session(req){const token=cookieToken(req);if(!token)return null;const db=await database();const [rows]=await db.execute('SELECT s.user_id,s.csrf_token,u.name,u.email,u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>UTC_TIMESTAMP(3)',[tokenHash(token)]);return rows[0]||null;}
async function issueSession(connection,userId,req){const old=cookieToken(req);if(old)await connection.execute('DELETE FROM sessions WHERE token_hash=?',[tokenHash(old)]);await connection.execute('DELETE FROM sessions WHERE expires_at<=UTC_TIMESTAMP(3)');const next=newSession();await connection.execute('INSERT INTO sessions (token_hash,user_id,csrf_token,expires_at) VALUES (?,?,?,DATE_ADD(UTC_TIMESTAMP(3),INTERVAL 8 HOUR))',[tokenHash(next.token),userId,next.csrf]);return next;}
const publicUser=row=>({id:row.user_id??row.id,name:row.name,email:row.email,role:row.role});
export async function handleApi(req,res,url,json){
 const path=url.pathname,method=req.method;
 if(!configured()){if(path==='/api/session'){json(res,200,{configured:false,authenticated:false});return true;}if(['/api/auth/register','/api/auth/login'].includes(path))throw new HttpError(503,'La cuenta necesita la conexión MySQL configurada.');return false;}
 if(path==='/api/session'&&method==='GET'){const current=await session(req);json(res,200,current?{configured:true,authenticated:true,user:publicUser(current),csrfToken:current.csrf_token}:{configured:true,authenticated:false});return true;}
 if(['/api/auth/register','/api/auth/login'].includes(path)&&method==='POST'){
  sameOrigin(req);const register=path.endsWith('/register');throttle(req,register?'register':'login');const input=credentials(await readJson(req,16000),{register});
  let result;
  if(register){const hash=await passwordHash(input.password);try{result=await transaction(async connection=>{const [created]=await connection.execute('INSERT INTO users (name,email,password_hash) VALUES (?,?,?)',[input.name,input.email,hash]);await createHome(connection,created.insertId);const issued=await issueSession(connection,created.insertId,req);return {user:{id:created.insertId,name:input.name,email:input.email,role:'user'},issued};});}catch(error){if(error.code==='ER_DUP_ENTRY')throw new HttpError(409,'Ese correo ya tiene una cuenta.');throw error;}}
  else{const db=await database();const [rows]=await db.execute('SELECT id,name,email,password_hash,role FROM users WHERE email=?',[input.email]);const user=rows[0];if(!await passwordMatches(input.password,user?.password_hash))throw new HttpError(401,'Correo o contraseña incorrectos.');result=await transaction(async connection=>({user:publicUser(user),issued:await issueSession(connection,user.id,req)}));}
  res.setHeader('Set-Cookie',sessionCookie(result.issued.token));json(res,register?201:200,{authenticated:true,user:result.user,csrfToken:result.issued.csrf});return true;
 }
 const protectedRoute=path==='/api/home'||path==='/api/summary'||path==='/api/auth/logout'||/^\/api\/(devices|readings|bills)(\/|$)/.test(path);
 if(!protectedRoute)return false;
 const current=await session(req);if(!current)throw new HttpError(401,'Inicia sesión para acceder a tu hogar.','SESSION_REQUIRED');
 if(req.headers['x-kwh-user']!==undefined&&req.headers['x-kwh-user']!==String(current.user_id))throw new HttpError(409,'La cuenta cambió en otra pestaña. Actualiza la sesión antes de continuar.','ACCOUNT_CHANGED');
 if(!['GET','HEAD'].includes(method)){sameOrigin(req);csrf(req,current);}
 if(path==='/api/auth/logout'&&method==='POST'){const db=await database();await db.execute('DELETE FROM sessions WHERE token_hash=?',[tokenHash(cookieToken(req))]);res.setHeader('Set-Cookie',sessionCookie('',{clear:true}));json(res,200,{authenticated:false});return true;}
 if(path==='/api/home'&&method==='GET'){json(res,200,publicHome(await loadHome(current.user_id)));return true;}
 if(path==='/api/home'&&method==='PUT'){const body=await readJson(req);json(res,200,await replaceHome(current.user_id,body.data,body.revision));return true;}
 if(path==='/api/summary'&&method==='GET'){json(res,200,summary(await loadHome(current.user_id)));return true;}
 const route=path.match(/^\/api\/(devices|readings|bills)(?:\/([a-zA-Z0-9_-]{1,80}))?$/);
 if(route){const [,entity,id]=route;
  if(method==='GET'){const home=await loadHome(current.user_id);if(id){const item=home.data[entity].find(x=>x.id===id);if(!item)throw new HttpError(404,'Registro no encontrado.');json(res,200,{revision:home.revision,item});}else json(res,200,{revision:home.revision,items:home.data[entity]});return true;}
  if((method==='POST'&&!id)||(['PATCH','DELETE'].includes(method)&&id)){const body=await readJson(req);json(res,method==='POST'?201:200,await mutateEntity(current.user_id,entity,method,id,body));return true;}
 }
 throw new HttpError(405,'Método no permitido para esta ruta.');
}
