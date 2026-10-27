import {randomUUID} from 'node:crypto';
import {database} from './database.js';
import {homeData,revision,clientKey} from './validation.js';
import {HttpError} from './errors.js';
import {calculateDevice} from './calculations.js';
export async function transaction(action){const db=await database(),connection=await db.getConnection();try{await connection.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');await connection.beginTransaction();const result=await action(connection);await connection.commit();return result;}catch(error){await connection.rollback();throw error;}finally{connection.release();}}
export async function createHome(connection,userId){await connection.execute('INSERT INTO homes (user_id,name,budget,custom_rate,custom_rate_enabled,savings_goal,example,draft_plan) VALUES (?, ?, 400000, 1033.32, FALSE, 15, FALSE, ?)',[userId,'Mi hogar','[]']);}
export async function loadHome(userId,connection,{lock=false}={}){
 if(!connection)return transaction(conn=>loadHome(userId,conn,{lock}));
 const db=connection||await database();const [homes]=await db.execute('SELECT * FROM homes WHERE user_id=? ORDER BY id LIMIT 1'+(lock?' FOR UPDATE':''),[userId]);const home=homes[0];if(!home)throw new HttpError(404,'No se encontró tu hogar.');
 const [devices]=await db.execute('SELECT client_key AS id,name,category,calculation_mode AS mode,active,monthly_kwh AS monthlyKwh,watts,quantity,hours,days,factor FROM devices WHERE home_id=? ORDER BY devices.id',[home.id]);
 const [readings]=await db.execute('SELECT client_key AS id,reading_date AS date,accumulated_kwh AS value FROM readings WHERE home_id=? ORDER BY reading_date',[home.id]);
 const [bills]=await db.execute('SELECT client_key AS id,period_start AS start,period_end AS end,kwh,total_paid AS amount FROM bills WHERE home_id=? ORDER BY period_start',[home.id]);
 return {homeId:home.id,revision:Number(home.revision),data:{settings:{name:home.name,budget:home.budget,rate:home.custom_rate,customRate:Boolean(home.custom_rate_enabled),savingsGoal:home.savings_goal},example:Boolean(home.example),devices:devices.map(d=>({...d,active:Boolean(d.active)})),readings,bills,draftPlan:typeof home.draft_plan==='string'?JSON.parse(home.draft_plan):home.draft_plan||[]}};
}
export function publicHome(home){return {revision:home.revision,data:home.data};}
async function writeHome(connection,home,next){
 await connection.execute('UPDATE homes SET name=?,budget=?,custom_rate=?,custom_rate_enabled=?,savings_goal=?,example=?,draft_plan=?,revision=revision+1 WHERE id=?',[next.settings.name,next.settings.budget,next.settings.rate,next.settings.customRate,next.settings.savingsGoal,next.example,JSON.stringify(next.draftPlan),home.homeId]);
 for(const table of ['devices','readings','bills'])await connection.execute(`DELETE FROM ${table} WHERE home_id=?`,[home.homeId]);
 if(next.devices.length)await connection.query('INSERT INTO devices (home_id,client_key,name,category,calculation_mode,active,monthly_kwh,watts,quantity,hours,days,factor) VALUES ?',[next.devices.map(d=>[home.homeId,d.id,d.name,d.category,d.mode,d.active,d.monthlyKwh,d.watts,d.quantity,d.hours,d.days,d.factor])]);
 if(next.readings.length)await connection.query('INSERT INTO readings (home_id,client_key,reading_date,accumulated_kwh) VALUES ?',[next.readings.map(r=>[home.homeId,r.id,r.date,r.value])]);
 if(next.bills.length)await connection.query('INSERT INTO bills (home_id,client_key,period_start,period_end,kwh,total_paid) VALUES ?',[next.bills.map(b=>[home.homeId,b.id,b.start,b.end,b.kwh,b.amount])]);
}
export async function replaceHome(userId,input,expected){const data=homeData(input);revision(expected);return transaction(async connection=>{const home=await loadHome(userId,connection,{lock:true});if(home.revision!==expected)throw new HttpError(409,'Tu hogar cambió en otra sesión. Carga la versión actual antes de guardar.');await writeHome(connection,home,data);return publicHome(await loadHome(userId,connection));});}
const singular={devices:'device',readings:'reading',bills:'bill'};
export async function mutateEntity(userId,entity,method,id,body){
 revision(body.revision);if(id)clientKey(id);
 return transaction(async connection=>{
  const home=await loadHome(userId,connection,{lock:true});if(home.revision!==body.revision)throw new HttpError(409,'Tu hogar cambió. Carga la versión actual antes de guardar.');
  const next=structuredClone(home.data),items=next[entity],index=items.findIndex(x=>x.id===id);
  if(method==='DELETE'){if(index<0)throw new HttpError(404,'Registro no encontrado.');items.splice(index,1);}
  else{const input=body[singular[entity]];if(!input||typeof input!=='object'||Array.isArray(input))throw new HttpError(400,'Indica los datos del registro.');
   if(method==='POST'){const key=clientKey(input.id||randomUUID());if(items.some(x=>x.id===key))throw new HttpError(409,'Ese registro ya existe.');items.push({...input,id:key});}
   else{if(index<0)throw new HttpError(404,'Registro no encontrado.');items[index]={...items[index],...input,id};}
  }
  const valid=homeData(next);await writeHome(connection,home,valid);return publicHome(await loadHome(userId,connection));
 });
}
export function summary(home){const kwh=home.data.devices.reduce((total,d)=>total+(d.active?calculateDevice(d):0),0),cost=kwh*home.data.settings.rate;return {revision:home.revision,kwh,cost,annualCost:cost*12,budgetMargin:home.data.settings.budget-cost,source:'devices',estimated:true};}
