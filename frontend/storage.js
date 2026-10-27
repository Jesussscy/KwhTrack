/* Persistencia local conservadora: nunca reemplaza silenciosamente datos dañados. */
const KwhStorage=(()=>{
 function create(provider,key,validate,fallback){
  let storage=null,baseline=null,status='unavailable',data=structuredClone(fallback),quarantined=false;
  function decode(raw){if(raw===null)return {status:'empty',data:structuredClone(fallback)};try{return {status:'ready',data:validate(JSON.parse(raw))};}catch{return {status:'damaged',data:structuredClone(fallback)};}}
  function peek(){try{const raw=storage.getItem(key);return {...decode(raw),raw};}catch{return {status:'unavailable',data:null,raw:null};}}
  try{storage=typeof provider==='function'?provider():provider;baseline=storage.getItem(key);const loaded=decode(baseline);status=loaded.status;data=loaded.data;quarantined=storage.getItem(key+'.recovery')!==null;}catch{}
  function commit(next,{recover=false}={}){
   if(!storage||status==='unavailable')return {ok:false,reason:'unavailable',message:'El almacenamiento no está disponible. Descarga una copia antes de cerrar.'};
   try{
    const latest=storage.getItem(key);
    if(latest!==baseline)return {ok:false,reason:'conflict',message:'Otra pestaña cambió los datos guardados. Revisa esa versión antes de guardar.'};
    if(status==='damaged'&&!recover)return {ok:false,reason:'damaged',message:'Los datos guardados necesitan recuperación. No hemos sustituido el original.'};
    let clean;try{clean=validate(next);}catch{return {ok:false,reason:'validation',message:'Hay datos incoherentes. Revisa los valores antes de guardar; la versión anterior se conserva.'};}
    const serialized=JSON.stringify(clean);
    if(status==='damaged'){let archiveKey=key+'.recovery';const existing=storage.getItem(archiveKey);if(existing!==null&&existing!==baseline)archiveKey+='.'+Date.now()+'-'+Math.random().toString(36).slice(2,8);if(storage.getItem(archiveKey)!==baseline)storage.setItem(archiveKey,baseline);storage.setItem(key+'.recovery.latest',archiveKey);quarantined=true;}
    storage.setItem(key,serialized);baseline=serialized;data=clean;status='ready';
    return {ok:true,data:structuredClone(data)};
   }catch{return {ok:false,reason:'write',message:'No se pudo guardar. Los datos anteriores se conservan; descarga una copia y revisa el espacio del navegador.'};}
  }
  function adopt(expectedRaw){const next=peek();if(next.status==='unavailable'||next.raw!==expectedRaw)return {ok:false,message:'La versión guardada volvió a cambiar. Revísala otra vez.'};if(next.status==='damaged')return {ok:false,message:'La versión guardada necesita recuperación.'};baseline=next.raw;status=next.status;data=next.data;return {ok:true,data:structuredClone(data)};}
  function original(){try{if(status==='damaged')return baseline;const latest=storage?.getItem(key+'.recovery.latest'),archive=latest&&(latest===key+'.recovery'||latest.startsWith(key+'.recovery.')&&latest!==key+'.recovery.latest')?latest:key+'.recovery';return storage?.getItem(archive);}catch{return null;}}
  return {commit,peek,adopt,original,get data(){return structuredClone(data);},get status(){return status;},get baseline(){return baseline;},get quarantined(){return quarantined;},key};
 }
 return {create};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=KwhStorage;
