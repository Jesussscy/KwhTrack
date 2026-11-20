import test from 'node:test';
import assert from 'node:assert/strict';
import {E,validateEnergy} from '../src/enterprise-energy.js';
import {computeBuilding} from '../src/enterprise-calc.js';
const profile=s=>({year:2023,source:'Curva de prueba explícita',retrievedAt:'2026-11-17T12:00:00Z',key:E.providerKey(s),hours:Array.from({length:12},()=>Array.from({length:24},(_,h)=>h>=8&&h<18?.3:0))});
test('solar conserva balances por hora y mes; energía combinada se recalcula sin sumar ahorros',()=>{
 const s={...E.defaults(),reduction:30},r=E.simulate(s,profile(s),Array(12).fill(1200),1000,600);
 for(const scenario of r.scenarios)for(const m of scenario.months){assert.ok(Math.abs(m.load-m.self-m.import)<1e-7);assert.ok(Math.abs(m.pv-m.self-m.export)<1e-7);assert.ok(m.import>=0&&m.export>=0);}
 assert.ok(Math.abs(r.scenarios[0].total.load-14400)<1e-7);assert.ok(Math.abs(r.scenarios[1].total.load-12240)<1e-7);assert.ok(Math.abs(r.scenarios[3].total.load-12240)<1e-7);
 assert.ok(r.scenarios[3].total.import<=r.scenarios[2].total.import);assert.ok(r.scenarios[3].total.self<=r.scenarios[2].total.self);assert.ok(r.scenarios[3].total.export>=r.scenarios[2].total.export);
});
test('demanda nocturna no autoconsume la producción del mediodía; sin baterías',()=>{
 const s={...E.defaults(),profile:Array.from({length:24},(_,h)=>h<6?1:0),profileSource:'Turno nocturno declarado'};
 const r=E.simulate(s,profile(s),Array(12).fill(300));assert.equal(r.scenarios[2].total.self,0);assert.equal(r.scenarios[2].total.import,3600);assert.ok(r.scenarios[2].total.export>0);assert.equal(r.scenarios[2].total.cost,null);
});
test('no solar deja compra igual a demanda; tarifa cero y energía cero son válidas',()=>{
 const s={...E.defaults(),panels:0};const r=E.simulate(s,profile(s),Array(12).fill(0),0);assert.equal(r.gridReduction,0);assert.equal(r.scenarios[3].total.cost,0);assert.equal(r.solarSelfUse,null);
});
test('solar rechaza área insuficiente, curva desactualizada, NaN y perfil sin energía',()=>{
 const s=E.defaults();assert.throws(()=>E.solarConfig({...s,area:1}),/área útil/);assert.throws(()=>E.simulate({...s,tilt:30},profile(s),Array(12).fill(300)),/otra ubicación/);assert.throws(()=>E.solarConfig({...s,wp:NaN}));assert.throws(()=>E.solarConfig({...s,profile:Array(24).fill(0)}));
});
test('pronóstico de seis meses no rellena otro medio año con demanda inventada',()=>{
 const s=E.defaults(),demands=Array(12).fill(null);for(const m of [11,0,1,2,3,4])demands[m]=1000;
 const r=E.simulate(s,profile(s),demands);assert.equal(r.monthCount,6);assert.ok(Math.abs(r.scenarios[0].total.load-6000)<1e-7);assert.equal(r.scenarios[0].months.length,6);
});
test('pasillos: suman una vez al piso, al edificio y al resumen, con incompletos explícitos',()=>{
 const z={id:'z',floorId:7,name:'Pasillo',equipment:[{id:'l',name:'LED',category:'Iluminación',mode:'power',quantity:6,watts:10,hours:8,days:30,factor:1},{id:'u',name:'Sin ficha',category:'Iluminación',quantity:1,mode:'power',watts:null,hours:1,days:1}]};
 const b=computeBuilding({id:1,floors:[{id:7,spaces:[]}],energy:{corridors:[z]},common:[]});assert.equal(b.totals.kwh,14.4);assert.equal(b.totals.buildingKwh,14.4);assert.equal(b.floors[0].totals.kwh,14.4);assert.equal(b.totals.unknownItems,1);
});
const rule={id:'r',enabled:true,zone:'P1',timeout:15,maxAge:5,kind:'lighting'};
const now=Date.parse('2026-11-17T12:00:00Z'),o=(minutes,value=false)=>({id:String(minutes),zone:'P1',type:'occupancy',value,at:new Date(now-minutes*60000).toISOString()});
test('automatización exige ausencia continua reciente; no interpreta potencia como ocupación',()=>{
 assert.equal(E.evaluate(rule,[],now).state,'unknown');assert.equal(E.evaluate(rule,[{...o(0),type:'power',value:0}],now).state,'unknown');assert.equal(E.evaluate(rule,[o(20)],now).state,'unknown');assert.equal(E.evaluate(rule,[o(1)],now).state,'waiting');assert.equal(E.evaluate(rule,[o(0),o(30)],now).state,'waiting');
 const reads=[0,4,8,12,16].map(x=>o(x)),r=E.evaluate(rule,reads,now);assert.equal(r.state,'proposal');assert.equal(r.commandSent,false);assert.equal(E.evaluate(rule,[o(0,true),...reads],now).state,'occupied');assert.equal(E.evaluate({...rule,essential:true},reads,now).state,'blocked');assert.equal(E.evaluate({...rule,override:true},reads,now).state,'blocked');
});
test('configuración no cruza pisos, no acepta valores de sensor falsos ni fechas futuras',()=>{
 assert.throws(()=>validateEnergy({corridors:[{id:'z',floorId:999,name:'x',equipment:[]}]},[1]));
 assert.throws(()=>E.validate({observations:[{id:'x',zone:'x',type:'occupancy',value:0,at:new Date().toISOString(),source:'Manual'}]},[]));
 assert.throws(()=>E.validate({observations:[{id:'x',zone:'x',type:'power',value:3,at:'2099-01-01',source:'Manual'}]},[]));
});

test('la API de productos reutiliza referencias y nunca presenta el catálogo como conexión comercial en vivo',async()=>{
 const {searchProducts}=await import('../src/enterprise-products.js');const r=await searchProducts('HP');assert.equal(r.live,false);assert.equal(r.provider,'catalogo-local');assert.ok(r.items.length>0);assert.ok(r.items.length<=8);assert.ok(r.items.some(x=>x.watts===0));
});
test('perfil conserva orden futuro y duración de febrero sin inventar los meses faltantes',()=>{
 const s=E.defaults(),d=Array(12).fill(null);d[11]=900;d[0]=950;d[1]=1000;
 const r=E.simulate(s,profile(s),d,null,0,{monthOrder:[11,0,1],monthDays:{11:31,0:31,1:29},monthLabels:{11:'2027-12',0:'2028-01',1:'2028-02'}});
 assert.deepEqual(r.scenarios[0].months.map(x=>x.label),['2027-12','2028-01','2028-02']);assert.equal(r.representativeMonth,11);assert.ok(Math.abs(r.scenarios[0].total.load-2850)<1e-7);
});

test('puente de sensores solo hace GET a entidades vinculadas y convierte unidades sin enviar acciones',async t=>{
 const {readSensors,sensorConfigured}=await import('../src/enterprise-sensors.js');const names=['KWH_HA_URL','KWH_HA_TOKEN','KWH_HA_BUILDING_ID','KWH_HA_ENTITIES'],old=Object.fromEntries(names.map(k=>[k,process.env[k]]));
 try{process.env.KWH_HA_URL='http://127.0.0.1:8123';process.env.KWH_HA_TOKEN='token-ficticio-para-prueba';process.env.KWH_HA_BUILDING_ID='4321';process.env.KWH_HA_ENTITIES=JSON.stringify([{entity:'sensor.power',type:'power',zone:'P1'},{entity:'binary_sensor.occupancy',type:'occupancy',zone:'P1'},{entity:'sensor.unavailable',type:'energy',zone:'P1'}]);
 const calls=[];t.mock.method(globalThis,'fetch',async(url,opts)=>{calls.push({url:String(url),opts});const entity=String(url).split('/').at(-1);return new Response(JSON.stringify({state:entity==='sensor.power'?'1.2':entity==='binary_sensor.occupancy'?'off':'unavailable',attributes:{unit_of_measurement:'kW'},last_updated:new Date().toISOString()}),{status:200});});
 assert.equal(sensorConfigured(4321),true);await assert.rejects(()=>readSensors(1234));const reads=await readSensors(4321);assert.equal(reads.length,2);assert.equal(reads[0].value,1200);assert.equal(reads[1].value,false);assert.ok(reads.every(r=>r.origin==='home-assistant'));assert.ok(calls.every(c=>c.url.includes('/api/states/')&&!c.opts.method));
 }finally{t.mock.restoreAll();for(const key of names)if(old[key]===undefined)delete process.env[key];else process.env[key]=old[key];}
});

test('el plan predictivo incluye circulación en la base y conserva sus horas hasta revisarlas manualmente',async()=>{
 const {createRequire}=await import('node:module'),Prediction=createRequire(import.meta.url)('../../frontend/enterprise-prediction.js');
 const b=computeBuilding({id:1,revision:0,records:[],floors:[{id:7,spaces:[]}],energy:{corridors:[{id:'z',floorId:7,name:'Pasillo',equipment:[{id:'l',name:'LED',category:'Iluminación',mode:'power',quantity:6,watts:10,hours:8,days:30,factor:1}]}]}});
 const plan=Prediction.propose(b,{goal:20});assert.equal(plan.inventory,14.4);assert.equal(plan.changes.length,0);assert.ok(plan.excluded.some(e=>e.reason.includes('Circulación')));
});
