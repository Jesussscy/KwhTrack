/* Copias portables. Solo se aceptan los campos conocidos del hogar. */
const KwhBackup = (()=>{
 const fail=message=>{throw new Error(message);};
 function text(value,max,label){if(typeof value!=='string'||!value.trim()||value.length>max)return fail('Revisa '+label+'.');return value.trim();}
 function numeric(value,min,max,label,integer=false){if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max||(integer&&!Number.isInteger(value)))return fail('Valor inválido: '+label+'.');return value;}
 function date(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value+'T00:00:00Z'))||new Date(value+'T00:00:00Z').toISOString().slice(0,10)!==value)return fail('Fecha inválida en la copia.');return value;}
 function list(value,label){if(!Array.isArray(value)||value.length>1000)return fail('Lista inválida: '+label+'.');return value;}
 function id(value){if(typeof value!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(value))return fail('Identificador inválido.');return value;}
 function unique(rows){if(new Set(rows.map(x=>x.id)).size!==rows.length)return fail('La copia tiene identificadores repetidos.');return rows;}
 function validateDraft(value){return unique(list(value??[],'plan de ahorro').map(row=>{if(!row||typeof row!=='object')return fail('El plan contiene un cambio inválido.');return {id:id(row.id),name:text(row.name,70,'el equipo del plan'),hours:numeric(row.hours,0,24,'horas del plan'),days:numeric(row.days,1,31,'días del plan',true),fingerprint:text(row.fingerprint,500,'la referencia del equipo')};}));}
 function validate(input){
  if(!input||input.product!=='kwhTrack'||input.version!==1||!input.data)return fail('Este archivo no es una copia compatible de kwhTrack.');
  const source=input.data,settings=source.settings;if(!settings)return fail('La copia no tiene configuración.');
  const result={settings:{name:text(settings.name,50,'el nombre del hogar'),budget:numeric(settings.budget,1,100000000,'presupuesto'),rate:numeric(settings.rate,.01,100000,'tarifa'),customRate:settings.customRate===true,savingsGoal:numeric(settings.savingsGoal??15,0,50,'meta de ahorro')},example:source.example===true,devices:[],readings:[],bills:[]};
  const categories=['Aire acondicionado','Nevera','Ventilador','Televisor','Iluminación','Computador','Lavadora','Consola de videojuegos','Router y conectividad','Cocina eléctrica','Pequeños aparatos','Herramientas eléctricas','Otro'];
  result.devices=unique(list(source.devices,'equipos').map(d=>{
   if(!d||!categories.includes(d.category))return fail('Categoría de equipo desconocida.');
   if(d.mode!==undefined&&!['power','monthly'].includes(d.mode))return fail('Método de consumo desconocido.');
   const monthly=d.mode==='monthly';return {id:id(d.id),name:text(d.name,70,'el nombre del equipo'),category:d.category,quantity:numeric(d.quantity,1,100,'cantidad',true),mode:monthly?'monthly':'power',active:d.active!==false,monthlyKwh:monthly?numeric(d.monthlyKwh,0,1000000,'kWh mensuales'):0,watts:monthly?100:numeric(d.watts,1,100000,'potencia'),hours:monthly?0:numeric(d.hours,0,24,'horas'),days:monthly?30:numeric(d.days,1,31,'días',true),factor:monthly?1:numeric(d.factor,0,1,'factor')};
  }));
  result.readings=unique(list(source.readings,'lecturas').map(r=>({id:id(r.id),date:date(r.date),value:numeric(r.value,0,1000000000,'lectura')}))).sort((a,b)=>a.date.localeCompare(b.date));
  if(result.readings.some((r,i)=>i&&(r.date===result.readings[i-1].date||r.value<result.readings[i-1].value)))return fail('Las lecturas tienen fechas repetidas o valores decrecientes.');
  result.bills=unique(list(source.bills,'facturas').map(b=>({id:id(b.id),start:date(b.start),end:date(b.end),kwh:numeric(b.kwh,0,10000000,'consumo facturado'),amount:numeric(b.amount,0,1000000000,'total pagado')}))).sort((a,b)=>a.start.localeCompare(b.start));
  if(result.bills.some((b,i)=>b.end<=b.start||(i&&b.start<result.bills[i-1].end)))return fail('Las facturas tienen periodos inválidos o superpuestos.');
  result.draftPlan=validateDraft(source.draftPlan);
  return result;
 }
 function createReader(){
  let sequence=0;
  return {cancel(){sequence++;},async read(file){
   const request=++sequence;
   try{if(!file||!Number.isFinite(file.size)||file.size<0||typeof file.text!=='function')throw Error('Selecciona un archivo de copia válido.');if(file.size>1000000)throw Error('La copia supera el tamaño permitido de 1 MB.');const data=validate(JSON.parse(await file.text()));return request===sequence?{current:true,data}:{current:false};}
   catch(error){return request===sequence?{current:true,error:error instanceof SyntaxError?'No se pudo leer el archivo JSON.':error.message}:{current:false};}
  }};
 }
 return {validate,validateDraft,createReader};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=KwhBackup;
