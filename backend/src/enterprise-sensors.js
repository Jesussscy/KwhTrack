// Puente de SOLO LECTURA a Home Assistant. Servidor, token y edificio se configuran localmente.
import {HttpError} from './errors.js';
export function sensorConfigured(buildingId){return Number(process.env.KWH_HA_BUILDING_ID)===buildingId&&Boolean(process.env.KWH_HA_URL&&process.env.KWH_HA_TOKEN&&process.env.KWH_HA_ENTITIES);}
export async function readSensors(buildingId){
 if(!sensorConfigured(buildingId))throw new HttpError(503,'No hay una integración Home Assistant configurada para este edificio. Las lecturas manuales siguen disponibles.');
 let base,bindings;try{base=new URL(process.env.KWH_HA_URL);bindings=JSON.parse(process.env.KWH_HA_ENTITIES);if(!['http:','https:'].includes(base.protocol)||base.username||base.password||!Array.isArray(bindings)||!bindings.length||bindings.length>40)throw Error();}catch{throw new HttpError(503,'La configuración local de sensores necesita revisión.');}
 const output=[],deadline=AbortSignal.timeout(8000);
 try{for(const b of bindings){if(!b||!/^\b(sensor|binary_sensor)\.[a-z0-9_]+$/.test(b.entity)||typeof b.zone!=='string'||!b.zone.trim()||b.zone.length>80||!['power','energy','occupancy','temperature','humidity'].includes(b.type))throw Error('binding');
   const response=await fetch(new URL('/api/states/'+b.entity,base),{headers:{Authorization:'Bearer '+process.env.KWH_HA_TOKEN},signal:AbortSignal.any([deadline,AbortSignal.timeout(3000)]),redirect:'error'});if(!response.ok)throw Error('upstream');const state=await response.json();if(['unavailable','unknown'].includes(state.state))continue;
   let value;const unit=state.attributes?.unit_of_measurement;
   if(b.type==='occupancy'){if(!['on','off'].includes(state.state))continue;value=state.state==='on';}
   else{value=Number(state.state);if(!Number.isFinite(value))continue;if(b.type==='power'){if(unit==='kW')value*=1000;else if(unit!=='W')continue;}if(b.type==='energy'){if(unit==='Wh')value/=1000;else if(unit!=='kWh')continue;}if(b.type==='temperature'&&unit!=='°C')continue;if(b.type==='humidity'&&unit!=='%')continue;}
   output.push({id:b.entity+':'+state.last_updated,zone:b.zone.trim(),type:b.type,value,at:state.last_updated,source:'Home Assistant · '+b.entity,origin:'home-assistant'});
  }
 }catch{throw new HttpError(502,'No se pudieron leer los sensores configurados. No se cambiaron dispositivos ni se inventaron lecturas.');}
 if(!output.length)throw new HttpError(502,'Los sensores no devolvieron lecturas compatibles disponibles. Revisa estado, unidades y vinculación.');return output;
}
