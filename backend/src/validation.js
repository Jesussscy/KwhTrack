import {createRequire} from 'node:module';
import {HttpError} from './errors.js';
const require=createRequire(import.meta.url),{validate}=require('../../frontend/backup.js');
export function homeData(input){
 try{
  const data=validate({product:'kwhTrack',version:1,data:input});
  for(const [key,places] of [['budget',2],['rate',4]])if(Math.abs(data.settings[key]*10**places-Math.round(data.settings[key]*10**places))>.00001)throw Error(`El valor de ${key==='budget'?'presupuesto':'tarifa'} admite como máximo ${places} decimales.`);
  for(const b of data.bills)if(Math.abs(b.amount*100-Math.round(b.amount*100))>.00001)throw Error('El total pagado admite como máximo dos decimales.');
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Bogota',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  if(data.readings.some(r=>r.date>today)||data.bills.some(b=>b.end>today))throw Error('Las lecturas y facturas registradas no pueden tener fechas futuras.');
  return data;
 }catch(error){throw new HttpError(400,error instanceof TypeError?'Datos del hogar inválidos.':error.message||'Datos del hogar inválidos.');}
}
export function revision(value){if(!Number.isSafeInteger(value)||value<0)throw new HttpError(400,'Indica la revisión que estás editando.');return value;}
export function credentials(body,{register=false}={}){
 if(!body||typeof body.email!=='string'||body.email.length>190||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))throw new HttpError(400,'Introduce un correo válido.');
 if(typeof body.password!=='string'||body.password.length<12||body.password.length>128)throw new HttpError(400,'La contraseña debe tener entre 12 y 128 caracteres.');
 const result={email:body.email.trim().toLowerCase(),password:body.password};
 if(register){if(typeof body.name!=='string'||!body.name.trim()||body.name.length>80)throw new HttpError(400,'Introduce un nombre de hasta 80 caracteres.');result.name=body.name.trim();}
 return result;
}
export function clientKey(value){if(!/^[a-zA-Z0-9_-]{1,80}$/.test(value))throw new HttpError(400,'Identificador inválido.');return value;}
