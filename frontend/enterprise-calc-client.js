/* Cálculo empresarial compartido por navegador y servidor. */
const EnterpriseCalc=(()=>{
// Cálculo puro de la zona empresarial.
// kWh/mes = W × cantidad × h/día × días/mes × factor ÷ 1000 (estimación, no medición).
function equipmentKwh(e){
 const q=e.quantity;
 if(e.active===false)return {kwh:0,status:'paused',missing:[],method:'Pausado: excluido del cálculo (conserva sus valores; no controla el aparato físico)'};
 if(e.mode==='monthly'){
  if(e.monthlyKwh==null)return {kwh:null,status:'incomplete',missing:['consumo mensual'],method:'Falta el consumo mensual conocido'};
  return {kwh:e.monthlyKwh*q,status:'user',missing:[],method:`${e.monthlyKwh} kWh/mes × ${q} (valor introducido; no se multiplica por horas ni factor)`};
 }
 const missing=[];
 if(e.watts==null)missing.push('potencia (W)');
 if(e.hours==null)missing.push('horas por día');
 if(e.days==null)missing.push('días al mes');
 if(missing.length)return {kwh:null,status:'incomplete',missing,method:'Faltan datos para estimar'};
 const f=e.factor??1;
 return {kwh:e.watts*q*e.hours*e.days*f/1000,status:'estimated',missing:[],method:`${e.watts} W × ${q} × ${e.hours} h × ${e.days} d × ${f} ÷ 1000`};
}
function agg(items){let kwh=0,unknown=0,known=0;for(const i of items){if(i.status==='paused')continue;if(i.kwh==null)unknown++;else{kwh+=i.kwh;known++;}}return {kwh,knownItems:known,unknownItems:unknown,complete:unknown===0&&known>0};}
function computeBuilding(b){
 const floors=b.floors.map(f=>{
  const spaces=f.spaces.map(s=>{
   const equipment=s.equipment.map(e=>({...e,calc:equipmentKwh(e)}));
   return {...s,noOwnEquipment:equipment.length===0&&(b.energy?.noOwnSpaces||[]).includes(s.id),equipment,totals:{...agg(equipment.map(e=>e.calc)),empty:equipment.length===0}};
  });
  const circulation=(b.energy?.corridors||[]).find(z=>z.floorId===f.id);
  const zone=circulation?{...circulation,equipment:circulation.equipment.map(e=>({...e,calc:equipmentKwh(e)}))}:null;
  if(zone)zone.totals=agg(zone.equipment.map(e=>e.calc));
  return {...f,circulation:zone,spaces,totals:{...agg([...spaces.flatMap(s=>s.equipment.map(e=>e.calc)),...(zone?.equipment||[]).map(e=>e.calc)]),spaceCount:spaces.length,spacesWithoutEquipment:spaces.filter(s=>s.totals.empty&&!s.noOwnEquipment).length}};
 });
 const missing=floors.reduce((n,f)=>n+f.spaces.filter(s=>(s.totals.empty&&!s.noOwnEquipment)||s.totals.unknownItems>0).length,0);
 return withCommon(b,{...b,floors,totals:{...agg(floors.flatMap(f=>[...f.spaces.flatMap(s=>s.equipment.map(e=>e.calc)),...(f.circulation?.equipment||[]).map(e=>e.calc)])),spacesMissingData:missing},unit:'kWh/mes',origin:b.isDemo?'demostración':'estimación por inventario'});
}


/* Servicios comunes: se estiman igual que un equipo, pero NO se reparten entre espacios. */
function withCommon(b,out){
 const common=(b.common||[]).map(e=>({...e,calc:equipmentKwh(e)}));const a=agg(common.map(e=>e.calc));
 return {...out,common,totals:{...out.totals,commonKwh:a.kwh,commonUnknown:a.unknownItems,buildingKwh:out.totals.kwh+a.kwh}};
}
/** Consumo medido entre dos fechas con lectura EXACTA del mismo medidor. Nunca mezcla medidores ni interpola. */
function meterKwh(m,from,to){
 const v=d=>{const r=(m.readings||[]).find(x=>x.date===d);return r?r.value:null;};
 const a=v(from),z=v(to);if(a==null||z==null)return {kwh:null,why:'sin lectura en esas fechas'};if(to<=from)return {kwh:null,why:'periodo inválido'};
 if(z<a)return {kwh:null,why:'la lectura final es menor que la inicial'};return {kwh:z-a,why:null};
}
/** Medición del edificio: SOLO medidores generales de edificio suman; los submedidores son un desglose y no se suman otra vez. */
function measured(b,from,to){
 const ms=b.meters||[],rows=ms.map(m=>({m,...meterKwh(m,from,to)}));
 const generals=rows.filter(r=>r.m.kind==='general'&&r.m.scope==='building');
 const complete=generals.length>0&&generals.every(r=>r.kwh!=null);
 const total=generals.reduce((x,r)=>x+(r.kwh||0),0);
 const breakdown=generals.map(g=>{const subs=rows.filter(r=>r.m.parentId===g.m.id);const allKnown=subs.length>0&&subs.every(r=>r.kwh!=null);
  return {general:g,subs,unmetered:g.kwh!=null&&allKnown?g.kwh-subs.reduce((x,r)=>x+r.kwh,0):null};});
 return {from,to,rows,generals,total:complete?total:null,partialTotal:generals.length&&!complete?total:null,complete,breakdown};
}

/** Qué consume más en un piso: todo se deriva del inventario; sin datos no hay conclusión. */
function explainFloor(f){
 const scope=[...f.spaces,...(f.circulation?[{...f.circulation,kind:'Pasillo',totals:{...f.circulation.totals,empty:!f.circulation.equipment.length}}]:[])];
 const pctOf=(x,t)=>t>0?x/t:null;
 const spaces=scope.map(sp=>({id:sp.id,name:sp.name,kind:sp.kind,kwh:sp.totals.knownItems?sp.totals.kwh:null,partial:sp.totals.unknownItems>0,empty:sp.equipment.length===0&&!sp.noOwnEquipment,units:sp.equipment.reduce((a,e)=>a+e.quantity,0),lines:sp.equipment.length}));
 const ranked=spaces.filter(x=>x.kwh!=null).sort((a,b)=>b.kwh-a.kwh);
 const totalKnown=ranked.reduce((a,x)=>a+x.kwh,0);ranked.forEach(x=>{x.share=pctOf(x.kwh,totalKnown);});
 const incomplete=spaces.filter(x=>x.partial||x.empty);
 const cats=new Map();
 for(const sp of scope)for(const e of sp.equipment){if(e.calc.status==='paused')continue;const c=cats.get(e.category)||{category:e.category,kwh:0,units:0,unknown:0,known:0};c.units+=e.quantity;if(e.calc.kwh==null)c.unknown++;else{c.kwh+=e.calc.kwh;c.known++;}cats.set(e.category,c);}
 const categories=[...cats.values()].sort((a,b)=>b.kwh-a.kwh);categories.forEach(c=>{c.share=pctOf(c.kwh,totalKnown);});
 const topSpace=ranked[0]?scope.find(x=>x.id===ranked[0].id):null;
 const lines=topSpace?topSpace.equipment.filter(e=>e.calc.status!=='paused').map(e=>({id:e.id,name:e.name,category:e.category,quantity:e.quantity,watts:e.watts,hours:e.hours,days:e.days,factor:e.factor,kwh:e.calc.kwh,share:pctOf(e.calc.kwh||0,ranked[0].kwh),method:e.calc.method,status:e.calc.status})).sort((a,b)=>(b.kwh??-1)-(a.kwh??-1)):[];
 const provisional=incomplete.length>0,sentences=[];
 if(!ranked.length)sentences.push('Todavía no hay datos suficientes para decir qué espacio consume más: registra potencia, horas y días en los equipos.');
 else{const t=ranked[0];
  sentences.push(`${t.name} es el espacio con mayor consumo ${provisional?'conocido':'estimado'} del piso: ${t.kwh.toFixed(1)} kWh/mes${t.share!=null?` (${(t.share*100).toFixed(0)} % del total conocido del piso)`:''}.`);
  if(provisional)sentences.push(`Faltan datos en ${incomplete.length} espacio(s) (${incomplete.map(x=>x.name).join(', ')}): el orden puede cambiar al completarlos.`);
  for(const l of lines.slice(0,3))sentences.push(l.kwh==null?`${l.quantity} × ${l.name}: sin datos suficientes para estimar su aporte.`:`${l.quantity} × ${l.name} aportan ${l.kwh.toFixed(1)} kWh/mes${l.share!=null?` (${(l.share*100).toFixed(0)} % de ${t.name})`:''}.`);
  sentences.push('La cantidad de aparatos no decide por sí sola: el cálculo usa potencia, horas, días y factor de uso de cada equipo.');}
 return {spaces,ranked,totalKnown,categories,top:ranked[0]||null,lines,incomplete,provisional,sentences};
}

/** Indicadores comparables por puesto y por m². El denominador es siempre visible; sin dato declarado no se calcula nada. */
function indicators(spaces){
 const withData=x=>x.totals&&x.totals.knownItems>0,lineStats=list=>{let known=0,total=0;for(const x of list)for(const e of x.equipment){if(e.calc.status==='paused')continue;total++;if(e.calc.kwh!=null)known++;}return {known,total};};
 const ws=spaces.filter(x=>x.workstations>0),wsData=ws.filter(withData);
 const kwhWs=wsData.reduce((a,x)=>a+x.totals.kwh,0),puestos=wsData.reduce((a,x)=>a+x.workstations,0);
 const occKnown=wsData.length>0&&wsData.every(x=>x.occupied!=null),occ=occKnown?wsData.reduce((a,x)=>a+x.occupied,0):null;
 const ar=spaces.filter(x=>x.areaM2>0),arData=ar.filter(withData),kwhAr=arData.reduce((a,x)=>a+x.totals.kwh,0),m2=arData.reduce((a,x)=>a+x.areaM2,0);
 const cov=l=>{const c=lineStats(l);return {known:c.known,total:c.total,pct:c.total?Math.round(c.known/c.total*100):null};};
 return {
  period:'mes típico (kWh/mes estimados por inventario)',
  perDesk:puestos>0?{value:kwhWs/puestos,numerator:kwhWs,denominator:puestos,spaces:wsData.length,spacesWithDesksTotal:ws.length,coverage:cov(wsData),partial:wsData.length<ws.length||wsData.some(x=>x.totals.unknownItems>0),
   method:'kWh/mes estimados de los espacios con puestos ÷ puestos declarados totales (disponibles = todos los puestos del espacio, estén ocupados o no).'}:null,
  perOccupied:occ>0&&puestos>0?{value:kwhWs/occ,numerator:kwhWs,denominator:occ,spaces:wsData.length,method:'kWh/mes estimados de los espacios con puestos ÷ puestos ocupados declarados.'}:null,
  occupancy:ws.length?{total:ws.reduce((a,x)=>a+x.workstations,0),occupied:occKnown?occ:null,unknownSpaces:ws.filter(x=>x.occupied==null).length}:null,
  perM2:m2>0?{value:kwhAr/m2,numerator:kwhAr,denominator:m2,spaces:arData.length,spacesWithoutArea:spaces.length-ar.length,coverage:cov(arData),partial:arData.length<ar.length||arData.some(x=>x.totals.unknownItems>0),
   method:'kWh/mes estimados de los espacios con superficie real declarada ÷ esa superficie (m²). Las medidas de la planta esquemática no se usan.'}:null,
  caution:'Son razones de apoyo para comparar, no pruebas de eficiencia: dependen de la cobertura de datos, del uso real y de equipos compartidos (por ejemplo climatización).'
 };
}
/** Resumen del inventario seleccionado. No incorpora facturas ni rellena consumos desconocidos. */
function overview(buildings){
 const items=[],spaces=[],floors=[];
 for(const b of buildings){for(const f of b.floors){for(const s of f.spaces){spaces.push({b,f,s});for(const e of s.equipment)items.push({b,f,s,e,common:false});}if(f.circulation){const s={...f.circulation,kind:'Pasillo',totals:{...f.circulation.totals,empty:!f.circulation.equipment.length}};spaces.push({b,f,s});for(const e of s.equipment)items.push({b,f,s,e,common:false,circulation:true});}floors.push({b,f});}for(const e of b.common||[])items.push({b,f:null,s:null,e,common:true});}
 const active=items.filter(x=>x.e.active!==false&&x.e.calc.status!=='paused'),known=active.filter(x=>Number.isFinite(x.e.calc.kwh)&&x.e.calc.kwh>=0),unknown=active.filter(x=>x.e.calc.kwh==null);
 const sum=list=>list.reduce((a,x)=>a+x.e.calc.kwh,0),total=known.length?sum(known):items.length&&active.length===0?0:null;
 const categories=new Map();for(const x of active){const k=x.e.category||'Otro',c=categories.get(k)||{name:k,value:0,known:0,unknown:0,units:0};c.units+=x.e.quantity;if(x.e.calc.kwh==null)c.unknown++;else{c.known++;c.value+=x.e.calc.kwh;}categories.set(k,c);}
 const ranking=known.filter(x=>x.e.calc.kwh>0).sort((a,b)=>b.e.calc.kwh-a.e.calc.kwh||a.e.name.localeCompare(b.e.name));
 const missing=spaces.filter(x=>(!x.s.equipment.length&&!x.s.noOwnEquipment)||x.s.equipment.some(e=>e.active!==false&&e.calc.kwh==null));
 const grouped=list=>{const valid=list.filter(x=>x.e.active!==false&&Number.isFinite(x.e.calc.kwh)),present=list.some(x=>x.e.active!==false);return valid.length?sum(valid):list.length&&!present?0:null;};
 return {items,active,known,unknown,total,ranking,categories:[...categories.values()].map(c=>({...c,value:c.known?c.value:null})).sort((a,b)=>(b.value??-1)-(a.value??-1)),missing,coverage:active.length?Math.round(known.length/active.length*100):null,units:items.reduce((a,x)=>a+x.e.quantity,0),paused:items.length-active.length,common:sum(known.filter(x=>x.common)),partial:unknown.length>0||missing.length>0,spaces:spaces.length,floors:floors.length,
 buildings:buildings.map(b=>({b,value:grouped(items.filter(x=>x.b.id===b.id))})),floorRows:floors.map(({b,f})=>({b,f,value:grouped(items.filter(x=>x.b.id===b.id&&x.f?.id===f.id))}))};
}
function overviewScope(buildings,scope){const real=buildings.filter(b=>!b.isDemo);if(!scope||scope==='real'&&!real.length||scope.startsWith('b:')&&!buildings.some(b=>'b:'+b.id===scope))scope=real.length?'real':buildings.length?'b:'+buildings[0].id:'real';return {scope,buildings:scope==='real'?real:buildings.filter(b=>'b:'+b.id===scope)};}
return {equipmentKwh,computeBuilding,meterKwh,measured,explainFloor,indicators,overview,overviewScope};
})();
if(typeof module!=="undefined"&&module.exports)module.exports=EnterpriseCalc;
