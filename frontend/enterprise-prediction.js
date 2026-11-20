/* Pronóstico temporal y propuestas de ahorro auditables. Sin sensores ni cambios automáticos. */
const EnterprisePrediction=(()=>{
 const DAY=86400000,epoch=s=>{if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return null;const n=Date.parse(s+'T00:00:00Z');return Number.isFinite(n)&&new Date(n).toISOString().slice(0,10)===s?n:null;},iso=n=>new Date(n).toISOString().slice(0,10);
 const round=n=>Math.round(n*10000)/10000;
 function periods(asOf,horizon){const d=new Date(epoch(asOf));return Array.from({length:horizon},(_,i)=>{const start=Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1+i,1),end=Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+2+i,0);return {start:iso(start),end:iso(end),days:(end-start)/DAY+1,x:(start+end)/2/DAY};});}
 const LABELS={mean:'Promedio reciente ponderado',naive:'Último consumo diario',median:'Mediana reciente',smooth:'Suavizado exponencial',trend:'Tendencia lineal ponderada',damped:'Tendencia amortiguada',seasonal:'Mismo mes del año anterior'};
 function quantile(values,p){const a=[...values].sort((x,y)=>x-y),i=(a.length-1)*p,l=Math.floor(i),u=Math.ceil(i);return a.length?a[l]+(a[u]-a[l])*(i-l):null;}
 function calendarMonths(rows){return rows.every((r,i)=>{const date=new Date(epoch(r.start)),last=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0));return date.getUTCDate()===1&&r.end===last.toISOString().slice(0,10)&&(!i||epoch(r.start)-epoch(rows[i-1].end)===DAY);});}
 function fit(rows,kind){
  const tail=rows.slice(kind==='mean'?-3:kind==='median'?-5:-12),sw=tail.reduce((a,r)=>a+r.days,0),mx=tail.reduce((a,r)=>a+r.x*r.days,0)/sw,my=tail.reduce((a,r)=>a+r.daily*r.days,0)/sw;
  const den=tail.reduce((a,r)=>a+r.days*(r.x-mx)**2,0),slope=den>0?tail.reduce((a,r)=>a+r.days*(r.x-mx)*(r.daily-my),0)/den:0,last=rows.at(-1);
  let level=my,predict;
  if(kind==='naive'){level=last.daily;predict=()=>level;}
  else if(kind==='median'){level=quantile(tail.map(r=>r.daily),.5);predict=()=>level;}
  else if(kind==='smooth'){level=tail[0].daily;for(const r of tail.slice(1))level=.35*r.daily+.65*level;predict=()=>level;}
  else if(kind==='trend')predict=x=>my+slope*(x-mx);
  else if(kind==='damped'){
   // Variante propia: regresión ponderada, pendiente amortiguada según distancia real.
   const phi=.8,levelAtLast=my+slope*(last.x-mx);
   predict=x=>{const months=Math.max(0,(x-last.x)/30.4375),effective=phi*(1-Math.pow(phi,months))/(1-phi);return levelAtLast+slope*30.4375*effective;};
  }else if(kind==='seasonal'){
   predict=x=>{const d=new Date(x*DAY),year=d.getUTCFullYear()-1,month=d.getUTCMonth();const previous=rows.find(r=>{const p=new Date(epoch(r.start));return p.getUTCFullYear()===year&&p.getUTCMonth()===month;});return previous?.daily??NaN;};
  }else predict=()=>my;
  return {kind,slope:kind==='trend'||kind==='damped'?slope:0,center:mx,level,predict};
 }
 function metrics(pairs){
  const days=pairs.reduce((a,p)=>a+p.days,0),absolute=pairs.reduce((a,p)=>a+Math.abs(p.residual)*p.days,0),actual=pairs.reduce((a,p)=>a+p.actual,0);
  return {mae:days?absolute/days:null,rmse:days?Math.sqrt(pairs.reduce((a,p)=>a+p.residual**2*p.days,0)/days):null,bias:days?pairs.reduce((a,p)=>a+p.residual*p.days,0)/days:null,wape:actual>0?absolute/actual*100:null};
 }
 function evaluate(rows,kind,initial){
  const checks=[],pairs=[];
  for(let i=initial;i<rows.length;i++){
   const training=rows.slice(0,i),model=fit(training,kind);
   for(let step=1;step<=3&&i+step-1<rows.length;step++){
    const target=rows[i+step-1],daily=model.predict(target.x);
    if(!Number.isFinite(daily)||daily<0)return {kind,label:LABELS[kind],valid:false,eligible:false,reason:'Produjo una predicción negativa o no calculable durante la evaluación.',mae:null,score:null,checks,pairs,horizons:[]};
    const point={step,trainingLast:training.at(-1).end,testStart:target.start,testEnd:target.end,days:target.days,predicted:round(daily*target.days),actual:target.kwh,residual:target.daily-daily};
    pairs.push(point);if(step===1)checks.push(point);
   }
  }
  const one=metrics(checks),multi=metrics(pairs);
  return {kind,label:LABELS[kind],valid:true,eligible:true,checks,pairs,...one,score:multi.mae,multi,horizons:[1,2,3].map(step=>{const group=pairs.filter(p=>p.step===step);return {step,tests:group.length,...metrics(group)};})};
 }
 function diagnostics(rows,asOf){
  const gaps=[];for(let i=1;i<rows.length;i++){const missing=(epoch(rows[i].start)-epoch(rows[i-1].end))/DAY-1;if(missing>0)gaps.push({after:rows[i-1].end,before:rows[i].start,days:missing});}
  const spanDays=rows.length?(epoch(rows.at(-1).end)-epoch(rows[0].start))/DAY+1:0,observedDays=rows.reduce((a,r)=>a+r.days,0),median=quantile(rows.map(r=>r.daily),.5),mad=quantile(rows.map(r=>Math.abs(r.daily-median)),.5);
  const threshold=Math.max(3*1.4826*(mad||0),Math.abs(median||0)*.6,.01),outliers=rows.filter(r=>Math.abs(r.daily-median)>threshold).map(r=>({id:r.id,start:r.start,end:r.end,daily:round(r.daily)}));
  return {periods:rows.length,spanDays,observedDays,coverage:spanDays?observedDays/spanDays:null,gaps,largestGap:Math.max(0,...gaps.map(g=>g.days)),outliers,monthlyContinuous:calendarMonths(rows),staleDays:rows.length?(epoch(asOf)-epoch(rows.at(-1).end))/DAY:null};
 }
 function chooseModel(rows,dates,strategy){
  const seasonal=rows.length>=27&&calendarMonths(rows),initial=seasonal?24:3,kinds=['mean','naive','median','smooth','trend','damped',...(seasonal?['seasonal']:[])],candidates=kinds.map(kind=>evaluate(rows,kind,initial));
  for(const candidate of candidates){if(!candidate.valid)continue;const model=fit(rows,candidate.kind);if(dates.some(p=>!Number.isFinite(model.predict(p.x))||model.predict(p.x)<0)){candidate.eligible=false;candidate.reason='No puede generar todos los meses futuros con valores finitos y no negativos.';}}
  const reference=candidates[0],best=[...candidates].filter(c=>c.eligible).sort((a,b)=>a.score-b.score||kinds.indexOf(a.kind)-kinds.indexOf(b.kind))[0],selected=strategy==='reference'||!(best.score<reference.score*.9)?reference:best;
  return {seasonal,initial,candidates,reference,selected,kind:selected.kind,model:fit(rows,selected.kind),fallback:candidates.some(c=>c.valid&&!c.eligible)};
 }
 function reservedAudit(rows,strategy){
  if(rows.length<9)return {ready:false,reason:'Se necesitan al menos 9 periodos para reservar los últimos 3 y elegir el modelo con 6 anteriores.'};
  const training=rows.slice(0,-3),test=rows.slice(-3),choice=chooseModel(training,test,strategy),baseline=fit(training,'mean');
  const assess=model=>test.map((target,i)=>{const daily=model.predict(target.x);return {step:i+1,trainingLast:training.at(-1).end,testStart:target.start,testEnd:target.end,days:target.days,predicted:round(daily*target.days),actual:target.kwh,residual:target.daily-daily};});
  const points=assess(choice.model),reference=assess(baseline);return {ready:true,kind:choice.kind,label:LABELS[choice.kind],trainingPeriods:training.length,trainingLast:training.at(-1).end,testPeriods:3,checks:points,...metrics(points),reference:metrics(reference),note:'Ensayo reservado del procedimiento. El modelo final se selecciona y ajusta de nuevo con todo el historial disponible.'};
 }
 function forecast(records,{asOf,origin='bill',horizon=6,historyWindow=24,strategy='auto'}={}){
  if(epoch(asOf)==null)throw Error('La fecha de referencia no es válida.');
  if(!Number.isInteger(horizon)||horizon<1||horizon>6)throw Error('El horizonte debe ser de 1 a 6 meses.');
  if(!Number.isInteger(historyWindow)||historyWindow<6||historyWindow>48)throw Error('La ventana histórica debe estar entre 6 y 48 periodos.');
  if(!['auto','reference'].includes(strategy))throw Error('Selecciona una estrategia válida.');
  if(!Array.isArray(records))throw Error('El historial debe ser una lista de periodos.');
  if(!['bill','measured','imported'].includes(origin))throw Error('El origen del historial no es válido.');
  const dates=periods(asOf,horizon),chosen=records.filter(r=>r&&r.origin===origin),valid=[];let rejected=0,future=0;
  for(const r of chosen){const a=epoch(r.start),b=epoch(r.end),days=a!=null&&b!=null?(b-a)/DAY+1:0;if(a==null||b==null||days<7||days>93||!Number.isFinite(r.kwh)||r.kwh<0||r.kwh>100000000){rejected++;continue;}if(r.end>asOf){future++;continue;}valid.push({...r,days,daily:r.kwh/days,x:(a+b)/2/DAY});}
  valid.sort((a,b)=>a.start.localeCompare(b.start));
  for(let i=1;i<valid.length;i++)if(valid[i].start<=valid[i-1].end)return {version:'2.0',ready:false,reason:'Hay periodos superpuestos del origen elegido. Corrige el historial antes de entrenar.',dates,rows:valid,rejected,future,needed:6};
  const rows=valid.slice(-historyWindow),data=diagnostics(rows,asOf);
  if(rows.length<6)return {version:'2.0',ready:false,reason:`Faltan periodos: hay ${rows.length} válidos y se necesitan al menos 6 del mismo origen, de 7 a 93 días cada uno.`,dates,rows,rejected,future,needed:6,diagnostics:data};
  const {seasonal,initial,candidates,reference,selected,kind,model,fallback}=chooseModel(rows,dates,strategy),audit=reservedAudit(rows,strategy);
  const improvement=reference.score>0?(reference.score-selected.score)/reference.score*100:0;
  const typicalSpacing=quantile(rows.slice(1).map((r,i)=>r.x-rows[i].x),.5);let previousRadius=0;
  const points=dates.map((p,i)=>{
   const daily=model.predict(p.x),value=daily*p.days,step=Math.max(1,Math.round((p.x-rows.at(-1).x)/typicalSpacing)),exact=selected.pairs.filter(v=>v.step===step),pool=exact.length>=5?exact:selected.pairs;
   const extrapolated=step>3,radius=Math.max(previousRadius,(quantile(pool.map(v=>Math.abs(v.residual)),.8)||0)*Math.sqrt(Math.max(1,step/3)));previousRadius=radius;
   return {...p,value:round(value),daily:round(daily),low:round(Math.max(0,value-radius*p.days)),high:round(value+radius*p.days),band:{samples:pool.length,step,monthIndex:i+1,radiusDaily:radius,pooled:pool!==exact,extrapolated,method:'P80 del error absoluto retrospectivo; ampliación heurística con la distancia'}};
  });
  const extrapolating=points.some(p=>p.daily>Math.max(...rows.map(r=>r.daily))*1.5);const warnings=[];if(rejected)warnings.push(`${rejected} periodo(s) inválidos descartados.`);if(future)warnings.push(`${future} periodo(s) futuros excluidos.`);if(extrapolating)warnings.push('El pronóstico se aleja mucho de los valores observados.');if(rows.length<12)warnings.push('Historial corto: menos de 12 periodos válidos.');if(selected.checks.length<5)warnings.push('Hay menos de 5 periodos distintos de prueba.');if(data.staleDays>90)warnings.push('El último dato tiene más de 90 días.');if(data.gaps.length)warnings.push(`Hay ${data.gaps.length} hueco(s) sin registros; no se rellenaron.`);if(data.outliers.length)warnings.push(`Hay ${data.outliers.length} periodo(s) atípicos para revisar; se conservaron.`);if(selected.multi.wape>30)warnings.push('El error retrospectivo supera el 30 % del consumo evaluado.');
  const caution=rejected>0||extrapolating||data.staleDays>90||data.largestGap>45||data.outliers.length>0||selected.multi.wape>30;
  return {version:'2.0',ready:true,kind,label:LABELS[kind],rows,points,dates,candidates,validation:selected,rejected,future,fallback,diagnostics:data,reservedAudit:audit,quality:{level:caution?'review':warnings.length?'limited':'usable',label:caution?'Revisa los datos antes de decidir':warnings.length?'Historial con limitaciones':'Historial utilizable',warnings},selection:{strategy,reference:'mean',score:selected.score,referenceScore:reference.score,improvement,initial,steps:3,seasonalAvailable:seasonal,reason:strategy==='reference'?'Elegiste utilizar la referencia simple.':kind==='mean'?'Ninguna alternativa mejoró al menos un 10 % el error de la referencia.':`Redujo el error multihorizonte un ${round(improvement)} % frente al promedio reciente.`},weights:'Días de cada periodo; decisión de diseño.',staleDays:data.staleDays,extrapolating,model:{kind,slope:model.slope,center:model.center,level:model.level,alpha:kind==='smooth'?.35:null,phi:kind==='damped'?.8:null},historyWindow,bandNote:'La banda es una referencia de variación basada en errores retrospectivos. No es un intervalo de confianza ni tiene cobertura probabilística garantizada.'};
 }

 function propose(building,{goal=15,maxReduction=30,exclude=[],targetBase=null}={}){
  if(!Number.isFinite(goal)||goal<0||goal>100)throw Error('La meta debe estar entre 0 y 100 %.');if(!Number.isFinite(maxReduction)||maxReduction<0||maxReduction>50)throw Error('El límite de horas debe estar entre 0 y 50 %.');
  const blocked=new Set(exclude.map(Number)),candidates=[],excluded=[];let inventory=0,known=0,unknown=0;
  const inspect=(e,place,ids,common=false)=>{const k=e.calc?.kwh;if(e.active===false||e.calc?.status==='paused'){excluded.push({id:e.id,name:e.name,reason:'Pausado'});return;}if(Number.isFinite(k)&&k>=0){inventory+=k;known++;}else unknown++;
   const norm=(e.category+' '+e.name).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();let reason=common==='circulation'?'Circulación: revisa sus grupos en Pasillos y sensores':common?'Servicio común: requiere revisión manual':e.essential?'Marcado como esencial':blocked.has(e.id)?'Excluido del escenario':/servid|server|refriger|nevera|router|conectividad|bomba|ascensor|seguridad/.test(norm)?'Funcionamiento continuo o crítico: protegido por defecto':!['Aire acondicionado','Iluminación','Computador','Impresora','Proyector'].includes(e.category)?'Categoría para revisión manual':e.mode!=='power'?'Consumo mensual conocido: no se ajusta por horas':!Number.isFinite(k)||![e.watts,e.hours,e.days].every(Number.isFinite)?'Datos incompletos':!(k>0&&e.hours>0)?'Sin consumo ajustable':null;
   if(reason){excluded.push({id:e.id,name:e.name,reason});return;}candidates.push({id:e.id,name:e.name,category:e.category,quantity:e.quantity,place,...ids,before:k,oldHours:e.hours,days:e.days,potential:Math.max(0,k*(1-Math.min(e.hours,Math.ceil(e.hours*(1-maxReduction/100)*100-1e-8)/100)/e.hours))});};
  for(const f of building.floors)for(const s of f.spaces)for(const e of s.equipment)inspect(e,`${f.name} › ${s.name}`,{floorId:f.id,spaceId:s.id});for(const f of building.floors)for(const e of f.circulation?.equipment||[])inspect(e,`${f.name} › ${f.circulation.name}`,{floorId:f.id},'circulation');for(const e of building.common||[])inspect(e,'Servicios comunes',{},true);
  const baseline=targetBase==null?(known?inventory:null):targetBase;if(baseline!=null&&(!Number.isFinite(baseline)||baseline<0))throw Error('La base del escenario no es válida.');
  const target=(baseline||0)*goal/100,maxSaving=candidates.reduce((a,e)=>a+e.potential,0),changes=[];let remaining=target;const tolerance=Math.max(.01,target*.001);
  for(const e of [...candidates].sort((a,b)=>b.potential-a.potential)){if(remaining<tolerance)break;const wished=Math.min(remaining,e.potential),minHours=e.oldHours*(1-maxReduction/100),proposedHours=Math.ceil(Math.max(minHours,e.oldHours*(1-wished/e.before))*100-1e-8)/100,hours=proposedHours>=e.oldHours?e.oldHours:Number(proposedHours.toFixed(2)),after=e.before*hours/e.oldHours,saving=round(Math.max(0,e.before-after));if(saving>=tolerance&&hours<e.oldHours-.0001){changes.push({...e,hours,after:round(after),saving});remaining-=saving;}}
  const saving=changes.reduce((a,c)=>a+c.saving,0);return {buildingId:building.id,revision:building.revision,goal,maxReduction,inventory:known?round(inventory):null,known,unknown,baseline,target:round(target),maxSaving:round(maxSaving),saving:round(saving),achieved:baseline>0?saving/baseline*100:0,reachable:baseline!=null&&target<=maxSaving+.001,remaining:round(Math.max(0,target-saving)),candidates,excluded,changes};
 }
 function scenario(building,options){const historical=forecast(building.records||[],options),targetBase=historical.ready?historical.points[0].value/historical.points[0].days*30:null,plan=propose(building,{...options,targetBase});
  const points=(historical.ready?historical.points:historical.dates.map(p=>({...p,value:plan.inventory==null?null:round(plan.inventory/30*p.days),daily:plan.inventory==null?null:plan.inventory/30}))).map(p=>({...p,after:p.value==null?null:round(Math.max(0,p.value-plan.saving/30*p.days)),saving:p.value==null?null:round(Math.min(p.value,plan.saving/30*p.days))}));
  const historyTypical=historical.ready?historical.points[0].value/historical.points[0].days*30:null,reconciliation={inventory:plan.inventory,historyTypical:historyTypical==null?null:round(historyTypical),relativeDifference:historyTypical>0&&plan.inventory!=null?(plan.inventory-historyTypical)/historyTypical*100:null};
  const totals={before:points.every(p=>p.value!=null)?round(points.reduce((a,p)=>a+p.value,0)):null,after:points.every(p=>p.after!=null)?round(points.reduce((a,p)=>a+p.after,0)):null,saving:points.every(p=>p.saving!=null)?round(points.reduce((a,p)=>a+p.saving,0)):null};
  return {historical,plan,points,totals,reconciliation,source:historical.ready?'history':'inventory',capped:points.some(p=>p.value!=null&&plan.saving/30*p.days>p.value)};
 }
 function demoRecords(asOf){const d=new Date(epoch(asOf)),levels=[74,78,81,79,86,89,91,94];return levels.map((daily,i)=>{const start=Date.UTC(d.getUTCFullYear(),d.getUTCMonth()-8+i,1),end=Date.UTC(d.getUTCFullYear(),d.getUTCMonth()-7+i,0);return {id:900000+i,start:iso(start),end:iso(end),kwh:round(daily*((end-start)/DAY+1)),origin:'bill'};});}
 return {forecast,propose,scenario,demoRecords};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=EnterprisePrediction;
