const E=require('../enterprise-energy.js');
class HttpError extends Error{constructor(status,message){super(message);this.status=status;}}
const cache=new Map(),inflight=new Map();
/** Proveedor fijo: ninguna URL o credencial enviada por el cliente. Un kWp como referencia. */
async function solarProfile(input){
 let s;try{s=E.solarConfig(input);}catch(e){throw new HttpError(400,e.message);}
 const key=E.providerKey(s),stored=cache.get(key);if(stored&&Date.now()-stored.at<86400000)return stored.value;if(inflight.has(key))return inflight.get(key);
 if(inflight.size>=3)throw new HttpError(429,'Hay consultas solares en curso. Intenta en unos segundos.');
 const promise=(async()=>{const url=new URL('https://re.jrc.ec.europa.eu/api/v5_3/seriescalc');const params={lat:s.lat,lon:s.lon,raddatabase:'PVGIS-ERA5',startyear:2023,endyear:2023,pvcalculation:1,peakpower:1,loss:s.loss,angle:s.tilt,aspect:s.azimuth-180,outputformat:'json'};
  for(const [k,v]of Object.entries(params))url.searchParams.set(k,String(v));
  try{const response=await fetch(url,{signal:AbortSignal.timeout(12000),redirect:'error'});if(!response.ok)throw Error('provider');const raw=await response.json();const rows=raw?.outputs?.hourly;if(!Array.isArray(rows)||rows.length!==8760)throw Error('coverage');
   const sums=Array.from({length:12},()=>Array(24).fill(0)),counts=Array.from({length:12},()=>Array(24).fill(0));
   for(const row of rows){if(typeof row.P!=='number'||!Number.isFinite(row.P)||row.P<0||row.P>2000||!/^2023\d{4}:\d{4}$/.test(row.time))throw Error('data');const t=row.time;const date=new Date(Date.UTC(+t.slice(0,4),+t.slice(4,6)-1,+t.slice(6,8),+t.slice(9,11),+t.slice(11,13))+s.utcOffset*3600000),m=date.getUTCMonth(),h=date.getUTCHours();sums[m][h]+=row.P/1000;counts[m][h]++;}
   if(counts.some(r=>r.some(n=>n<25)))throw Error('coverage');
   const value=E.validateProfile({hours:sums.map((r,m)=>r.map((x,h)=>x/counts[m][h])),source:'PVGIS 5.3 · ERA5 · año histórico 2023',year:2023,key,retrievedAt:new Date().toISOString()});if(cache.size>=50)cache.delete(cache.keys().next().value);cache.set(key,{at:Date.now(),value});return value;
  }catch{throw new HttpError(502,'No se pudo obtener una curva solar completa de PVGIS. Conservamos tus datos: vuelve a consultar más tarde.');}
 })();inflight.set(key,promise);try{return await promise;}finally{inflight.delete(key);}
}

module.exports={solarProfile};
