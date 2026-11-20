/* Distribución inicial compartida. No crea equipos ni modifica una planta existente. */
const EnterpriseFloorDraft=(()=>{
 const local=typeof module!=='undefined'&&module.exports,Layout=local?require('./enterprise-layout.js'):EnterpriseLayout;
 function prepare(input={}){
  const offices=input.offices??0,lobby=input.lobby??false;
  if(!Number.isInteger(offices)||offices<0||offices>12)throw Error('Usa de 0 a 12 oficinas.');
  if(typeof lobby!=='boolean')throw Error('La opción de lobby debe ser verdadera o falsa.');
  const items=Array.from({length:offices},(_,i)=>({ref:String(i),name:'Oficina '+(i+1),kind:'Oficina',size:'standard'}));
  if(lobby)items.push({ref:String(items.length),name:'Lobby',kind:'Lobby',size:'standard'});
  if(!items.length)return {items:[],config:null,rects:[]};
  const generated=Layout.generate(items,{corridor:true,variant:0,decor:true});
  if(!generated.ok)throw Error(generated.error||'Esta distribución no cabe. Reduce la cantidad de espacios.');
  return {items,rects:generated.rects,config:{version:generated.version,corridor:true,corridorRect:generated.corridor,variant:0,decor:true}};
 }
 return {prepare};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=EnterpriseFloorDraft;
