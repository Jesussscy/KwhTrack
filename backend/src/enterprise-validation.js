import {validateEnergy} from './enterprise-energy.js';
import {HttpError} from './errors.js';
const bad=m=>{throw new HttpError(400,m);};
function calendarDate(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const n=Date.parse(value+'T00:00:00Z');return Number.isFinite(n)&&new Date(n).toISOString().slice(0,10)===value;}
export function text(v,label,{max=80,required=true}={}){
 if(v==null||v===''){if(required)bad(`Indica ${label}.`);return null;}
 if(typeof v!=='string')bad(`${label} no es válido.`);
 const t=v.trim();if(!t&&required)bad(`Indica ${label}.`);if(t.length>max)bad(`${label} admite hasta ${max} caracteres.`);return t||null;
}
export function id(v){const n=Number(v);if(!Number.isSafeInteger(n)||n<1)throw new HttpError(400,'Identificador inválido.');return n;}
export function rev(v){if(!Number.isSafeInteger(v)||v<0)throw new HttpError(400,'Indica la revisión que estás editando.');return v;}
function num(v,label,min,max,{int=false,nullable=false}={}){
 if(v==null||v===''){if(nullable)return null;bad(`Indica ${label}.`);}
 if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)bad(`${label} debe ser un número entre ${min} y ${max}.`);
 if(int&&!Number.isInteger(v))bad(`${label} debe ser un entero.`);return v;
}
export function credentialsOrg(body,{register}){
 if(typeof body.email!=='string'||body.email.length>190||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))bad('Introduce un correo válido.');
 if(typeof body.password!=='string'||body.password.length<12||body.password.length>128)bad('La contraseña debe tener entre 12 y 128 caracteres.');
 const r={email:body.email.trim().toLowerCase(),password:body.password};
 if(register){r.name=text(body.name,'tu nombre');r.organization=text(body.organization,'el nombre de la empresa',{max:120});}
 return r;
}
export function space(b){return {name:text(b.name,'el nombre del espacio'),kind:text(b.kind??'Otro','el tipo',{max:40})};}
export function productReference(p){
 if(p==null)return null;if(!p||typeof p!=='object'||Array.isArray(p))bad('Referencia de producto inválida.');
 const out={};for(const key of ['id','brand','model','note','marketUrl','technicalUrl']){const value=p[key]??'';if(typeof value!=='string'||value.length>(key.endsWith('Url')?1200:300))bad('Referencia de producto demasiado larga.');if(key.endsWith('Url')&&value){let u;try{u=new URL(value);}catch{bad('Enlace de referencia inválido.');}if(u.protocol!=='https:')bad('La referencia necesita un enlace HTTPS.');}out[key]=value;}
 return out;
}
export function placement(p){if(p==null)return null;if(!p||typeof p!=='object'||Array.isArray(p))bad('Posición visual inválida.');return {u:num(p.u,'Posición horizontal',0,1),v:num(p.v,'Posición vertical del plano',0,1)};}
export function equipment(b){
 const mode=b.mode??'power';if(!['power','monthly'].includes(mode))bad('Método de cálculo inválido.');
 const r={placement:placement(b.placement),productReference:productReference(b.productReference),name:text(b.name,'el nombre del equipo'),category:text(b.category??'Otro','la categoría',{max:50}),mode,quantity:num(b.quantity,'La cantidad',1,1000,{int:true}),watts:null,hours:null,days:null,factor:1,monthlyKwh:null,active:b.active!==false,essential:b.essential===true};
 if(mode==='monthly')r.monthlyKwh=num(b.monthlyKwh,'El consumo mensual (kWh)',0,1000000,{nullable:true});
 else{r.watts=num(b.watts,'La potencia (W)',1,1000000,{nullable:true});r.hours=num(b.hours,'Las horas por día',0,24,{nullable:true});r.days=num(b.days,'Los días al mes',0,31,{int:true,nullable:true});r.factor=b.factor==null?1:num(b.factor,'El factor de uso',0,1);}
 return r;
}
export function record(b){
 if(!calendarDate(b.start)||!calendarDate(b.end)||b.end<b.start)bad('Indica un periodo válido (AAAA-MM-DD; el fin no puede ser anterior al inicio).');
 if(!['measured','bill','imported'].includes(b.origin))bad('Indica el origen del dato.');
 return {start:b.start,end:b.end,kwh:num(b.kwh,'El consumo (kWh)',0,100000000),origin:b.origin};
}
export function budget(b){
 const tariff=b.tariffRate==null||b.tariffRate===''?null:num(b.tariffRate,'La tarifa (COP/kWh)',1,100000);
 const date=tariff==null||!b.tariffDate?null:(calendarDate(b.tariffDate)?b.tariffDate:bad('La fecha de la tarifa no es válida.'));
 return {monthlyBudget:b.monthlyBudget==null||b.monthlyBudget===''?null:num(b.monthlyBudget,'El presupuesto mensual (COP)',0,1e12),tariffRate:tariff,tariffSource:tariff==null?null:text(b.tariffSource,'la fuente de la tarifa',{max:200}),tariffDate:date};
}
export function planChanges(list){
 if(!Array.isArray(list)||!list.length||list.length>500)bad('Indica entre 1 y 500 cambios.');
 const seen=new Set();
 return list.map(c=>{const eid=id(c?.equipmentId);if(seen.has(eid))bad('Un equipo aparece dos veces en el plan.');seen.add(eid);
  const o={equipmentId:eid,hours:c.hours==null?null:num(c.hours,'Las horas por día',0,24),days:c.days==null?null:num(c.days,'Los días al mes',0,31,{int:true})};
  if(o.hours==null&&o.days==null)bad('Cada cambio debe modificar horas o días.');return o;});
}
export function meter(b,{floorOk,spaceOk,parent}){
 const kind=b.kind==='sub'?'sub':'general',scope=['building','floor','space'].includes(b.scope)?b.scope:bad('Indica el alcance del medidor.');
 const o={name:text(b.name,'el nombre del medidor'),kind,scope,floorId:null,spaceId:null,parentId:null};
 if(scope==='floor'){o.floorId=id(b.floorId);if(!floorOk(o.floorId))bad('El piso no pertenece a este edificio.');}
 if(scope==='space'){o.spaceId=id(b.spaceId);if(!spaceOk(o.spaceId))bad('El espacio no pertenece a este edificio.');}
 if(kind==='sub'){if(b.parentId==null)bad('Un submedidor debe indicar su medidor general.');o.parentId=id(b.parentId);if(!parent(o.parentId))bad('El medidor general no existe en este edificio.');}
 else if(scope!=='building')bad('Un medidor general debe ser de alcance edificio; usa submedidor para pisos o espacios.');
 return o;
}
export function meterReading(b){
 if(!calendarDate(b.date))bad('Indica una fecha válida (AAAA-MM-DD).');
 if(Date.parse(b.date)>Date.now()+864e5)bad('La fecha de la lectura no puede ser futura.');
 return {date:b.date,value:num(b.value,'La lectura (kWh acumulados)',0,1e12)};
}
export function common(b){const e=equipment(b);return {name:e.name,category:e.category,mode:e.mode,quantity:e.quantity,watts:e.watts,hours:e.hours,days:e.days,factor:e.factor,monthlyKwh:e.monthlyKwh,active:e.active};}
export function layout(b,floorSpaces,Layout){
 if(b.reset===true)return {reset:true,rects:null};
 if(!Array.isArray(b.spaces)||!b.spaces.length||b.spaces.length>40)bad('Indica la distribución de los espacios del piso.');
 const byId=new Map(floorSpaces.map(s=>[s.id,s]));const given=new Map();
 for(const r of b.spaces){const sid=id(r?.id);if(!byId.has(sid))bad('Un espacio no pertenece a este piso.');
  for(const k of ['x','y','w','d'])if(typeof r[k]!=='number'||!Number.isFinite(r[k]))bad('Posición y tamaño deben ser números finitos.');
  given.set(sid,{id:sid,name:byId.get(sid).name,x:Layout.round(r.x),y:Layout.round(r.y),w:Layout.round(r.w),d:Layout.round(r.d)});}
 const auto=Layout.auto(floorSpaces.length),rects=floorSpaces.map((s,i)=>given.get(s.id)||(s.plan_x!=null?{id:s.id,name:s.name,x:s.plan_x,y:s.plan_y,w:s.plan_w,d:s.plan_d}:{id:s.id,name:s.name,...auto[i]}));
 const errs=Layout.validate(rects);if(errs.length)bad(errs.slice(0,3).join(' '));
 return {reset:false,rects};
}

/** Valida una copia (versión 1 a 5) y devuelve un plan de importación con referencias locales + resumen. No escribe nada. */
export function parseBackup(d,Layout){
 if(!d||d.product!=='kwhtrack-empresas'||![1,2,3,4,5].includes(d.version)||!Array.isArray(d.buildings))bad('El archivo no es una copia válida de kwhTrack Empresas (versión 1 a 5).');
 if(d.buildings.length>20)bad('La copia supera 20 edificios.');
 const counts={buildings:0,floors:0,spaces:0,equipment:0,common:0,meters:0,readings:0,records:0,layouts:0},warnings=[];
 const buildings=d.buildings.map((b,bi)=>{
  counts.buildings++;const label=`Edificio ${bi+1}`;
  const out={name:text(b?.name,'el nombre del edificio',{max:100}),city:text(b?.city,'la ciudad',{max:80,required:false}),isDemo:b?.isDemo===true,budget:b?.budget&&(b.budget.tariffRate!=null||b.budget.monthlyBudget!=null)?budget(b.budget):null,floors:[],common:[],meters:[],records:[]};
  const spaceRefs=new Map(),floorRefs=new Map();
  for(const f of (Array.isArray(b.floors)?b.floors:[])){
   counts.floors++;const fl={ref:f.ref??null,name:text(f?.name,'el nombre del piso'),config:sanitizeConfig(f?.layoutConfig),spaces:[]};
   for(const sp of (Array.isArray(f.spaces)?f.spaces:[])){counts.spaces++;const s=space(sp);const slot=Number.isInteger(sp.slot)&&sp.slot>=0&&sp.slot<4?sp.slot:null;
    const plan=sp.plan&&[sp.plan.x,sp.plan.y,sp.plan.w,sp.plan.d].every(n=>typeof n==='number'&&Number.isFinite(n))?{x:sp.plan.x,y:sp.plan.y,w:sp.plan.w,d:sp.plan.d}:null;
    const sx={...s,slot,plan,dimsDeclared:sp.dimsDeclared===true,workstations:null,occupied:null,deskMode:null,areaM2:null,...spaceDetails({workstations:sp.workstations,occupied:sp.occupied,deskMode:sp.deskMode,areaM2:sp.areaM2}),ref:sp.ref??null,equipment:(Array.isArray(sp.equipment)?sp.equipment:[]).map(e=>{counts.equipment++;return equipment(e);})};fl.spaces.push(sx);if(sx.ref)spaceRefs.set(sx.ref,sx);}
   if(fl.spaces.length&&fl.spaces.every(x=>x.plan)){const errs=Layout.validate(fl.spaces.map(x=>({id:x.name,name:x.name,...x.plan})));if(errs.length)bad(`${label}, piso “${fl.name}”: distribución inválida. ${errs[0]}`);counts.layouts++;}
   else if(fl.spaces.some(x=>x.plan)){fl.spaces.forEach(x=>{x.plan=null;});warnings.push(`${label}, piso “${fl.name}”: distribución incompleta; se usará la automática.`);}
   {const auto=Layout.auto(fl.spaces.length),allPlan=fl.spaces.length&&fl.spaces.every(x=>x.plan);const wp=wsProblem(fl.spaces.map((x,i)=>({name:x.name,workstations:x.workstations,deskMode:x.deskMode,rect:allPlan?x.plan:auto[i]})),Layout,fl.config&&fl.config.corridorRect);if(wp)bad(`${label}, piso “${fl.name}”: ${wp}`);for(const x of fl.spaces){if(x.occupied!=null&&(x.workstations==null||x.occupied>x.workstations))bad(`${label}: ${x.name} tiene más puestos ocupados que puestos.`);}}
   if(fl.ref)floorRefs.set(fl.ref,fl);out.floors.push(fl);}
  for(const c of (Array.isArray(b.common)?b.common:[]).slice(0,200)){counts.common++;out.common.push(common(c));}
  const metersIn=Array.isArray(b.meters)?b.meters:[];if(metersIn.length>100)bad(`${label}: demasiados medidores (máximo 100).`);
  const mrefs=new Set();
  for(const m of metersIn){counts.meters++;if(!m.ref||mrefs.has(m.ref))bad(`${label}: cada medidor necesita una referencia única.`);mrefs.add(m.ref);
   const kind=m.kind==='sub'?'sub':'general',scope=['building','floor','space'].includes(m.scope)?m.scope:bad(`${label}: alcance de medidor inválido.`);
   if(scope==='floor'&&!floorRefs.has(m.floorRef))bad(`${label}: el medidor “${m.name}” apunta a un piso que no existe en la copia.`);
   if(scope==='space'&&!spaceRefs.has(m.spaceRef))bad(`${label}: el medidor “${m.name}” apunta a un espacio que no existe en la copia.`);
   if(kind==='general'&&scope!=='building')bad(`${label}: un medidor general debe ser de alcance edificio.`);
   const rs=(Array.isArray(m.readings)?m.readings:[]);if(rs.length>2000)bad(`${label}: demasiadas lecturas en “${m.name}”.`);
   const readings=rs.map(r=>meterReading(r)).sort((a,b)=>a.date<b.date?-1:1);
   for(let i=1;i<readings.length;i++){if(readings[i].date===readings[i-1].date)bad(`${label}: “${m.name}” tiene dos lecturas el mismo día.`);if(readings[i].value<readings[i-1].value)bad(`${label}: “${m.name}” tiene lecturas decrecientes (${readings[i-1].date} → ${readings[i].date}).`);}
   counts.readings+=readings.length;out.meters.push({ref:m.ref,name:text(m.name,'el nombre del medidor'),kind,scope,floorRef:m.floorRef??null,spaceRef:m.spaceRef??null,parentRef:m.parentRef??null,readings});}
  for(const m of out.meters){if(m.kind==='sub'){const par=out.meters.find(x=>x.ref===m.parentRef);if(!par||par.kind!=='general')bad(`${label}: el submedidor “${m.name}” necesita un medidor general válido en la copia.`);}}
  out.records=(Array.isArray(b.records)?b.records:[]).slice(0,60).map(x=>{counts.records++;return record(x);});
  const recs=[...out.records].sort((a,b)=>a.start<b.start?-1:1);for(let i=1;i<recs.length;i++)if(recs[i].start<=recs[i-1].end)bad(`${label}: hay registros de consumo con periodos solapados.`);
  if(b.energy){out.energy=validateEnergy({...b.energy,observations:[],rules:[]},[...floorRefs.keys()]);if(out.energy.noOwnSpaces.some(ref=>!spaceRefs.has(ref)))bad(`${label}: una declaración apunta a un espacio que no existe.`);if(out.energy.solar?.production)out.energy.solar.production.source=('Copia importada · '+out.energy.solar.production.source).slice(0,120);warnings.push(`${label}: sensores y reglas no se importan; vincula de nuevo los dispositivos en el edificio nuevo.`);}
  return out;});
 if(counts.floors>1000||counts.spaces>4000||counts.equipment>10000)bad('La copia supera los límites de importación.');
 if(d.version===1)warnings.push('Copia versión 1: no incluye distribución, medidores, lecturas ni servicios comunes.');
 return {buildings,counts,warnings,version:d.version};
}

const SIZES=['compact','standard','wide'];
export function sanitizeConfig(c){
 if(!c||typeof c!=='object')return null;
 const o={v:Number.isInteger(c.v)?c.v:1,variant:[0,1,2].includes(c.variant)?c.variant:0,corridor:c.corridor!==false,decor:c.decor!==false};
 const r=c.corridorRect;o.corridorRect=r&&[r.x,r.y,r.w,r.d].every(n=>typeof n==='number'&&Number.isFinite(n))&&r.w>0&&r.d>0&&r.x>=0&&r.y>=0&&r.x+r.w<=17.001&&r.y+r.d<=13.001?{x:r.x,y:r.y,w:r.w,d:r.d}:null;
 return o;
}
/** Parámetros del asistente de configuración de un piso. Conserva TODOS los espacios existentes (no elimina nada). */
export function configure(b,floorSpaces,Layout){
 if(!Array.isArray(b.items)||!b.items.length||b.items.length>24)bad('Indica entre 1 y 24 espacios.');
 const exist=new Map(floorSpaces.map(s=>[s.id,s])),seen=new Set();
 const items=b.items.map((it,i)=>{
  const o={id:null,name:text(it?.name,'el nombre del espacio'),kind:text(it?.kind??'Otro','el tipo',{max:40}),size:SIZES.includes(it?.size)?it.size:'standard',dims:null};
  if(it?.id!=null){o.id=id(it.id);if(!exist.has(o.id))bad('Un espacio no pertenece a este piso.');if(seen.has(o.id))bad('Un espacio aparece dos veces.');seen.add(o.id);}
  if(it?.dims!=null){const w=num(it.dims.w,'El ancho (m)',Layout.MIN,Layout.W),d=num(it.dims.d,'El fondo (m)',Layout.MIN,Layout.D);o.dims={w,d};}
  if(it&&('workstations' in it||'deskMode' in it||'areaM2' in it||'occupied' in it)){Object.assign(o,spaceDetails(it));}
  o.ref=o.id?'e'+o.id:'n'+i;return o;});
 for(const s of floorSpaces)if(!seen.has(s.id))bad('El asistente no elimina espacios: incluye todos los espacios existentes del piso (elimínalos desde su panel, con opción de deshacer).');
 return {items,variant:[0,1,2].includes(b.variant)?b.variant:0,corridor:b.corridor!==false,decor:b.decor!==false};
}

/** Detalles de oficina compartida. Un campo ausente (undefined) no cambia; null lo borra. */
export function spaceDetails(b){
 const o={};
 if('workstations' in b){o.workstations=b.workstations==null||b.workstations===''?null:num(b.workstations,'Los puestos',0,200,{int:true});}
 if('occupied' in b){o.occupied=b.occupied==null||b.occupied===''?null:num(b.occupied,'Los puestos ocupados',0,200,{int:true});}
 if('deskMode' in b){o.deskMode=b.deskMode==null?null:(['open','cubicle'].includes(b.deskMode)?b.deskMode:bad('La disposición debe ser abierta o en cubículos.'));}
 if('areaM2' in b){o.areaM2=b.areaM2==null||b.areaM2===''?null:num(b.areaM2,'La superficie real (m²)',1,5000);}
 return o;
}
/** Revisa que los puestos de cada espacio quepan en su rectángulo; devuelve el primer problema legible o null. */
export function wsProblem(list,Layout,corridor){
 for(const sp of list){if(!sp.workstations)continue;const r=Layout.workstations(sp.rect,sp.workstations,sp.deskMode||'open',Layout.doorSide(sp.rect,corridor));if(!r.ok)return `${sp.name}: ${r.error}`;}
 return null;
}
