/* Distingue recuperar acceso de volver a revisar una versión del hogar. */
const KwhSessionRecovery=(()=>{
 function action(error){
  if(error.code==='SESSION_REQUIRED'||error.status===401)return 'signin';
  if(['ACCOUNT_CHANGED','CSRF_MISMATCH'].includes(error.code))return 'refresh';
  return 'review';
 }
 function label(kind){return kind==='signin'?'Volver a iniciar sesión':kind==='refresh'?'Actualizar sesión':'Revisar versión actual';}
 return {action,label};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=KwhSessionRecovery;
