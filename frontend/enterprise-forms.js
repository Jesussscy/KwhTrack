/* Validación del formulario de equipo. Mismos rangos que enterprise-validation.js. */
const EnterpriseForms=(()=>{
 const fail=(field,message)=>{const error=new Error(message);error.field=field;throw error;};
 const text=(fd,field,label,max)=>{const value=String(fd.get(field)??'').trim();if(!value)fail(field,`Indica ${label}.`);if(value.length>max)fail(field,`${label} admite hasta ${max} caracteres.`);return value;};
 function number(fd,field,label,min,max,{integer=false,nullable=false,defaultValue=null}={}){
  const raw=fd.get(field);if(raw==null||String(raw).trim()===''){if(nullable)return defaultValue;fail(field,`Indica ${label}.`);}
  // Admite coma decimal sin interpretar separadores de miles ni notación hexadecimal.
  const normalized=String(raw).trim().replace(',','.');if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(normalized))fail(field,`${label}: escribe un número válido, sin separadores de miles.`);
  const value=Number(normalized);if(!Number.isFinite(value)||value<min||value>max)fail(field,`${label} debe estar entre ${min} y ${max}.`);
  if(integer&&!Number.isInteger(value))fail(field,`${label} debe ser un número entero.`);return value;
 }
 function equipment(fd,{preview=false}={}){
  const name=preview?String(fd.get('name')??'').trim():text(fd,'name','el nombre del equipo',80),mode=fd.get('mode')??'power';
  if(!['power','monthly'].includes(mode))fail('mode','Selecciona un método de cálculo válido.');
  const out={name,category:text(fd,'category','la categoría',50),mode,quantity:number(fd,'quantity','La cantidad',1,1000,{integer:true}),active:fd.get('paused')!=='on',essential:fd.get('essential')==='on'};
  if(mode==='monthly')out.monthlyKwh=number(fd,'monthlyKwh','El consumo mensual',0,1000000,{nullable:true});
  else{out.watts=number(fd,'watts','La potencia (W)',1,1000000,{nullable:true});out.hours=number(fd,'hours','Las horas por día',0,24,{nullable:true});out.days=number(fd,'days','Los días al mes',0,31,{integer:true,nullable:true});out.factor=number(fd,'factor','El factor de uso',0,1,{nullable:true,defaultValue:1});}
  return out;
 }
 return {equipment};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=EnterpriseForms;
