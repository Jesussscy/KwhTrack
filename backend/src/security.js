import {randomBytes,scrypt as rawScrypt,timingSafeEqual,createHash} from 'node:crypto';
import {promisify} from 'node:util';
import {HttpError} from './errors.js';
const scrypt=promisify(rawScrypt),options={N:32768,r:8,p:1,maxmem:64*1024*1024};
export async function passwordHash(password){const salt=randomBytes(16).toString('hex'),key=await scrypt(password,salt,64,options);return `scrypt:${salt}:${key.toString('hex')}`;}
export async function passwordMatches(password,stored){
 const parts=typeof stored==='string'?stored.split(':'):[];
 const valid=parts.length===3&&parts[0]==='scrypt'&&/^[a-f0-9]{32}$/.test(parts[1])&&/^[a-f0-9]{128}$/.test(parts[2]);
 const derived=await scrypt(password,valid?parts[1]:'00000000000000000000000000000000',64,options);
 return valid&&timingSafeEqual(derived,Buffer.from(parts[2],'hex'));
}
export const tokenHash=token=>createHash('sha256').update(token).digest();
export const cookieName=()=>process.env.COOKIE_NAME||'kwhtrack_session';
export function cookieToken(req){const value=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName()+'='))?.slice(cookieName().length+1);return /^[a-f0-9]{64}$/.test(value||'')?value:null;}
export function sessionCookie(token,{clear=false}={}){return `${cookieName()}=${clear?'':token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${clear?0:28800}${process.env.COOKIE_SECURE==='true'?'; Secure':''}`;}
export function newSession(){return {token:randomBytes(32).toString('hex'),csrf:randomBytes(32).toString('hex')};}
export function sameOrigin(req){const host=req.headers.host||'';if(!/^(127\.0\.0\.1|localhost):\d+$/.test(host))throw new HttpError(403,'Origen no permitido.');const expected=`http${req.socket.encrypted?'s':''}://${host}`;if(req.headers.origin!==expected)throw new HttpError(403,'Origen no permitido.');}
export function csrf(req,session){const sent=req.headers['x-csrf-token'];if(typeof sent!=='string'||!/^[a-f0-9]{64}$/.test(sent)||!timingSafeEqual(Buffer.from(sent),Buffer.from(session.csrf_token)))throw new HttpError(403,'La verificación de la sesión falló. Actualiza la sesión antes de guardar.','CSRF_MISMATCH');}
const attempts=new Map();
export function throttle(req,kind){const now=Date.now(),key=(req.socket.remoteAddress||'local')+':'+kind;for(const [k,v] of attempts)if(v.until<now)attempts.delete(k);const value=attempts.get(key)||{count:0,until:now+(kind==='register'?3600000:60000)};value.count++;attempts.set(key,value);if(value.count>(kind==='register'?12:15))throw new HttpError(429,'Demasiados intentos. Espera antes de volver a intentarlo.');}
