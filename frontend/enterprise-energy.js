/* Motor compartido: energía solar, perfiles declarados y automatización en observación. */
'use strict';
const EnterpriseEnergy=(()=>{
 const MONTHS=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
 const DAYS=[31,28,31,30,31,30,31,31,30,31,30,31];
 const finite=(v,min,max,label)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw Error(`${label}: usa un número entre ${min} y ${max}.`);return v;};
 const text=(v,max,label)=>{if(typeof v!=='string'||!v.trim()||v.length>max)throw Error(`Revisa ${label}.`);return v.trim();};
 function solarConfig(s={}){
  const out={};for(const [k,min,max,label]of [['lat',-60,60,'Latitud'],['lon',-180,180,'Longitud'],['panels',0,10000,'Paneles'],['wp',1,1500,'Potencia por panel (Wp)'],['panelArea',0.1,20,'Superficie por panel'],['spacing',1,4,'Factor de separación'],['tilt',0,90,'Inclinación'],['azimuth',0,360,'Orientación desde el norte'],['loss',0,60,'Pérdidas'],['utcOffset',-12,14,'Zona horaria'],['startHour',0,23,'Inicio de actividad'],['endHour',1,24,'Fin de actividad'],['basePercent',0,100,'Carga fuera de horario'],['reduction',0,50,'Reducción de horario'],['exportRate',0,1e6,'Compensación por kWh']])out[k]=finite(s[k],min,max,label);
  out.area=s.area==null?null:finite(s.area,.1,1e7,'Área útil real');
  if(s.location!=null){const l=s.location;if(!l||typeof l!=='object')throw Error('Ubicación inválida.');out.location={id:typeof l.id==='string'?l.id.slice(0,40):'',name:text(l.name,100,'la ciudad'),department:typeof l.department==='string'?l.department.slice(0,100):'',source:typeof l.source==='string'?l.source.slice(0,160):'Coordenadas declaradas',approximate:l.approximate!==false};}
  if(!Number.isInteger(out.panels))throw Error('La cantidad de paneles debe ser entera.');
  if(out.endHour<=out.startHour)throw Error('El fin de actividad debe ser posterior al inicio. Para actividad nocturna usa el perfil personalizado.');
  if(out.area!=null&&out.panels*out.panelArea*out.spacing>out.area+1e-8)throw Error('Los paneles y su separación superan el área útil declarada. Reduce la cantidad o revisa el área.');
  out.monthlyDemand=s.monthlyDemand==null?null:finite(s.monthlyDemand,0,1e9,'Demanda mensual');
  out.demandSource=['inventory','manual','forecast'].includes(s.demandSource)?s.demandSource:'inventory';
  out.profile=Array.isArray(s.profile)?s.profile.map(x=>finite(x,0,1e6,'Perfil horario')):null;
  if(out.profile&&(out.profile.length!==24||!out.profile.some(x=>x>0)))throw Error('El perfil personalizado necesita 24 valores y alguno mayor que cero.');
  out.profileSource=typeof s.profileSource==='string'?s.profileSource.slice(0,200):'';
  if(out.profile&&!out.profileSource.trim())throw Error('Describe el origen del perfil horario personalizado.');
  return out;
 }
 const defaults=()=>({lat:10.391,lon:-75.479,panels:12,wp:550,area:null,panelArea:2.6,spacing:1.3,tilt:10,azimuth:180,loss:14,utcOffset:-5,startHour:8,endHour:18,basePercent:15,reduction:0,exportRate:0,monthlyDemand:null,demandSource:'inventory',profile:null,profileSource:''});
 const providerKey=s=>JSON.stringify([s.lat,s.lon,s.tilt,s.azimuth,s.loss,s.utcOffset]);
 function validateProfile(p){
  if(!p||!Array.isArray(p.hours)||p.hours.length!==12||p.hours.some(r=>!Array.isArray(r)||r.length!==24))throw Error('La curva solar necesita 12 meses de 24 horas.');
  const hours=p.hours.map(r=>r.map(x=>finite(x,0,2,'Producción específica horaria')));
  const year=finite(p.year,2005,2100,'Año meteorológico');if(!Number.isInteger(year))throw Error('Año inválido.');
  return {hours,year,source:text(p.source,120,'la fuente solar'),key:text(p.key,300,'la configuración solar'),retrievedAt:text(p.retrievedAt,40,'la fecha de consulta'),kind:'historical-average',url:'https://re.jrc.ec.europa.eu/api/v5_3/seriescalc'};
 }
 function validate(input={},floorIds=[]){
  if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Configuración energética inválida.');
  const out={version:1,solar:null,corridors:[],observations:[],rules:[],noOwnSpaces:[]};
  if(!Array.isArray(input.noOwnSpaces||[])||(input.noOwnSpaces||[]).length>4000)throw Error('Declaraciones de espacios inválidas.');out.noOwnSpaces=[...new Set(input.noOwnSpaces||[])];if(out.noOwnSpaces.some(id=>!(typeof id==='number'&&Number.isSafeInteger(id)&&id>0)&&!(typeof id==='string'&&/^s[0-9]{1,5}$/.test(id))))throw Error('Referencia de espacio inválida.');
  if(input.solar){out.solar={config:solarConfig(input.solar.config),production:input.solar.production?validateProfile(input.solar.production):null};}
  const used=new Set();if((input.corridors||[]).length>200)throw Error('Máximo 200 zonas de circulación.');
  for(const z of input.corridors||[]){
   if(!floorIds.includes(z.floorId)||used.has(z.floorId))throw Error('Cada pasillo debe pertenecer a un piso existente y no repetido.');used.add(z.floorId);
   const id=text(z.id,80,'el identificador del pasillo'),name=text(z.name,80,'el nombre del pasillo');
   if((z.equipment||[]).length>100)throw Error('Máximo 100 líneas de equipo por pasillo.');
   const ids=new Set();const equipment=(z.equipment||[]).map(e=>{const eid=text(e.id,80,'el identificador del equipo');if(ids.has(eid))throw Error('Hay identificadores de equipo duplicados.');ids.add(eid);const q=finite(e.quantity,1,1000,'Cantidad');if(!Number.isInteger(q))throw Error('Cantidad entera requerida.');return {id:eid,name:text(e.name,80,'el nombre del equipo'),category:text(e.category,50,'la categoría'),quantity:q,mode:'power',watts:e.watts==null?null:finite(e.watts,1,1e6,'Potencia'),hours:e.hours==null?null:finite(e.hours,0,24,'Horas'),days:e.days==null?null:finite(e.days,0,31,'Días'),factor:finite(e.factor??1,0,1,'Factor'),active:e.active!==false,essential:e.essential===true};});
   if(equipment.reduce((n,e)=>n+e.quantity,0)>1000)throw Error('Máximo 1000 unidades por zona de circulación.');
   out.corridors.push({id,floorId:z.floorId,name,equipment});
  }
  if((input.observations||[]).length>200)throw Error('Máximo 200 observaciones recientes.');
  for(const o of input.observations||[]){const type=o.type;if(!['power','energy','occupancy','temperature','humidity'].includes(type))throw Error('Tipo de sensor inválido.');
   const value=type==='occupancy'?(typeof o.value==='boolean'?o.value:(()=>{throw Error('La ocupación debe ser verdadero o falso.');})()):finite(o.value,...({power:[0,1e9],energy:[0,1e12],temperature:[-40,70],humidity:[0,100]}[type]),'Lectura');
   const at=text(o.at,40,'la fecha de lectura');if(!Number.isFinite(Date.parse(at))||Date.parse(at)>Date.now()+60000)throw Error('La lectura necesita una fecha válida que no esté en el futuro.');
   out.observations.push({id:text(o.id,80,'el identificador'),zone:text(o.zone,80,'la zona'),type,value,at,source:text(o.source,200,'la fuente'),origin:['manual','home-assistant'].includes(o.origin)?o.origin:'manual'});
  }
  if((input.rules||[]).length>50)throw Error('Máximo 50 reglas por edificio.');
  const ruleIds=new Set();for(const r of input.rules||[]){const id=text(r.id,80,'la regla');if(ruleIds.has(id))throw Error('Regla duplicada.');ruleIds.add(id);out.rules.push({id,name:text(r.name,80,'el nombre'),zone:text(r.zone,80,'la zona'),target:text(r.target,100,'el equipo objetivo'),timeout:finite(r.timeout,1,240,'Tiempo de ausencia'),maxAge:finite(r.maxAge,1,60,'Vigencia del sensor'),essential:r.essential===true,override:r.override===true,enabled:r.enabled!==false,kind:r.kind==='climate'?'climate':'lighting',mode:'observe',startHour:r.startHour==null?0:finite(r.startHour,0,23,'Inicio de la regla'),endHour:r.endHour==null?24:finite(r.endHour,1,24,'Fin de la regla'),utcOffset:r.utcOffset==null?-5:finite(r.utcOffset,-12,14,'Hora local de la regla')});if(out.rules.at(-1).endHour<=out.rules.at(-1).startHour)throw Error('La regla debe terminar después de su inicio.');}
  return out;
 }
 function balance(load,pv){return {load,pv,self:Math.min(load,pv),import:Math.max(0,load-pv),export:Math.max(0,pv-load)};}
 function simulate(config,production,demands,tariff=null,adjustableMonthly=0,options={}){
  const s=solarConfig(config),p=validateProfile(production);if(providerKey(s)!==p.key)throw Error('La curva solar corresponde a otra ubicación, orientación, pérdidas o zona horaria. Vuelve a consultarla.');
  if(!Array.isArray(demands)||demands.length!==12)throw Error('Se necesitan doce valores mensuales de demanda.');demands=demands.map(x=>x==null?null:finite(x,0,1e9,'Demanda'));if(!demands.some(x=>x!=null))throw Error('No hay meses de demanda para simular.');
  const weights=s.profile||Array.from({length:24},(_,h)=>h>=s.startHour&&h<s.endHour?1:s.basePercent/100),sum=weights.reduce((a,x)=>a+x,0);if(!sum)throw Error('El horario debe tener carga.');
  const kwp=s.panels*s.wp/1000,scenarios=['baseline','efficiency','solar','combined'].map(id=>({id,months:[],total:{load:0,pv:0,self:0,import:0,export:0,cost:tariff==null?null:0}}));
  const order=options.monthOrder||Array.from({length:12},(_,i)=>i);if(!Array.isArray(order)||new Set(order).size!==order.length||order.some(x=>!Number.isInteger(x)||x<0||x>11)||demands.some((x,i)=>x!=null&&!order.includes(i)))throw Error('Orden de meses inválido.');
  let representative=[],representativeMonth=null,yieldPerPanel=0;for(const m of order){if(demands[m]==null)continue;
   const days=options.monthDays?.[m]??(DAYS[m]+(m===1&&p.year%4===0&&(p.year%100!==0||p.year%400===0)?1:0)),saving=Math.min(demands[m],Math.max(0,adjustableMonthly))*s.reduction/100;
   finite(days,28,31,'Días del mes');yieldPerPanel+=p.hours[m].reduce((a,x)=>a+x,0)*days*s.wp/1000;
   for(const scenario of scenarios){const useSolar=['solar','combined'].includes(scenario.id),efficient=['efficiency','combined'].includes(scenario.id),monthly=demands[m]-(efficient?saving:0),hours=weights.map((w,h)=>({...balance(monthly*w/sum/days,useSolar?p.hours[m][h]*kwp:0),hour:h}));
    const totals={};for(const k of ['load','pv','self','import','export'])totals[k]=hours.reduce((a,x)=>a+x[k]*days,0);totals.cost=tariff==null?null:totals.import*tariff-totals.export*s.exportRate;
    scenario.months.push({month:m,label:options.monthLabels?.[m]||MONTHS[m],...totals});for(const k of Object.keys(totals))if(totals[k]!=null)scenario.total[k]+=totals[k];if(representativeMonth==null&&scenario.id==='combined'){representative=hours;representativeMonth=m;}
   }
  }
  const [base,,solar,combined]=scenarios;return {scenarios,hours:representative,representativeMonth,monthCount:base.months.length,panels:s.panels,yieldPerPanel,kwp,requiredArea:s.panels*s.panelArea*s.spacing,maxPanels:s.area==null?null:Math.floor(s.area/(s.panelArea*s.spacing)),gridReduction:base.total.import-combined.total.import,solarSelfUse:solar.total.pv?solar.total.self/solar.total.pv:null,tariff,notes:['Curvas de días medios históricos; autoconsumo y excedentes aproximados, no una predicción meteorológica ni medición horaria.','Demanda repartida con el horario declarado; sin baterías. No ofrece respaldo durante cortes.','La reducción solo se aplica a cargas de potencia completas, activas y no esenciales. No controla equipos.']};
 }
 function evaluate(rule,observations,now=Date.now()){
  const result=(state,reason,extra={})=>({state,reason,mode:'observe',commandSent:false,...extra});
  if(!rule.enabled)return result('disabled','Regla desactivada.');const localHour=(()=>{const date=new Date(now+(rule.utcOffset??-5)*3600000);return date.getUTCHours()+date.getUTCMinutes()/60;})();if(localHour<(rule.startHour??0)||localHour>=(rule.endHour??24))return result('outside','Fuera del horario de esta regla; no se propone apagar.');if(rule.essential)return result('blocked','Equipo esencial: no se propone apagar.');if(rule.override)return result('blocked','Control manual activo: se respeta.');
  const reads=observations.filter(o=>o.zone===rule.zone&&o.type==='occupancy').sort((a,b)=>Date.parse(b.at)-Date.parse(a.at));const latest=reads[0];if(!latest)return result('unknown','Falta un sensor de ocupación. La potencia del enchufe no demuestra ausencia.');
  const age=(now-Date.parse(latest.at))/60000;if(age<0||age>rule.maxAge)return result('unknown','La lectura de ocupación está vencida o en el futuro.');
  if(latest.value!==false)return result('occupied','Hay ocupación; se conserva el servicio.');
  // Una sola lectura antigua de ausencia no demuestra continuidad. Exigimos una serie sin huecos mayores que maxAge.
  let first=latest;for(let i=1;i<reads.length;i++){const o=reads[i];if(o.value!==false||(Date.parse(first.at)-Date.parse(o.at))/60000>rule.maxAge)break;first=o;}
  const vacant=(now-Date.parse(first.at))/60000;if(vacant<rule.timeout)return result('waiting',`Ausencia observada ${Math.floor(vacant)} de ${rule.timeout} min.`,{vacant});
  return result('proposal',rule.kind==='climate'?'Propondría apagar mediante un controlador de climatización compatible; no cortar alimentación con un enchufe genérico.':'Propondría apagar la iluminación no esencial.',{vacant});
 }
 return {MONTHS,DAYS,defaults,solarConfig,providerKey,validateProfile,validate,balance,simulate,evaluate};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=EnterpriseEnergy;
