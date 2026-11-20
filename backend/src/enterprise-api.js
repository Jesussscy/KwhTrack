// API empresarial: sesiones, CSRF y tablas separadas de las domésticas. Todo se acota a la organización de la sesión.
import {database,configured} from './database.js';
import {HttpError} from './errors.js';
import {isDeepStrictEqual} from 'node:util';
import {randomUUID} from 'node:crypto';
import {passwordHash,passwordMatches,cookieToken,tokenHash,newSession,sameOrigin,csrf,throttle} from './security.js';
import {readJson} from './api.js';
import {transaction} from './home-store.js';
import {computeBuilding} from './enterprise-calc.js';
import * as v from './enterprise-validation.js';
import {validateEnergy,solarProfile,E} from './enterprise-energy.js';
import {sensorConfigured,readSensors} from './enterprise-sensors.js';
import {searchProducts} from './enterprise-products.js';
const Layout=createRequire(import.meta.url)('../../frontend/enterprise-layout.js');
import {createRequire} from 'node:module';
const DEMO=createRequire(import.meta.url)('../../frontend/enterprise-demo.js');
const FloorDraft=createRequire(import.meta.url)('../../frontend/enterprise-floor-draft.js');

const COOKIE='kwhtrack_org_session';
const token=req=>{const m=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='));const t=m?.slice(COOKIE.length+1);return /^[a-f0-9]{64}$/.test(t||'')?t:null;};
const cookie=(t,clear)=>`${COOKIE}=${clear?'':t}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${clear?0:28800}${process.env.COOKIE_SECURE==='true'?'; Secure':''}`;
async function session(req){const t=token(req);if(!t)return null;const db=await database();const [r]=await db.execute('SELECT s.csrf_token,u.id AS user_id,u.name,u.email,u.org_role,o.id AS org_id,o.name AS org_name FROM org_sessions s JOIN org_users u ON u.id=s.org_user_id JOIN organizations o ON o.id=u.organization_id WHERE s.token_hash=? AND s.expires_at>UTC_TIMESTAMP(3)',[tokenHash(t)]);return r[0]||null;}
const pub=s=>({user:{name:s.name,email:s.email,role:s.org_role},organization:{name:s.org_name}});
async function issue(c,userId){const n=newSession();await c.execute('INSERT INTO org_sessions (token_hash,org_user_id,csrf_token,expires_at) VALUES (?,?,?,DATE_ADD(UTC_TIMESTAMP(3),INTERVAL 8 HOUR))',[tokenHash(n.token),userId,n.csrf]);return n;}

async function loadBuilding(c,orgId,buildingId){
 const [b]=await c.execute('SELECT id,name,city,is_demo,revision,monthly_budget,tariff_rate,tariff_source,tariff_date,energy_config FROM buildings WHERE id=? AND organization_id=?',[buildingId,orgId]);
 if(!b[0])throw new HttpError(404,'Edificio no encontrado.');
 const [floors]=await c.execute('SELECT id,name,position,layout_config FROM floors WHERE building_id=? ORDER BY position,id',[buildingId]);
 const [spaces]=await c.execute('SELECT s.id,s.floor_id,s.name,s.kind,s.layout_slot AS slot,s.plan_x,s.plan_y,s.plan_w,s.plan_d,s.dims_declared,s.workstations,s.occupied_ws,s.desk_mode,s.area_m2 FROM spaces s JOIN floors f ON f.id=s.floor_id WHERE f.building_id=? ORDER BY s.position,s.id',[buildingId]);
 const [eq]=await c.execute('SELECT e.id,e.space_id,e.name,e.category,e.calculation_mode AS mode,e.quantity,e.watts,e.hours,e.days,e.factor,e.monthly_kwh AS monthlyKwh,e.active,e.essential,e.product_reference,e.visual_placement FROM equipment e JOIN spaces s ON s.id=e.space_id JOIN floors f ON f.id=s.floor_id WHERE f.building_id=? ORDER BY e.id',[buildingId]);
 const [records]=await c.execute('SELECT id,period_start AS start,period_end AS end,kwh,origin FROM consumption_records WHERE building_id=? ORDER BY period_start DESC LIMIT 60',[buildingId]);
 const [meters]=await c.execute('SELECT id,name,kind,scope,floor_id AS floorId,space_id AS spaceId,parent_id AS parentId FROM meters WHERE building_id=? ORDER BY id',[buildingId]);
 const [mr]=await c.execute('SELECT r.id,r.meter_id AS meterId,r.reading_date AS date,r.value FROM meter_readings r JOIN meters m ON m.id=r.meter_id WHERE m.building_id=? ORDER BY r.reading_date',[buildingId]);
 const [common]=await c.execute('SELECT id,name,category,calculation_mode AS mode,quantity,watts,hours,days,factor,monthly_kwh AS monthlyKwh,active FROM common_loads WHERE building_id=? ORDER BY id',[buildingId]);
 const [ul]=await c.execute('SELECT op,label,created_at FROM undo_log WHERE building_id=? AND undone=FALSE AND after_revision=? ORDER BY id DESC LIMIT 1',[buildingId,b[0].revision]);
 const raw={energyCapabilities:{homeAssistant:sensorConfigured(buildingId)},energy:typeof b[0].energy_config==='string'?JSON.parse(b[0].energy_config):(b[0].energy_config||null),undo:ul[0]?{op:ul[0].op,label:ul[0].label}:null,meters:meters.map(m=>({...m,readings:mr.filter(r=>r.meterId===m.id).map(({meterId,...r})=>r)})),common:common.map(x=>({...x,active:Boolean(x.active)})),id:b[0].id,name:b[0].name,city:b[0].city,isDemo:Boolean(b[0].is_demo),revision:Number(b[0].revision),records,budget:{monthlyBudget:b[0].monthly_budget,tariffRate:b[0].tariff_rate,tariffSource:b[0].tariff_source,tariffDate:b[0].tariff_date},
  floors:floors.map(f=>({id:f.id,name:f.name,order:f.position,config:typeof f.layout_config==='string'?JSON.parse(f.layout_config):(f.layout_config||null),spaces:spaces.filter(s=>s.floor_id===f.id).map(s=>({id:s.id,name:s.name,kind:s.kind,slot:s.slot,plan:s.plan_x==null?null:{x:s.plan_x,y:s.plan_y,w:s.plan_w,d:s.plan_d},dimsDeclared:Boolean(s.dims_declared),workstations:s.workstations,occupied:s.occupied_ws,deskMode:s.desk_mode,areaM2:s.area_m2,equipment:eq.filter(e=>e.space_id===s.id).map(({space_id,...e})=>({...e,placement:typeof e.visual_placement==='string'?JSON.parse(e.visual_placement):(e.visual_placement||null),productReference:typeof e.product_reference==='string'?JSON.parse(e.product_reference):(e.product_reference||null),active:Boolean(e.active),essential:Boolean(e.essential)}))}))}))};
 if(raw.energy)raw.energy.noOwnSpaces=(raw.energy.noOwnSpaces||[]).filter(id=>spaces.some(s=>s.id===id)&&!eq.some(e=>e.space_id===id));
 if(raw.energy)raw.energy.corridors=(raw.energy.corridors||[]).filter(z=>floors.some(f=>f.id===z.floorId));
 return computeBuilding(raw);
}
// Resuelve el edificio dueño de un recurso SOLO si pertenece a la organización.
const OWN={
 building:'SELECT b.id AS bid FROM buildings b WHERE b.id=? AND b.organization_id=?',
 floor:'SELECT b.id AS bid FROM floors f JOIN buildings b ON b.id=f.building_id WHERE f.id=? AND b.organization_id=?',
 space:'SELECT b.id AS bid FROM spaces s JOIN floors f ON f.id=s.floor_id JOIN buildings b ON b.id=f.building_id WHERE s.id=? AND b.organization_id=?',
 equipment:'SELECT b.id AS bid FROM equipment e JOIN spaces s ON s.id=e.space_id JOIN floors f ON f.id=s.floor_id JOIN buildings b ON b.id=f.building_id WHERE e.id=? AND b.organization_id=?',
 meter:'SELECT b.id AS bid FROM meters m JOIN buildings b ON b.id=m.building_id WHERE m.id=? AND b.organization_id=?',
 mreading:'SELECT b.id AS bid FROM meter_readings r JOIN meters m ON m.id=r.meter_id JOIN buildings b ON b.id=m.building_id WHERE r.id=? AND b.organization_id=?',
 common:'SELECT b.id AS bid FROM common_loads x JOIN buildings b ON b.id=x.building_id WHERE x.id=? AND b.organization_id=?',
 record:'SELECT b.id AS bid FROM consumption_records r JOIN buildings b ON b.id=r.building_id WHERE r.id=? AND b.organization_id=?'
};
// Ejecuta una mutación con propiedad verificada, bloqueo y control de revisión; devuelve el edificio recalculado.
async function mutate(cur,kind,rid,body,action){
 const revision=v.rev(body.revision),rowId=v.id(rid);
 return transaction(async c=>{
  const [o]=await c.execute(OWN[kind],[rowId,cur.org_id]);if(!o[0])throw new HttpError(404,'Recurso no encontrado.');
  const bid=o[0].bid;const [lock]=await c.execute('SELECT revision FROM buildings WHERE id=? FOR UPDATE',[bid]);
  if(Number(lock[0].revision)!==revision)throw new HttpError(409,'Este edificio cambió en otra sesión. Recarga la versión actual antes de guardar.','REVISION_CONFLICT');
  const deleted=await action(c,rowId,bid);
  if(deleted==='building')return {deleted:true};
  await c.execute('UPDATE buildings SET revision=revision+1 WHERE id=?',[bid]);
  if(deleted&&!Array.isArray(deleted)&&deleted.undo)await c.execute('INSERT INTO undo_log (building_id,org_user_id,op,label,payload,after_revision) VALUES (?,?,?,?,?,?)',[bid,cur.user_id,deleted.undo.op,deleted.undo.label.slice(0,200),JSON.stringify(deleted.undo.payload),revision+1]);
  return {building:await loadBuilding(c,cur.org_id,bid)};
 });
}

const EQ_COLS='name,category,calculation_mode,quantity,watts,hours,days,factor,monthly_kwh,active,essential,space_id,product_reference,visual_placement';
async function eqRow(c,id){const [r]=await c.execute(`SELECT id,${EQ_COLS} FROM equipment WHERE id=?`,[id]);return r[0];}
async function runUndo(c,bid,u){
 const p=typeof u.payload==='string'?JSON.parse(u.payload):u.payload;
 if(u.op==='eq_position'){await c.execute('UPDATE equipment SET visual_placement=? WHERE id=?',[p.before==null?null:JSON.stringify(p.before),p.id]);}
 else if(u.op==='energy'){await c.execute('UPDATE buildings SET energy_config=? WHERE id=?',[p.before?JSON.stringify(p.before):null,bid]);}
 else if(u.op==='eq_update'){const r=p.row;await c.execute('UPDATE equipment SET name=?,category=?,calculation_mode=?,quantity=?,watts=?,hours=?,days=?,factor=?,monthly_kwh=?,active=?,essential=?,product_reference=?,visual_placement=? WHERE id=?',[r.name,r.category,r.calculation_mode,r.quantity,r.watts,r.hours,r.days,r.factor,r.monthly_kwh,r.active,r.essential,r.product_reference==null?null:JSON.stringify(r.product_reference),r.visual_placement==null?null:JSON.stringify(r.visual_placement),r.id]);}
 else if(u.op==='eq_create'){await c.execute('DELETE FROM equipment WHERE id=?',[p.id]);}
 else if(u.op==='eq_delete'){const r=p.row;const [ok]=await c.execute('SELECT s.id FROM spaces s JOIN floors f ON f.id=s.floor_id WHERE s.id=? AND f.building_id=?',[r.space_id,bid]);if(!ok[0])throw new HttpError(409,'El espacio original ya no existe; no se puede restaurar el equipo.','UNDO_UNAVAILABLE');
  await c.execute('INSERT INTO equipment (id,space_id,name,category,calculation_mode,quantity,watts,hours,days,factor,monthly_kwh,active,essential,product_reference,visual_placement) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[r.id,r.space_id,r.name,r.category,r.calculation_mode,r.quantity,r.watts,r.hours,r.days,r.factor,r.monthly_kwh,r.active,r.essential,r.product_reference==null?null:JSON.stringify(r.product_reference),r.visual_placement==null?null:JSON.stringify(r.visual_placement)]);}
 else if(u.op==='plan'){for(const it of p.items)await c.execute('UPDATE equipment SET hours=?,days=? WHERE id=?',[it.hours,it.days,it.id]);}
 else if(u.op==='layout'){for(const sp of p.spaces)await c.execute('UPDATE spaces SET plan_x=?,plan_y=?,plan_w=?,plan_d=? WHERE id=?',[sp.x,sp.y,sp.w,sp.d,sp.id]);}
 else if(u.op==='space_edit'){await c.execute('UPDATE spaces SET name=?,kind=?,workstations=?,occupied_ws=?,desk_mode=?,area_m2=? WHERE id=?',[p.name,p.kind,p.workstations,p.occupied,p.deskMode,p.areaM2,p.id]);}
 else if(u.op==='configure'){for(const id of p.created)await c.execute('DELETE FROM spaces WHERE id=?',[id]);
  for(const b of p.before)await c.execute('UPDATE spaces SET name=?,kind=?,position=?,plan_x=?,plan_y=?,plan_w=?,plan_d=?,dims_declared=? WHERE id=?',[b.name,b.kind,b.position,b.plan?.x??null,b.plan?.y??null,b.plan?.w??null,b.plan?.d??null,b.declared,b.id]);
  await c.execute('UPDATE floors SET layout_config=? WHERE id=?',[p.config?JSON.stringify(p.config):null,p.floorId]);}
 else if(u.op==='eq_move'){const [ok]=await c.execute('SELECT s.id FROM spaces s JOIN floors f ON f.id=s.floor_id WHERE s.id=? AND f.building_id=?',[p.spaceId,bid]);if(!ok[0])throw new HttpError(409,'El espacio de origen ya no existe.','UNDO_UNAVAILABLE');await c.execute('UPDATE equipment SET space_id=? WHERE id=?',[p.spaceId,p.id]);}
 else if(u.op==='rec_create'){await c.execute('DELETE FROM consumption_records WHERE id=?',[p.id]);}
 else if(u.op==='rec_delete'){const r=p.row;const [ov]=await c.execute('SELECT COUNT(*) AS n FROM consumption_records WHERE building_id=? AND period_start<=? AND period_end>=?',[bid,r.period_end,r.period_start]);if(ov[0].n>0)throw new HttpError(409,'El periodo ya está cubierto por otro registro.','UNDO_UNAVAILABLE');
  await c.execute('INSERT INTO consumption_records (id,building_id,period_start,period_end,kwh,origin) VALUES (?,?,?,?,?,?)',[r.id,bid,r.period_start,r.period_end,r.kwh,r.origin]);}
 else if(u.op==='space_dup'){await c.execute('DELETE FROM spaces WHERE id=?',[p.id]);}
 else if(u.op==='space_move'){const [ok]=await c.execute('SELECT id FROM floors WHERE id=? AND building_id=?',[p.floorId,bid]);if(!ok[0])throw new HttpError(409,'El piso de origen ya no existe.','UNDO_UNAVAILABLE');
  await c.execute('UPDATE spaces SET floor_id=?,position=?,layout_slot=?,plan_x=?,plan_y=?,plan_w=?,plan_d=? WHERE id=?',[p.floorId,p.position,p.slot,p.plan?.x??null,p.plan?.y??null,p.plan?.w??null,p.plan?.d??null,p.id]);}
 else if(u.op==='floor_delete'||u.op==='space_delete'){await restoreSnapshot(c,bid,p);}
 else throw new HttpError(409,'Esta operación no se puede deshacer.','UNDO_UNAVAILABLE');
}

const SNAP_LIMIT=3000;
/** Instantánea transaccional de un piso o espacio con todas sus dependencias (espacios, equipos, medidores de ese alcance y sus lecturas). */
async function snapshot(c,bid,{floorId,spaceId}){
 const [fl]=floorId?await c.execute('SELECT id,building_id,name,position,layout_config FROM floors WHERE id=?',[floorId]):[[]];
 const [sp]=floorId?await c.execute('SELECT * FROM spaces WHERE floor_id=? ORDER BY id',[floorId]):await c.execute('SELECT * FROM spaces WHERE id=?',[spaceId]);
 const sids=sp.map(x=>x.id);if(!sids.length&&!floorId)return null;
 const [eq]=sids.length?await c.query(`SELECT * FROM equipment WHERE space_id IN (?) ORDER BY id`,[sids]):[[]];
 const [mt]=await c.query('SELECT * FROM meters WHERE building_id=? AND ((scope=\'floor\' AND floor_id=?) OR (scope=\'space\' AND space_id IN (?)))',[bid,floorId||0,sids.length?sids:[0]]);
 const [rd]=mt.length?await c.query('SELECT * FROM meter_readings WHERE meter_id IN (?)',[mt.map(m=>m.id)]):[[]];
 if(eq.length+rd.length>SNAP_LIMIT)return null;
 return {floor:fl[0]||null,spaces:sp,equipment:eq,meters:mt,readings:rd};
}
async function restoreSnapshot(c,bid,p){
 if(p.floor){const [ex]=await c.execute('SELECT id FROM floors WHERE id=?',[p.floor.id]);if(ex[0])throw new HttpError(409,'El piso ya existe; no se puede restaurar.','UNDO_UNAVAILABLE');
  await c.execute('INSERT INTO floors (id,building_id,name,position,layout_config) VALUES (?,?,?,?,?)',[p.floor.id,bid,p.floor.name,p.floor.position,p.floor.layout_config?JSON.stringify(p.floor.layout_config):null]);}
 const fid=p.floor?p.floor.id:p.spaces[0]?.floor_id;const [okf]=await c.execute('SELECT id FROM floors WHERE id=? AND building_id=?',[fid,bid]);if(!okf[0])throw new HttpError(409,'El piso de origen ya no existe; no se puede restaurar el espacio.','UNDO_UNAVAILABLE');
 for(const s of p.spaces)await c.execute('INSERT INTO spaces (id,floor_id,name,kind,position,layout_slot,plan_x,plan_y,plan_w,plan_d,dims_declared,workstations,occupied_ws,desk_mode,area_m2) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[s.id,s.floor_id,s.name,s.kind,s.position,s.layout_slot,s.plan_x,s.plan_y,s.plan_w,s.plan_d,s.dims_declared,s.workstations,s.occupied_ws,s.desk_mode,s.area_m2]);
 for(const e of p.equipment)await c.execute('INSERT INTO equipment (id,space_id,name,category,calculation_mode,quantity,watts,hours,days,factor,monthly_kwh,active,essential,product_reference,visual_placement) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[e.id,e.space_id,e.name,e.category,e.calculation_mode,e.quantity,e.watts,e.hours,e.days,e.factor,e.monthly_kwh,e.active,e.essential,e.product_reference==null?null:JSON.stringify(e.product_reference),e.visual_placement==null?null:JSON.stringify(e.visual_placement)]);
 for(const m of p.meters){const [pm]=m.parent_id?await c.execute('SELECT id FROM meters WHERE id=? AND building_id=?',[m.parent_id,bid]):[[1]];
  await c.execute('INSERT INTO meters (id,building_id,name,kind,scope,floor_id,space_id,parent_id) VALUES (?,?,?,?,?,?,?,?)',[m.id,bid,m.name,m.kind,m.scope,m.floor_id,m.space_id,pm[0]?m.parent_id:null]);}
 for(const r of p.readings)await c.execute('INSERT INTO meter_readings (id,meter_id,reading_date,value) VALUES (?,?,?,?)',[r.id,r.meter_id,r.reading_date,r.value]);
}

/** Rectángulo (plan guardado o distribución automática) de cada espacio de un piso, en el orden position,id. */
async function floorRects(c,fid){
 const [sp]=await c.execute('SELECT id,name,plan_x,plan_y,plan_w,plan_d,workstations,desk_mode FROM spaces WHERE floor_id=? ORDER BY position,id',[fid]);
 const [[fl]]=await c.execute('SELECT layout_config FROM floors WHERE id=?',[fid]);const cfg=fl.layout_config==null?null:(typeof fl.layout_config==='string'?JSON.parse(fl.layout_config):fl.layout_config);
 const auto=Layout.auto(sp.length),all=sp.length&&sp.every(x=>x.plan_x!=null);
 return {spaces:sp.map((x,i)=>({id:x.id,name:x.name,workstations:x.workstations,deskMode:x.desk_mode,rect:all?{x:x.plan_x,y:x.plan_y,w:x.plan_w,d:x.plan_d}:auto[i]})),corridor:cfg&&cfg.corridorRect||null};
}
async function nextPos(c,table,col,parent){const [r]=await c.execute(`SELECT COALESCE(MAX(position),-1)+1 AS p FROM ${table} WHERE ${col}=?`,[parent]);return r[0].p;}
const insertEquipment=(c,sid,e)=>c.execute('INSERT INTO equipment (space_id,name,category,calculation_mode,quantity,watts,hours,days,factor,monthly_kwh,active,essential,product_reference,visual_placement) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[sid,e.name,e.category,e.mode,e.quantity,e.watts,e.hours,e.days,e.factor,e.monthlyKwh,e.active!==false,e.essential===true,e.productReference?JSON.stringify(e.productReference):null,e.placement?JSON.stringify(e.placement):null]);

async function freeSlot(c,floorId){const [r]=await c.execute('SELECT layout_slot FROM spaces WHERE floor_id=? AND layout_slot IS NOT NULL',[floorId]);const used=new Set(r.map(x=>x.layout_slot));for(let i=0;i<4;i++)if(!used.has(i))return i;return null;}

export async function handleEnterpriseApi(req,res,url,json){
 const path=url.pathname,method=req.method;
 if(!path.startsWith('/api/org/'))return false;
 if(path==='/api/org/products'&&method==='GET'){json(res,200,await searchProducts(url.searchParams.get('q')));return true;}
 if(path==='/api/org/solar-profile'&&method==='POST'){sameOrigin(req);throttle(req,'solar-profile');const body=await readJson(req,16000);json(res,200,{production:await solarProfile(body.config)});return true;}

 if(!configured()){if(path==='/api/org/session'){json(res,200,{configured:false,authenticated:false});return true;}throw new HttpError(503,'La zona empresarial necesita MySQL configurado.');}
 if(path==='/api/org/session'&&method==='GET'){const s=await session(req);json(res,200,s?{configured:true,authenticated:true,...pub(s),csrfToken:s.csrf_token}:{configured:true,authenticated:false});return true;}
 if((path==='/api/org/auth/register'||path==='/api/org/auth/login')&&method==='POST'){
  sameOrigin(req);const register=path.endsWith('/register');throttle(req,register?'register':'login');
  const input=v.credentialsOrg(await readJson(req,16000),{register});
  // Limpieza en autocommit: dentro de la transacción de alta bloqueaba el rango de sesiones
  // y dos registros simultáneos podían bloquear mutuamente sus INSERT.
  const authDb=await database();await authDb.execute('DELETE FROM org_sessions WHERE expires_at<=UTC_TIMESTAMP(3)');let out;
  if(register){const hash=await passwordHash(input.password);try{out=await transaction(async c=>{const [o]=await c.execute('INSERT INTO organizations (name) VALUES (?)',[input.organization]);const [u]=await c.execute("INSERT INTO org_users (organization_id,name,email,password_hash,org_role) VALUES (?,?,?,?,'owner')",[o.insertId,input.name,input.email,hash]);return {s:{name:input.name,email:input.email,org_role:'owner',org_name:input.organization},n:await issue(c,u.insertId)};});}catch(e){if(e.code==='ER_DUP_ENTRY')throw new HttpError(409,'Ese correo ya tiene una cuenta.');throw e;}}
  else{const db=await database();const [r]=await db.execute('SELECT u.id,u.name,u.email,u.org_role,u.password_hash,o.name AS org_name FROM org_users u JOIN organizations o ON o.id=u.organization_id WHERE u.email=?',[input.email]);const u=r[0];if(!await passwordMatches(input.password,u?.password_hash))throw new HttpError(401,'Correo o contraseña incorrectos.');out=await transaction(async c=>({s:u,n:await issue(c,u.id)}));}
  res.setHeader('Set-Cookie',cookie(out.n.token));json(res,register?201:200,{authenticated:true,...pub(out.s),csrfToken:out.n.csrf});return true;
 }
 const cur=await session(req);if(!cur)throw new HttpError(401,'Inicia sesión empresarial para continuar.','SESSION_REQUIRED');
 if(!['GET','HEAD'].includes(method)){sameOrigin(req);csrf(req,cur);}
 const db=await database();
 if(path==='/api/org/auth/logout'&&method==='POST'){await db.execute('DELETE FROM org_sessions WHERE token_hash=?',[tokenHash(token(req))]);res.setHeader('Set-Cookie',cookie('',true));json(res,200,{authenticated:false});return true;}
 if(path==='/api/org/buildings'&&method==='GET'){
  const [rows]=await db.execute('SELECT id FROM buildings WHERE organization_id=? ORDER BY id',[cur.org_id]);
  const list=[];for(const r of rows){const b=await loadBuilding(db,cur.org_id,r.id);list.push({id:b.id,name:b.name,city:b.city,isDemo:b.isDemo,revision:b.revision,floorCount:b.floors.length,totals:b.totals,unit:b.unit,origin:b.origin,records:b.records.slice(0,3)});}
  json(res,200,{organization:cur.org_name,buildings:list});return true;
 }
 if(path==='/api/org/buildings'&&method==='POST'){
  const b=await readJson(req,32000),name=v.text(b.name,'el nombre del edificio',{max:100}),city=v.text(b.city,'la ciudad',{max:80,required:false});
  const floors=Array.isArray(b.floors)?b.floors:[];if(floors.length>200)throw new HttpError(400,'Máximo 200 pisos por edificio.');
  const names=floors.map(f=>v.text(f?.name,'el nombre del piso'));
  const perFloor=b.spacesPerFloor==null?0:b.spacesPerFloor;if(!Number.isInteger(perFloor)||perFloor<0||perFloor>20)throw new HttpError(400,'Espacios por piso: entero entre 0 y 20.');
  json(res,201,await transaction(async c=>{const [r]=await c.execute('INSERT INTO buildings (organization_id,name,city) VALUES (?,?,?)',[cur.org_id,name,city]);
   for(const [i,n] of names.entries()){const [f]=await c.execute('INSERT INTO floors (building_id,name,position) VALUES (?,?,?)',[r.insertId,n,i]);for(let k=0;k<perFloor;k++)await c.execute("INSERT INTO spaces (floor_id,name,kind,position,layout_slot) VALUES (?,?,'Otro',?,?)",[f.insertId,`Espacio ${String.fromCharCode(65+k)}`,k,k<4?k:null]);}
   return {building:await loadBuilding(c,cur.org_id,r.insertId)};}));return true;
 }
 if(path==='/api/org/buildings/demo'&&method==='POST'){
  const example=DEMO.create();json(res,201,await transaction(async c=>{
   const [r]=await c.execute('INSERT INTO buildings (organization_id,name,city,is_demo,monthly_budget,tariff_rate,tariff_source,tariff_date) VALUES (?,?,?,TRUE,?,?,?,?)',[cur.org_id,example.name,example.city,example.budget.monthlyBudget,example.budget.tariffRate,example.budget.tariffSource,example.budget.tariffDate]);const floors=new Map();
   for(const [i,f]of example.floors.entries()){const [fl]=await c.execute('INSERT INTO floors (building_id,name,position,layout_config) VALUES (?,?,?,?)',[r.insertId,f.name,i,JSON.stringify(f.config)]);floors.set(f.id,fl.insertId);for(const [k,s]of f.spaces.entries()){const [sp]=await c.execute('INSERT INTO spaces (floor_id,name,kind,position,layout_slot,plan_x,plan_y,plan_w,plan_d,workstations,occupied_ws,desk_mode,area_m2) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',[fl.insertId,s.name,s.kind,k,null,s.plan.x,s.plan.y,s.plan.w,s.plan.d,s.workstations,s.occupied,s.deskMode,s.areaM2]);for(const e of s.equipment)await insertEquipment(c,sp.insertId,e);}}
   const energy=validateEnergy({...example.energy,corridors:example.energy.corridors.map(z=>({...z,floorId:floors.get(z.floorId)}))},[...floors.values()]);await c.execute('UPDATE buildings SET energy_config=? WHERE id=?',[JSON.stringify(energy),r.insertId]);
   for(const e of example.common)await c.execute('INSERT INTO common_loads (building_id,name,category,calculation_mode,quantity,watts,hours,days,factor,monthly_kwh,active) VALUES (?,?,?,?,?,?,?,?,?,?,?)',[r.insertId,e.name,e.category,e.mode,e.quantity,e.watts,e.hours,e.days,e.factor,e.monthlyKwh??null,e.active]);
   for(const rec of example.records)await c.execute('INSERT INTO consumption_records (building_id,period_start,period_end,kwh,origin) VALUES (?,?,?,?,?)',[r.insertId,rec.start,rec.end,rec.kwh,rec.origin]);return {building:await loadBuilding(c,cur.org_id,r.insertId)};
  }));return true;
 }

 if(path==='/api/org/export'&&method==='GET'){
  const [rows]=await db.execute('SELECT id FROM buildings WHERE organization_id=? ORDER BY id',[cur.org_id]);const out=[];
  for(const r of rows){const b=await loadBuilding(db,cur.org_id,r.id);let fi=0,si=0,mi=0;const fref=new Map(),sref=new Map(),mref=new Map();
   const floors=b.floors.map(f=>{const fr='f'+(++fi);fref.set(f.id,fr);return {ref:fr,name:f.name,layoutConfig:f.config||null,spaces:f.spaces.map(s=>{const sr='s'+(++si);sref.set(s.id,sr);return {ref:sr,name:s.name,kind:s.kind,slot:s.slot,plan:s.plan,dimsDeclared:Boolean(s.dimsDeclared),workstations:s.workstations,occupied:s.occupied,deskMode:s.deskMode,areaM2:s.areaM2,equipment:s.equipment.map(e=>({name:e.name,category:e.category,mode:e.mode,quantity:e.quantity,watts:e.watts,hours:e.hours,days:e.days,factor:e.factor,monthlyKwh:e.monthlyKwh,active:Boolean(e.active),essential:Boolean(e.essential),productReference:e.productReference||null,placement:e.placement||null}))};})};});
   (b.meters||[]).forEach(m=>mref.set(m.id,'m'+(++mi)));
   out.push({name:b.name,city:b.city,isDemo:b.isDemo,budget:b.budget,floors,energy:b.energy?{...b.energy,corridors:(b.energy.corridors||[]).map(z=>({...z,floorId:fref.get(z.floorId)})),noOwnSpaces:(b.energy.noOwnSpaces||[]).filter(id=>sref.has(id)).map(id=>sref.get(id)),observations:[],rules:[]}:null,
    common:(b.common||[]).map(e=>({name:e.name,category:e.category,mode:e.mode,quantity:e.quantity,watts:e.watts,hours:e.hours,days:e.days,factor:e.factor,monthlyKwh:e.monthlyKwh,active:Boolean(e.active)})),
    meters:(b.meters||[]).map(m=>({ref:mref.get(m.id),name:m.name,kind:m.kind,scope:m.scope,floorRef:m.floorId?fref.get(m.floorId):null,spaceRef:m.spaceId?sref.get(m.spaceId):null,parentRef:m.parentId?mref.get(m.parentId):null,readings:m.readings.map(x=>({date:x.date,value:x.value}))})),
    records:b.records.map(x=>({start:x.start,end:x.end,kwh:x.kwh,origin:x.origin}))});}
  json(res,200,{product:'kwhtrack-empresas',version:5,kind:'copia-importable',exportedAt:new Date().toISOString(),buildings:out});return true;
 }
 if(path==='/api/org/import'&&method==='POST'){
  const body=await readJson(req,8000000),plan=v.parseBackup(body.data,Layout);
  if(body.dryRun===true){json(res,200,{dryRun:true,version:plan.version,counts:plan.counts,warnings:plan.warnings,names:plan.buildings.map(b=>b.name+' (importado)')});return true;}
  json(res,201,await transaction(async c=>{let n=0;for(const b of plan.buildings){const [r]=await c.execute('INSERT INTO buildings (organization_id,name,city,is_demo,monthly_budget,tariff_rate,tariff_source,tariff_date) VALUES (?,?,?,?,?,?,?,?)',[cur.org_id,(b.name+' (importado)').slice(0,100),b.city,b.isDemo,b.budget?.monthlyBudget??null,b.budget?.tariffRate??null,b.budget?.tariffSource??null,b.budget?.tariffDate??null]);n++;
   const F=new Map(),S=new Map(),M=new Map();
   for(const [i,f] of b.floors.entries()){const [fl]=await c.execute('INSERT INTO floors (building_id,name,position,layout_config) VALUES (?,?,?,?)',[r.insertId,f.name,i,f.config?JSON.stringify(f.config):null]);if(f.ref)F.set(f.ref,fl.insertId);
    for(const [k,s] of f.spaces.entries()){const [sp]=await c.execute('INSERT INTO spaces (floor_id,name,kind,position,layout_slot,plan_x,plan_y,plan_w,plan_d,dims_declared,workstations,occupied_ws,desk_mode,area_m2) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[fl.insertId,s.name,s.kind,k,s.slot,s.plan?.x??null,s.plan?.y??null,s.plan?.w??null,s.plan?.d??null,s.dimsDeclared,s.workstations,s.occupied,s.workstations?(s.deskMode||'open'):null,s.areaM2]);if(s.ref)S.set(s.ref,sp.insertId);for(const e of s.equipment)await insertEquipment(c,sp.insertId,e);}}
   if(b.energy){const energy=validateEnergy({...b.energy,corridors:b.energy.corridors.map(z=>({...z,floorId:F.get(z.floorId)})),noOwnSpaces:(b.energy.noOwnSpaces||[]).map(ref=>S.get(ref)),observations:[],rules:[]},[...F.values()]);await c.execute('UPDATE buildings SET energy_config=? WHERE id=?',[JSON.stringify(energy),r.insertId]);}
   for(const e of b.common)await c.execute('INSERT INTO common_loads (building_id,name,category,calculation_mode,quantity,watts,hours,days,factor,monthly_kwh,active) VALUES (?,?,?,?,?,?,?,?,?,?,?)',[r.insertId,e.name,e.category,e.mode,e.quantity,e.watts,e.hours,e.days,e.factor,e.monthlyKwh,e.active]);
   for(const m of [...b.meters.filter(x=>x.kind==='general'),...b.meters.filter(x=>x.kind==='sub')]){const [mr]=await c.execute('INSERT INTO meters (building_id,name,kind,scope,floor_id,space_id,parent_id) VALUES (?,?,?,?,?,?,?)',[r.insertId,m.name,m.kind,m.scope,m.scope==='floor'?F.get(m.floorRef):null,m.scope==='space'?S.get(m.spaceRef):null,m.kind==='sub'?M.get(m.parentRef):null]);M.set(m.ref,mr.insertId);
    for(const x of m.readings)await c.execute('INSERT INTO meter_readings (meter_id,reading_date,value) VALUES (?,?,?)',[mr.insertId,x.date,x.value]);}
   for(const x of b.records)await c.execute('INSERT INTO consumption_records (building_id,period_start,period_end,kwh,origin) VALUES (?,?,?,?,?)',[r.insertId,x.start,x.end,x.kwh,x.origin]);}
   return {imported:n,counts:plan.counts};}));return true;
 }
 // Energía: mismo aislamiento, CSRF y control de revisión que el inventario.
 const energyMatch=path.match(/^\/api\/org\/buildings\/(\d+)\/(energy|solar|sensors-sync)$/);
 if(energyMatch&&['PUT','POST'].includes(method)){
  const body=await readJson(req,250000),bid=v.id(energyMatch[1]);
  const owned=await loadBuilding(db,cur.org_id,bid);
  let energy;
  if(energyMatch[2]==='sensors-sync'){
   const observations=await readSensors(bid),combined=[...(owned.energy?.observations||[])];for(const o of observations)if(!combined.some(x=>x.id===o.id))combined.push(o);energy=validateEnergy({...owned.energy,observations:combined.slice(-200)},owned.floors.map(f=>f.id));
  }else if(energyMatch[2]==='solar'){
   if(body.revision!==owned.revision)throw new HttpError(409,'El edificio cambió. Recarga antes de consultar.','REVISION_CONFLICT');
   const production=await solarProfile(body.config);energy=validateEnergy({...owned.energy,solar:{config:body.config,production}},owned.floors.map(f=>f.id));
  }else{
   energy=validateEnergy(body.energy,owned.floors.map(f=>f.id));for(const sid of energy.noOwnSpaces){const sp=owned.floors.flatMap(f=>f.spaces).find(sp=>sp.id===sid);if(!sp)throw new HttpError(404,'Espacio no encontrado en este edificio.');if(sp.equipment.length)throw new HttpError(400,'El espacio ya tiene equipos; no se puede declarar sin equipos propios.');}
   for(const o of energy.observations)if(o.origin==='home-assistant'&&!owned.energy?.observations?.some(previous=>isDeepStrictEqual(o,previous)))throw new HttpError(400,'Las lecturas de integración solo se incorporan mediante la sincronización del servidor.');
   if(energy.solar?.production&&!isDeepStrictEqual(energy.solar.production,owned.energy?.solar?.production))throw new HttpError(400,'La curva de producción solo se guarda desde la consulta solar al proveedor.');
  }
  json(res,200,await mutate(cur,'building',bid,body,async(c,_,id)=>{await c.execute('UPDATE buildings SET energy_config=? WHERE id=?',[JSON.stringify(energy),id]);return {undo:{op:'energy',label:energyMatch[2]==='solar'?'Actualizar escenario solar':energyMatch[2]==='sensors-sync'?'Actualizar lecturas de sensores':'Editar configuración energética',payload:{before:owned.energy||null}}};}));return true;
 }
 let m=path.match(/^\/api\/org\/buildings\/(\d+)$/);
 if(m&&method==='GET'){json(res,200,{building:await loadBuilding(db,cur.org_id,v.id(m[1]))});return true;}
 if(m&&method==='PATCH'){const b=await readJson(req);json(res,200,await mutate(cur,'building',m[1],b,async(c,_,bid)=>{const bu=b.budget?v.budget(b.budget):null;await c.execute('UPDATE buildings SET name=?,city=?'+(bu?',monthly_budget=?,tariff_rate=?,tariff_source=?,tariff_date=?':'')+' WHERE id=?',[v.text(b.name,'el nombre del edificio',{max:100}),v.text(b.city,'la ciudad',{max:80,required:false}),...(bu?[bu.monthlyBudget,bu.tariffRate,bu.tariffSource,bu.tariffDate]:[]),bid]);}));return true;}
 if(m&&method==='DELETE'){const b=await readJson(req);json(res,200,await mutate(cur,'building',m[1],b,async(c,id)=>{await c.execute('DELETE FROM buildings WHERE id=?',[id]);return 'building';}));return true;}

 // --- Estructura y operaciones adicionales (propiedad verificada, bloqueo y revisión en mutate)
 m=path.match(/^\/api\/org\/floors\/(\d+)\/(duplicate|move)$/);
 if(m&&method==='POST'){const b=await readJson(req);
  if(m[2]==='move'){if(!['up','down'].includes(b.direction))throw new HttpError(400,'Dirección inválida.');
   json(res,200,await mutate(cur,'floor',m[1],b,async(c,fid,bid)=>{const [fl]=await c.execute('SELECT id FROM floors WHERE building_id=? ORDER BY position,id',[bid]);const ids=fl.map(x=>x.id),i=ids.indexOf(fid),j=b.direction==='up'?i+1:i-1;if(j<0||j>=ids.length)return;[ids[i],ids[j]]=[ids[j],ids[i]];for(const [k,x] of ids.entries())await c.execute('UPDATE floors SET position=? WHERE id=?',[k,x]);}));return true;}
  const withInv=b.withInventory===true;
  json(res,201,await mutate(cur,'floor',m[1],b,async(c,fid,bid)=>{const [[src]]=await c.execute('SELECT name FROM floors WHERE id=?',[fid]);const [nf]=await c.execute('INSERT INTO floors (building_id,name,position,layout_config) SELECT ?,?,?,layout_config FROM floors WHERE id=?',[bid,(src.name+' (copia)').slice(0,80),await nextPos(c,'floors','building_id',bid),fid]);
   const [sp]=await c.execute('SELECT id,name,kind,position,layout_slot FROM spaces WHERE floor_id=? ORDER BY position,id',[fid]);
   for(const s of sp){const [ns]=await c.execute('INSERT INTO spaces (floor_id,name,kind,position,layout_slot,plan_x,plan_y,plan_w,plan_d,dims_declared,workstations,occupied_ws,desk_mode,area_m2) SELECT ?,name,kind,position,layout_slot,plan_x,plan_y,plan_w,plan_d,dims_declared,workstations,occupied_ws,desk_mode,area_m2 FROM spaces WHERE id=?',[nf.insertId,s.id]);
    if(withInv)await c.execute('INSERT INTO equipment (space_id,name,category,calculation_mode,quantity,watts,hours,days,factor,monthly_kwh,active,essential,product_reference,visual_placement) SELECT ?,name,category,calculation_mode,quantity,watts,hours,days,factor,monthly_kwh,active,essential,product_reference,visual_placement FROM equipment WHERE space_id=?',[ns.insertId,s.id]);}
   const [[eb]]=await c.execute('SELECT energy_config FROM buildings WHERE id=?',[bid]);const energy=typeof eb.energy_config==='string'?JSON.parse(eb.energy_config):eb.energy_config;
   const source=energy?.corridors?.find(z=>z.floorId===fid);if(source){energy.corridors.push({...source,id:randomUUID(),floorId:nf.insertId,equipment:withInv?source.equipment.map(e=>({...e,id:randomUUID()})):[]});await c.execute('UPDATE buildings SET energy_config=? WHERE id=?',[JSON.stringify(energy),bid]);}
  }));return true;}
 m=path.match(/^\/api\/org\/equipment\/(\d+)\/(duplicate|move)$/);
 if(m&&method==='POST'){const b=await readJson(req);
  json(res,201,await mutate(cur,'equipment',m[1],b,async(c,eid,bid)=>{
   if(m[2]==='duplicate'){await c.execute("INSERT INTO equipment (space_id,name,category,calculation_mode,quantity,watts,hours,days,factor,monthly_kwh,active,essential,product_reference,visual_placement) SELECT space_id,LEFT(CONCAT(name,' (copia)'),80),category,calculation_mode,quantity,watts,hours,days,factor,monthly_kwh,active,essential,product_reference,visual_placement FROM equipment WHERE id=?",[eid]);return;}
   const target=v.id(b.spaceId);const [ok]=await c.execute('SELECT s.id FROM spaces s JOIN floors f ON f.id=s.floor_id WHERE s.id=? AND f.building_id=?',[target,bid]);if(!ok[0])throw new HttpError(404,'Espacio de destino no encontrado en este edificio.');
   const before=await eqRow(c,eid);await c.execute('UPDATE equipment SET space_id=? WHERE id=?',[target,eid]);return {undo:{op:'eq_move',label:`Mover equipo “${before.name}”`,payload:{id:eid,spaceId:before.space_id}}};}));return true;}
 m=path.match(/^\/api\/org\/buildings\/(\d+)\/plan$/);
 if(m&&method==='POST'){const b=await readJson(req),ch=v.planChanges(b.changes);
  json(res,200,await mutate(cur,'building',m[1],b,async(c,_,bid)=>{const items=[];
   for(const x of ch){const [r]=await c.execute('SELECT e.essential,e.active,e.watts,e.hours,e.days,e.calculation_mode AS mode FROM equipment e JOIN spaces s ON s.id=e.space_id JOIN floors f ON f.id=s.floor_id WHERE e.id=? AND f.building_id=?',[x.equipmentId,bid]);
    if(!r[0])throw new HttpError(404,'El plan incluye un equipo que ya no existe en este edificio. Revisa el plan.');
    if(r[0].essential)throw new HttpError(400,'El plan modifica un equipo marcado como esencial.');if(!r[0].active)throw new HttpError(400,'El plan modifica un equipo pausado. Revisa el inventario.');if(r[0].mode!=='power')throw new HttpError(400,'El plan solo puede ajustar equipos con método de potencia y horario.');if([r[0].watts,r[0].hours,r[0].days].some(v=>v==null))throw new HttpError(400,'El plan incluye un equipo con datos incompletos.');
    const prev=await eqRow(c,x.equipmentId);items.push({id:x.equipmentId,hours:prev.hours,days:prev.days});await c.execute('UPDATE equipment SET hours=COALESCE(?,hours),days=COALESCE(?,days) WHERE id=?',[x.hours,x.days,x.equipmentId]);}
   return {undo:{op:'plan',label:`Plan aplicado (${ch.length} cambio${ch.length===1?'':'s'})`,payload:{items}}};}));return true;}


 m=path.match(/^\/api\/org\/spaces\/(\d+)\/(duplicate|move)$/);
 if(m&&method==='POST'){const b=await readJson(req),isMove=m[2]==='move';
  json(res,201,await mutate(cur,'space',m[1],b,async(c,sid,bid)=>{
   const [[sp]]=await c.execute('SELECT * FROM spaces WHERE id=?',[sid]);const tf=b.floorId==null?sp.floor_id:v.id(b.floorId);
   const [okf]=await c.execute('SELECT id FROM floors WHERE id=? AND building_id=?',[tf,bid]);if(!okf[0])throw new HttpError(404,'Piso de destino no encontrado en este edificio.');
   if(isMove&&tf===sp.floor_id)throw new HttpError(400,'El espacio ya está en ese piso.');
   if(isMove){const [mt]=await c.execute('SELECT m.id,m.name,(SELECT COUNT(*) FROM meter_readings r WHERE r.meter_id=m.id) AS n FROM meters m WHERE m.space_id=?',[sid]);
    if(mt.length&&b.keepMeters!==true)throw new HttpError(409,`Este espacio tiene ${mt.length} medidor(es) (${mt.map(x=>`${x.name}: ${x.n} lectura(s)`).join(', ')}). Moverlo no cambia sus lecturas: el medidor viaja con el espacio. Confirma explícitamente que quieres conservarlos con el espacio, o elimina el medidor antes.`,'METERS_CONFIRM');}
   // distribución de destino: si el piso tiene distribución guardada, el espacio necesita un hueco válido
   const [tsp]=await c.execute('SELECT id,name,plan_x,plan_y,plan_w,plan_d FROM spaces WHERE floor_id=? ORDER BY position,id',[tf]);
   const custom=tsp.length>0&&tsp.every(x=>x.plan_x!=null);let plan=null;
   const w=sp.plan_w??Layout.auto(1)[0].w,d=sp.plan_d??Layout.auto(1)[0].d;
   if(custom){const spot=Layout.place(tsp.map(x=>({x:x.plan_x,y:x.plan_y,w:x.plan_w,d:x.plan_d})),Math.min(w,Layout.W),Math.min(d,Layout.D));
    if(!spot)throw new HttpError(400,'No hay un hueco libre en la planta del piso de destino. Libera espacio o reduce el tamaño del espacio y vuelve a intentarlo.');plan={x:spot.x,y:spot.y,w:Math.min(w,Layout.W),d:Math.min(d,Layout.D)};}
   else if(sp.plan_x!=null&&!tsp.some(x=>x.plan_x!=null)){plan=null;}
   const slot=await freeSlot(c,tf),pos=await nextPos(c,'spaces','floor_id',tf);
   if(isMove){const prev={id:sid,floorId:sp.floor_id,position:sp.position,slot:sp.layout_slot,plan:sp.plan_x==null?null:{x:sp.plan_x,y:sp.plan_y,w:sp.plan_w,d:sp.plan_d}};
    await c.execute('UPDATE spaces SET floor_id=?,position=?,layout_slot=?,plan_x=?,plan_y=?,plan_w=?,plan_d=? WHERE id=?',[tf,pos,slot,plan?.x??null,plan?.y??null,plan?.w??null,plan?.d??null,sid]);
    return {undo:{op:'space_move',label:`Mover espacio “${sp.name}” a otro piso (con su inventario)`,payload:prev}};}
   const [ns]=await c.execute('INSERT INTO spaces (floor_id,name,kind,position,layout_slot,plan_x,plan_y,plan_w,plan_d,workstations,occupied_ws,desk_mode,area_m2) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',[tf,(sp.name+' (copia)').slice(0,80),sp.kind,pos,slot,plan?.x??null,plan?.y??null,plan?.w??null,plan?.d??null,sp.workstations,sp.occupied_ws,sp.desk_mode,sp.area_m2]);
   if(b.withInventory===true)await c.execute('INSERT INTO equipment (space_id,name,category,calculation_mode,quantity,watts,hours,days,factor,monthly_kwh,active,essential,product_reference,visual_placement) SELECT ?,name,category,calculation_mode,quantity,watts,hours,days,factor,monthly_kwh,active,essential,product_reference,visual_placement FROM equipment WHERE space_id=?',[ns.insertId,sid]);
   return {undo:{op:'space_dup',label:`Duplicar espacio “${sp.name}”`,payload:{id:ns.insertId}}};}));return true;}
 // --- Deshacer, distribución, medidores y servicios comunes
 m=path.match(/^\/api\/org\/buildings\/(\d+)\/undo$/);
 if(m&&method==='POST'){const b=await readJson(req);
  json(res,200,await mutate(cur,'building',m[1],b,async(c,_,bid)=>{const [[u]]=await c.execute('SELECT id,op,label,payload,after_revision FROM undo_log WHERE building_id=? AND undone=FALSE ORDER BY id DESC LIMIT 1',[bid]);
   if(!u||Number(u.after_revision)!==Number(b.revision))throw new HttpError(409,'Hay cambios posteriores o no hay nada que deshacer. Para no sobrescribir trabajo ajeno, solo se puede deshacer la última operación cuando nadie más ha cambiado el edificio.','UNDO_UNAVAILABLE');
   await runUndo(c,bid,u);await c.execute('UPDATE undo_log SET undone=TRUE WHERE id=?',[u.id]);}));return true;}

 m=path.match(/^\/api\/org\/floors\/(\d+)\/configure$/);
 if(m&&method==='POST'){const b=await readJson(req);
  json(res,200,await mutate(cur,'floor',m[1],b,async(c,fid)=>{
   const [sp]=await c.execute('SELECT id,name,kind,position,plan_x,plan_y,plan_w,plan_d,dims_declared FROM spaces WHERE floor_id=? ORDER BY position,id',[fid]);
   const [[fl]]=await c.execute('SELECT layout_config FROM floors WHERE id=?',[fid]);
   const P=v.configure(b,sp,Layout);
   // el servidor genera la planta con los mismos parámetros: no se confía en la vista previa del navegador
   const gen=Layout.generate(P.items.map(i=>({ref:i.ref,kind:i.kind,size:i.size,dims:i.dims})),{variant:P.variant,corridor:P.corridor});
   if(!gen.ok)throw new HttpError(400,gen.error);
   {const [cur0]=await c.execute('SELECT id,workstations,desk_mode FROM spaces WHERE floor_id=?',[fid]);const cm=new Map(cur0.map(x=>[x.id,x]));const wsList=P.items.map(i=>{const r=gen.rects.find(x=>x.ref===i.ref);const old=i.id?cm.get(i.id):null;const w='workstations' in i?i.workstations:old?.workstations,mo='deskMode' in i?i.deskMode:old?.desk_mode;return {name:i.name,workstations:w,deskMode:mo||'open',rect:{x:r.x,y:r.y,w:r.w,d:r.d}};}).filter(x=>x.workstations);const pr=v.wsProblem(wsList,Layout,gen.corridor);if(pr)throw new HttpError(400,pr);}
   const before=sp.map(s=>({id:s.id,name:s.name,kind:s.kind,position:s.position,plan:s.plan_x==null?null:{x:s.plan_x,y:s.plan_y,w:s.plan_w,d:s.plan_d},declared:Boolean(s.dims_declared)}));
   const created=[];
   for(const [pos,it] of P.items.entries()){const r=gen.rects.find(x=>x.ref===it.ref);
    if(it.id){await c.execute('UPDATE spaces SET name=?,kind=?,position=?,plan_x=?,plan_y=?,plan_w=?,plan_d=?,dims_declared=? WHERE id=?',[it.name,it.kind,pos,r.x,r.y,r.w,r.d,r.declared,it.id]);if('workstations' in it)await c.execute('UPDATE spaces SET workstations=?,desk_mode=? WHERE id=?',[it.workstations,it.workstations?(it.deskMode||'open'):null,it.id]);}
    else{const [ins]=await c.execute('INSERT INTO spaces (floor_id,name,kind,position,layout_slot,plan_x,plan_y,plan_w,plan_d,dims_declared) VALUES (?,?,?,?,NULL,?,?,?,?,?)',[fid,it.name,it.kind,pos,r.x,r.y,r.w,r.d,r.declared]);created.push(ins.insertId);if(it.workstations)await c.execute('UPDATE spaces SET workstations=?,desk_mode=? WHERE id=?',[it.workstations,it.deskMode||'open',ins.insertId]);}}
   const cfg={v:Layout.GEN_VERSION,variant:P.variant,corridor:Boolean(gen.corridor),corridorRect:gen.corridor,decor:P.decor};
   await c.execute('UPDATE floors SET layout_config=? WHERE id=?',[JSON.stringify(cfg),fid]);
   const prev=fl.layout_config==null?null:(typeof fl.layout_config==='string'?JSON.parse(fl.layout_config):fl.layout_config);
   return {undo:{op:'configure',label:`Configurar espacios del piso (${created.length} nuevo${created.length===1?'':'s'}, ${before.length} conservado${before.length===1?'':'s'})`,payload:{created,before,config:prev,floorId:fid}}};}));return true;}
 m=path.match(/^\/api\/org\/floors\/(\d+)\/layout$/);
 if(m&&method==='PATCH'){const b=await readJson(req);
  json(res,200,await mutate(cur,'floor',m[1],b,async(c,fid)=>{const [sp]=await c.execute('SELECT id,name,plan_x,plan_y,plan_w,plan_d FROM spaces WHERE floor_id=? ORDER BY position,id',[fid]);
   const before=sp.map(s=>({id:s.id,x:s.plan_x,y:s.plan_y,w:s.plan_w,d:s.plan_d}));const L=v.layout(b,sp,Layout);
   if(!L.reset){const [wsr]=await c.execute('SELECT id,workstations,desk_mode FROM spaces WHERE floor_id=? AND workstations>0',[fid]);if(wsr.length){const fr=await floorRects(c,fid);const rc=new Map(L.rects.map(r=>[r.id,r]));const pr=v.wsProblem(fr.spaces.filter(x=>x.workstations).map(x=>({...x,rect:{x:rc.get(x.id).x,y:rc.get(x.id).y,w:rc.get(x.id).w,d:rc.get(x.id).d}})),Layout,fr.corridor);if(pr)throw new HttpError(400,'Con esa distribución '+pr.charAt(0).toLowerCase()+pr.slice(1));}}
   for(const [i,s] of sp.entries()){const r=L.reset?null:L.rects[i];await c.execute('UPDATE spaces SET plan_x=?,plan_y=?,plan_w=?,plan_d=? WHERE id=?',[r?.x??null,r?.y??null,r?.w??null,r?.d??null,s.id]);}
   if(L.reset)await c.execute('UPDATE floors SET layout_config=NULL WHERE id=?',[fid]);
   return {undo:{op:'layout',label:L.reset?'Restablecer distribución del piso':'Cambio de distribución del piso',payload:{spaces:before}}};}));return true;}
 m=path.match(/^\/api\/org\/buildings\/(\d+)\/(meters|common)$/);
 if(m&&method==='POST'){const b=await readJson(req);
  if(m[2]==='common'){const e=v.common(b);json(res,201,await mutate(cur,'building',m[1],b,(c,id)=>c.execute('INSERT INTO common_loads (building_id,name,category,calculation_mode,quantity,watts,hours,days,factor,monthly_kwh,active) VALUES (?,?,?,?,?,?,?,?,?,?,?)',[id,e.name,e.category,e.mode,e.quantity,e.watts,e.hours,e.days,e.factor,e.monthlyKwh,e.active])));return true;}
  json(res,201,await mutate(cur,'building',m[1],b,async(c,bid)=>{
   const [fl]=await c.execute('SELECT id FROM floors WHERE building_id=?',[bid]),[sp]=await c.execute('SELECT s.id FROM spaces s JOIN floors f ON f.id=s.floor_id WHERE f.building_id=?',[bid]),[pm]=await c.execute("SELECT id FROM meters WHERE building_id=? AND kind='general'",[bid]);
   const o=v.meter(b,{floorOk:x=>fl.some(r=>r.id===x),spaceOk:x=>sp.some(r=>r.id===x),parent:x=>pm.some(r=>r.id===x)});
   await c.execute('INSERT INTO meters (building_id,name,kind,scope,floor_id,space_id,parent_id) VALUES (?,?,?,?,?,?,?)',[bid,o.name,o.kind,o.scope,o.floorId,o.spaceId,o.parentId]);}));return true;}
 m=path.match(/^\/api\/org\/meters\/(\d+)\/readings$/);
 if(m&&method==='POST'){const b=await readJson(req),r=v.meterReading(b);
  json(res,201,await mutate(cur,'meter',m[1],b,async(c,mid)=>{
   const [prev]=await c.execute('SELECT value FROM meter_readings WHERE meter_id=? AND reading_date<? ORDER BY reading_date DESC LIMIT 1',[mid,r.date]),[next]=await c.execute('SELECT value FROM meter_readings WHERE meter_id=? AND reading_date>? ORDER BY reading_date ASC LIMIT 1',[mid,r.date]);
   if(prev[0]&&r.value<prev[0].value)throw new HttpError(400,`La lectura no puede ser menor que la anterior de este medidor (${prev[0].value} kWh).`);
   if(next[0]&&r.value>next[0].value)throw new HttpError(400,`La lectura no puede ser mayor que la siguiente de este medidor (${next[0].value} kWh).`);
   try{await c.execute('INSERT INTO meter_readings (meter_id,reading_date,value) VALUES (?,?,?)',[mid,r.date,r.value]);}catch(e){if(e.code==='ER_DUP_ENTRY')throw new HttpError(400,'Ese medidor ya tiene una lectura en esa fecha.');throw e;}}));return true;}
 m=path.match(/^\/api\/org\/(meters|mreadings|common)\/(\d+)$/);
 if(m&&method==='DELETE'){const b=await readJson(req),k={meters:'meter',mreadings:'mreading',common:'common'}[m[1]],tbl={meters:'meters',mreadings:'meter_readings',common:'common_loads'}[m[1]];
  json(res,200,await mutate(cur,k,m[2],b,(c,id)=>c.execute(`DELETE FROM ${tbl} WHERE id=?`,[id])));return true;}
 if(m&&m[1]==='common'&&method==='PATCH'){const b=await readJson(req),e=v.common(b);
  json(res,200,await mutate(cur,'common',m[2],b,(c,id)=>c.execute('UPDATE common_loads SET name=?,category=?,calculation_mode=?,quantity=?,watts=?,hours=?,days=?,factor=?,monthly_kwh=?,active=? WHERE id=?',[e.name,e.category,e.mode,e.quantity,e.watts,e.hours,e.days,e.factor,e.monthlyKwh,e.active,id])));return true;}
 m=path.match(/^\/api\/org\/buildings\/(\d+)\/(floors|records)$/);
 if(m&&method==='POST'){const b=await readJson(req);
  if(m[2]==='floors'){const name=v.text(b.name,'el nombre del piso');let draft;try{draft=FloorDraft.prepare(b);}catch(e){throw new HttpError(400,e.message);}json(res,201,await mutate(cur,'building',m[1],b,async(c,id)=>{const [[count]]=await c.execute('SELECT COUNT(*) AS n FROM floors WHERE building_id=?',[id]);if(count.n>=200)throw new HttpError(400,'El edificio admite hasta 200 pisos.');const [floor]=await c.execute('INSERT INTO floors (building_id,name,position,layout_config) VALUES (?,?,?,?)',[id,name,await nextPos(c,'floors','building_id',id),draft.config?JSON.stringify(draft.config):null]);for(const [index,item]of draft.items.entries()){const r=draft.rects.find(r=>r.ref===item.ref);await c.execute('INSERT INTO spaces (floor_id,name,kind,position,layout_slot,plan_x,plan_y,plan_w,plan_d) VALUES (?,?,?,?,?,?,?,?,?)',[floor.insertId,item.name,item.kind,index,null,r.x,r.y,r.w,r.d]);}}));}
  else{const r=v.record(b);json(res,201,await mutate(cur,'building',m[1],b,async(c,id)=>{const [ov]=await c.execute('SELECT COUNT(*) AS n FROM consumption_records WHERE building_id=? AND period_start<=? AND period_end>=?',[id,r.end,r.start]);if(ov[0].n>0)throw new HttpError(400,'Ese periodo se solapa con otro registro de este edificio. Ajusta las fechas.');const [ins]=await c.execute('INSERT INTO consumption_records (building_id,period_start,period_end,kwh,origin) VALUES (?,?,?,?,?)',[id,r.start,r.end,r.kwh,r.origin]);return {undo:{op:'rec_create',label:`Agregar registro de consumo (${r.start} a ${r.end})`,payload:{id:ins.insertId}}};}));}
  return true;}
 m=path.match(/^\/api\/org\/floors\/(\d+)(?:\/(spaces))?$/);
 if(m&&m[2]&&method==='POST'){const b=await readJson(req),s=v.space(b);json(res,201,await mutate(cur,'floor',m[1],b,async(c,id)=>{{const slot=await freeSlot(c,id);await c.execute('INSERT INTO spaces (floor_id,name,kind,position,layout_slot) VALUES (?,?,?,?,?)',[id,s.name,s.kind,await nextPos(c,'spaces','floor_id',id),slot]);}}));return true;}
 if(m&&!m[2]&&method==='PATCH'){const b=await readJson(req),name=v.text(b.name,'el nombre del piso');json(res,200,await mutate(cur,'floor',m[1],b,async(c,id)=>{await c.execute('UPDATE floors SET name=? WHERE id=?',[name,id]);}));return true;}
 if(m&&!m[2]&&method==='DELETE'){const b=await readJson(req);json(res,200,await mutate(cur,'floor',m[1],b,async(c,id,bid)=>{const [[fr]]=await c.execute('SELECT name FROM floors WHERE id=?',[id]);const snap=await snapshot(c,bid,{floorId:id});await c.execute('DELETE FROM floors WHERE id=?',[id]);return snap?{undo:{op:'floor_delete',label:`Eliminar piso “${fr.name}” con sus espacios, equipos y medidores`,payload:snap}}:undefined;}));return true;}
 m=path.match(/^\/api\/org\/spaces\/(\d+)(?:\/(equipment))?$/);
 if(m&&m[2]&&method==='POST'){const b=await readJson(req),e=v.equipment(b);json(res,201,await mutate(cur,'space',m[1],b,async(c,id)=>{const [r]=await insertEquipment(c,id,e);return {undo:{op:'eq_create',label:`Agregar equipo “${e.name}”`,payload:{id:r.insertId}}};}));return true;}
 if(m&&!m[2]&&method==='PATCH'){const b=await readJson(req),s=v.space(b),d=v.spaceDetails(b);
  json(res,200,await mutate(cur,'space',m[1],b,async(c,id)=>{
   const [[b0]]=await c.execute('SELECT floor_id,name,kind,workstations,occupied_ws,desk_mode,area_m2 FROM spaces WHERE id=?',[id]);
   const ws='workstations' in d?d.workstations:b0.workstations,occ='occupied' in d?d.occupied:b0.occupied_ws,area='areaM2' in d?d.areaM2:b0.area_m2;
   let mode='deskMode' in d?d.deskMode:b0.desk_mode;if(ws&&!mode)mode='open';if(!ws)mode=ws===0||ws==null?null:mode;
   if(occ!=null&&(ws==null||occ>ws))throw new HttpError(400,'Los puestos ocupados no pueden superar el total de puestos.');
   if(ws){const fr=await floorRects(c,b0.floor_id),me=fr.spaces.find(x=>x.id===id);const pr=v.wsProblem([{...me,workstations:ws,deskMode:mode}],Layout,fr.corridor);if(pr)throw new HttpError(400,pr);}
   await c.execute('UPDATE spaces SET name=?,kind=?,workstations=?,occupied_ws=?,desk_mode=?,area_m2=? WHERE id=?',[s.name,s.kind,ws,occ,mode,area,id]);
   return {undo:{op:'space_edit',label:`Editar espacio “${b0.name}”`,payload:{id,name:b0.name,kind:b0.kind,workstations:b0.workstations,occupied:b0.occupied_ws,deskMode:b0.desk_mode,areaM2:b0.area_m2}}};}));return true;}
 if(m&&!m[2]&&method==='DELETE'){const b=await readJson(req);json(res,200,await mutate(cur,'space',m[1],b,async(c,id,bid)=>{const [[sr]]=await c.execute('SELECT name FROM spaces WHERE id=?',[id]);const snap=await snapshot(c,bid,{spaceId:id});await c.execute('DELETE FROM spaces WHERE id=?',[id]);return snap?{undo:{op:'space_delete',label:`Eliminar espacio “${sr.name}” con su inventario y medidores`,payload:snap}}:undefined;}));return true;}
 m=path.match(/^\/api\/org\/equipment\/(\d+)\/position$/);
 if(m&&method==='PATCH'){const body=await readJson(req),position=v.placement(body.placement);json(res,200,await mutate(cur,'equipment',m[1],body,async(c,id)=>{const previous=await eqRow(c,id);await c.execute('UPDATE equipment SET visual_placement=? WHERE id=?',[position?JSON.stringify(position):null,id]);return {undo:{op:'eq_position',label:`Colocar equipo “${previous.name}”`,payload:{id,before:previous.visual_placement||null}}};}));return true;}
 m=path.match(/^\/api\/org\/(equipment|records)\/(\d+)$/);
 if(m&&m[1]==='equipment'&&method==='PATCH'){const b=await readJson(req),e=v.equipment(b);json(res,200,await mutate(cur,'equipment',m[2],b,async(c,id)=>{const before=await eqRow(c,id);await c.execute('UPDATE equipment SET name=?,category=?,calculation_mode=?,quantity=?,watts=?,hours=?,days=?,factor=?,monthly_kwh=?,active=?,essential=?,product_reference=? WHERE id=?',[e.name,e.category,e.mode,e.quantity,e.watts,e.hours,e.days,e.factor,e.monthlyKwh,e.active,e.essential,e.productReference?JSON.stringify(e.productReference):null,id]);return {undo:{op:'eq_update',label:`Edición de equipo “${before.name}”`,payload:{row:before}}};}));return true;}
 if(m&&method==='DELETE'){const b=await readJson(req),t=m[1]==='equipment'?'equipment':'record';json(res,200,await mutate(cur,t,m[2],b,async(c,id)=>{let before=null,rec=null;if(t==='equipment')before=await eqRow(c,id);else{const [rr]=await c.execute('SELECT * FROM consumption_records WHERE id=?',[id]);rec=rr[0];}await c.execute(`DELETE FROM ${t==='record'?'consumption_records':'equipment'} WHERE id=?`,[id]);if(before)return {undo:{op:'eq_delete',label:`Quitar equipo “${before.name}”`,payload:{row:before}}};if(rec)return {undo:{op:'rec_delete',label:`Eliminar registro de consumo (${rec.period_start} a ${rec.period_end})`,payload:{row:rec}}};}));return true;}
 throw new HttpError(405,'Método no permitido para esta ruta.');
}
