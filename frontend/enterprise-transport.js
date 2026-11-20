const EnterpriseTransport=(()=>{
 const fault=(message,code,status)=>Object.assign(new Error(message),{code,status,transportFault:true});
 async function request(path,{method='GET',body,csrf,timeout=20000,fetcher=globalThis.fetch,signal}={}){
  const write=!['GET','HEAD'].includes(method),controller=new AbortController();let timedOut=false;
  const abort=()=>controller.abort();if(signal?.aborted)abort();else signal?.addEventListener('abort',abort,{once:true});
  const timer=setTimeout(()=>{timedOut=true;controller.abort();},timeout);
  try{
   const headers={};if(body!==undefined)headers['Content-Type']='application/json';if(csrf&&write)headers['X-CSRF-Token']=csrf;
   const r=await fetcher(path,{method,headers,credentials:'same-origin',signal:controller.signal,body:body===undefined?undefined:JSON.stringify(body)});
   let data;try{data=await r.json();if(!data||typeof data!=='object'||Array.isArray(data))throw Error();}catch(error){if(controller.signal.aborted)throw error;throw fault('El servidor devolvió una respuesta no válida. '+(write?'Comprueba el estado actual antes de guardar otra vez.':'Vuelve a abrir esta sección.'),write?'WRITE_UNCERTAIN':'INVALID_RESPONSE',r.status);}
   if(!r.ok)throw fault(typeof data.error==='string'?data.error:'No se pudo completar la operación.',typeof data.code==='string'?data.code:'HTTP_ERROR',r.status);
   return data;
  }catch(error){
   if(error.transportFault)throw error;
   if(signal?.aborted)throw fault('La solicitud se canceló.','CANCELLED');
   if(timedOut)throw fault('El servidor tardó demasiado en responder. '+(write?'Comprueba el estado actual antes de repetir el guardado; la solicitud no se ha repetido.':'Puedes volver a cargar esta sección.'),write?'WRITE_UNCERTAIN':'REQUEST_TIMEOUT');
   throw fault(write?'Se perdió la conexión durante el guardado. Comprueba el estado actual antes de volver a guardar; la solicitud no se ha repetido.':'No se pudo conectar con el servidor. Comprueba la conexión e inténtalo de nuevo.',write?'WRITE_UNCERTAIN':'NETWORK_ERROR');
  }finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
 }
 return {request};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=EnterpriseTransport;
