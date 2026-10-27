/* Una solicitud por acción: una respuesta incierta nunca repite una escritura. */
const KwhAccountTransport=(()=>{
 const uncertain='No pudimos confirmar la operación. Consulta la versión de tu cuenta antes de volver a intentarlo; tu hogar local se conserva.';
 async function request(fetcher,path,options){
  let response,result;
  try{response=await fetcher(path,options);result=await response.json();if(!result||typeof result!=='object'||Array.isArray(result))throw Error();}
  catch{const error=new Error(uncertain);error.code='UNCONFIRMED_RESPONSE';if(response)error.status=response.status;throw error;}
  if(!response.ok){const error=new Error(typeof result.error==='string'?result.error:'No se pudo completar la operación.');error.status=response.status;if(typeof result.code==='string')error.code=result.code;throw error;}
  return result;
 }
 return {request};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=KwhAccountTransport;
