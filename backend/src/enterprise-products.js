// Reutiliza el catálogo local doméstico detrás de una API explícita. No simula una API del comercio.
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
let loading;
async function catalogue(){
 if(!loading)loading=(async()=>{const context=vm.createContext({window:{}});for(const file of ['appliance-catalog-listings.js','appliance-catalog.js']){const code=await readFile(new URL('../../frontend/'+file,import.meta.url),'utf8');vm.runInContext(code,context,{timeout:1500});}return context.window.ApplianceCatalog;})();
 try{return await loading;}catch(e){loading=null;throw e;}
}
export async function searchProducts(query){
 const q=String(query||'').trim().slice(0,120),catalog=await catalogue();
 return {provider:'catalogo-local',live:false,powerNotice:'La referencia comercial no confirma el consumo. Verifica modelo, placa, ficha técnica aplicable o medición.',items:q.length<2?[]:catalog.search(q)};
}
