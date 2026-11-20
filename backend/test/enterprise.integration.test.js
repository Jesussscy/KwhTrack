// Requiere MySQL con migraciones 002-004 aplicadas y backend/.env: npm run test:mysql:org
import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {once} from 'node:events';
import {createAppServer} from '../server.js';
import {configured,closeDatabase,database} from '../src/database.js';

test('MySQL real empresarial: aislamiento, revisiones, plan, copia',{skip:!configured()},async t=>{
 const server=createAppServer();server.listen(0,'127.0.0.1');await once(server,'listening');
 const base='http://127.0.0.1:'+server.address().port,emails=[];
 async function req(path,{method='GET',body,acct,origin=base}={}){
  const h={Origin:origin};if(body!==undefined)h['Content-Type']='application/json';if(acct){h.Cookie=acct.cookie;h['X-CSRF-Token']=acct.csrf;}
  const r=await fetch(base+'/api/org'+path,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body)});
  return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')};
 }
 async function register(name){const email=randomUUID()+'@kwhtrack.test';emails.push(email);
  const r=await req('/auth/register',{method:'POST',body:{name,organization:'Org '+name,email,password:randomUUID()+'-Test',role:'admin',organization_id:1}});
  assert.equal(r.status,201);return {cookie:r.cookie.split(';')[0],csrf:r.data.csrfToken,email};}
 const mut=async(a,path,method,body={})=>{const r=await req(path,{method,acct:a,body:{revision:a.rev,...body}});if(r.status<300&&r.data.building)a.rev=r.data.building.revision;return r;};
 try{
  const a=await register('A'),b=await register('B');
  await t.test('sin sesión, origen externo y CSRF',async()=>{
   assert.equal((await req('/buildings')).status,401);
   assert.equal((await req('/auth/register',{method:'POST',origin:'http://externo.test',body:{}})).status,403);
   const noCsrf=await fetch(base+'/api/org/buildings',{method:'POST',headers:{Origin:base,'Content-Type':'application/json',Cookie:a.cookie},body:'{}'});assert.equal(noCsrf.status,403);});
  let build;
  await t.test('crear edificio con pisos y espacios; privilegios del navegador ignorados',async()=>{
   const r=await req('/buildings',{method:'POST',acct:a,body:{name:'Sede',floors:[{name:'P1'},{name:'P2'}],spacesPerFloor:2}});assert.equal(r.status,201);
   build=r.data.building;a.rev=build.revision;assert.equal(build.floors.length,2);assert.equal(build.floors[0].spaces[1].slot,1);
   const s=await req('/session',{acct:a});assert.equal(s.data.user.role,'owner');});
  await t.test('otra organización no ve ni edita',async()=>{
   assert.equal((await req('/buildings/'+build.id,{acct:b})).status,404);
   assert.equal((await req('/buildings',{acct:b})).data.buildings.length,0);
   const sp=build.floors[0].spaces[0].id;
   assert.equal((await req('/spaces/'+sp,{method:'PATCH',acct:b,body:{revision:0,name:'x',kind:'Otro'}})).status,404);
   assert.equal((await req('/spaces/'+sp+'/equipment',{method:'POST',acct:b,body:{revision:0,name:'x',quantity:1}})).status,404);
   assert.equal((await req('/buildings/'+build.id,{method:'DELETE',acct:b,body:{revision:0}})).status,404);});
  let eq;
  await t.test('equipos: cálculo, validación y conflicto de revisión',async()=>{
   const sp=build.floors[0].spaces[0].id;
   assert.equal((await mut(a,`/spaces/${sp}/equipment`,'POST',{name:'Aire',category:'Aire acondicionado',quantity:4,watts:1200,hours:8,days:22,factor:1})).status,201);
   const bad=await mut(a,`/spaces/${sp}/equipment`,'POST',{name:'x',quantity:-1,watts:5});assert.equal(bad.status,400);
   const cur=(await req('/buildings/'+build.id,{acct:a})).data.building;eq=cur.floors[0].spaces[0].equipment[0];assert.equal(eq.calc.kwh,844.8);assert.equal(cur.totals.kwh,844.8);
   const stale=await req('/equipment/'+eq.id,{method:'PATCH',acct:a,body:{revision:cur.revision-1,name:'Aire',quantity:4,watts:1,hours:1,days:1}});assert.equal(stale.status,409);assert.equal(stale.data.code,'REVISION_CONFLICT');
   a.rev=cur.revision;});
  await t.test('pausar, esencial y plan transaccional',async()=>{
   const r=await mut(a,'/equipment/'+eq.id,'PATCH',{name:'Aire',category:'Aire acondicionado',quantity:4,watts:1200,hours:8,days:22,essential:true});assert.equal(r.status,200);
   const blocked=await mut(a,`/buildings/${build.id}/plan`,'POST',{changes:[{equipmentId:eq.id,hours:2}]});assert.equal(blocked.status,400);
   await mut(a,'/equipment/'+eq.id,'PATCH',{name:'Aire',category:'Aire acondicionado',quantity:4,watts:1200,hours:8,days:22,essential:false});
   const ok=await mut(a,`/buildings/${build.id}/plan`,'POST',{changes:[{equipmentId:eq.id,hours:4}]});assert.equal(ok.status,200);assert.equal(ok.data.building.floors[0].spaces[0].equipment[0].calc.kwh,422.4);
   const bOther=await req(`/buildings/${build.id}/plan`,{method:'POST',acct:b,body:{revision:0,changes:[{equipmentId:eq.id,hours:1}]}});assert.equal(bOther.status,404);
   const p=await mut(a,'/equipment/'+eq.id,'PATCH',{name:'Aire',category:'Aire acondicionado',quantity:4,watts:1200,hours:4,days:22,active:false});assert.equal(p.data.building.totals.kwh,0);
   assert.equal((await mut(a,`/buildings/${build.id}/plan`,'POST',{changes:[{equipmentId:eq.id,hours:1}]})).status,400);
   await mut(a,'/equipment/'+eq.id,'PATCH',{name:'Aire',category:'Aire acondicionado',quantity:4,watts:null,hours:4,days:22,active:true});
   assert.equal((await mut(a,`/buildings/${build.id}/plan`,'POST',{changes:[{equipmentId:eq.id,hours:1}]})).status,400);
   await mut(a,'/equipment/'+eq.id,'PATCH',{name:'Aire',category:'Aire acondicionado',quantity:4,watts:1200,hours:4,days:22,active:false});});
  await t.test('duplicar piso, mover equipo y no cruzar edificios',async()=>{
   const d=await mut(a,`/floors/${build.floors[0].id}/duplicate`,'POST',{withInventory:true});assert.equal(d.status,201);assert.equal(d.data.building.floors.length,3);
   const f3=d.data.building.floors[2];assert.notEqual(f3.id,build.floors[0].id);assert.equal(f3.spaces[0].equipment.length,1);
   const mv=await mut(a,`/equipment/${eq.id}/move`,'POST',{spaceId:build.floors[1].spaces[0].id});assert.equal(mv.status,201);
   const other=(await req('/buildings',{method:'POST',acct:a,body:{name:'Otra',floors:[{name:'X'}],spacesPerFloor:1}})).data.building;
   assert.equal((await mut(a,`/equipment/${eq.id}/move`,'POST',{spaceId:other.floors[0].spaces[0].id})).status,404);
   const mu=await mut(a,`/floors/${build.floors[0].id}/move`,'POST',{direction:'up'});assert.equal(mu.status,200);});
  await t.test('registros: solapamiento y copia/importación sin sustituir',async()=>{
   assert.equal((await mut(a,`/buildings/${build.id}/records`,'POST',{start:'2026-02-30',end:'2026-03-01',kwh:100,origin:'bill'})).status,400);
   assert.equal((await mut(a,`/buildings/${build.id}`,'PATCH',{name:'Sede',budget:{tariffRate:1000,tariffSource:'Contrato de prueba',tariffDate:'2026-04-31'}})).status,400);
   assert.equal((await req('/buildings/'+build.id,{acct:a})).data.building.records.length,0);
   assert.equal((await mut(a,`/buildings/${build.id}/records`,'POST',{start:'2026-01-01',end:'2026-01-31',kwh:100,origin:'bill'})).status,201);
   assert.equal((await mut(a,`/buildings/${build.id}/records`,'POST',{start:'2026-01-15',end:'2026-02-15',kwh:100,origin:'bill'})).status,400);
   const exp=(await req('/export',{acct:a})).data;assert.equal(exp.product,'kwhtrack-empresas');
   const before=(await req('/buildings',{acct:a})).data.buildings.length;
   const imp=await req('/import',{method:'POST',acct:a,body:{data:exp}});assert.equal(imp.status,201);
   assert.equal((await req('/buildings',{acct:a})).data.buildings.length,before+exp.buildings.length);
   assert.equal((await req('/import',{method:'POST',acct:a,body:{data:{product:'otro',version:1,buildings:[]}}})).status,400);
   assert.equal((await req('/buildings',{acct:b})).data.buildings.length,0);});
  await t.test('eliminar edificio en cascada',async()=>{
   const r=await mut(a,'/buildings/'+build.id,'DELETE');assert.equal(r.data.deleted,true);assert.equal((await req('/buildings/'+build.id,{acct:a})).status,404);});
 }finally{
  try{const db=await database();for(const e of emails){const [u]=await db.execute('SELECT organization_id FROM org_users WHERE email=?',[e]);if(u[0])await db.execute('DELETE FROM organizations WHERE id=?',[u[0].organization_id]);}}catch{}
  await new Promise(r=>server.close(r));await closeDatabase();
 }
});

test('MySQL real empresarial II: distribución, medidores, comunes y deshacer',{skip:!configured()},async t=>{
 const {measured}=(await import('node:module')).createRequire(import.meta.url)('../../frontend/enterprise-calc-client.js');
 const server=createAppServer();server.listen(0,'127.0.0.1');await once(server,'listening');
 const base='http://127.0.0.1:'+server.address().port,emails=[];
 async function req(path,{method='GET',body,acct}={}){const h={Origin:base};if(body!==undefined)h['Content-Type']='application/json';if(acct){h.Cookie=acct.cookie;h['X-CSRF-Token']=acct.csrf;}
  const r=await fetch(base+'/api/org'+path,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')};}
 async function register(n){const email=randomUUID()+'@kwhtrack.test';emails.push(email);const r=await req('/auth/register',{method:'POST',body:{name:n,organization:'Org '+n,email,password:randomUUID()+'-Test'}});return {cookie:r.cookie.split(';')[0],csrf:r.data.csrfToken};}
 const mut=async(a,path,method,body={})=>{const r=await req(path,{method,acct:a,body:{revision:a.rev,...body}});if(r.status<300&&r.data.building)a.rev=r.data.building.revision;return r;};
 try{
  const a=await register('A'),b=await register('B');
  const bld=(await req('/buildings',{method:'POST',acct:a,body:{name:'Torre',floors:[{name:'P1'}],spacesPerFloor:3}})).data.building;a.rev=bld.revision;
  const floor=bld.floors[0],[s1,s2,s3]=floor.spaces;
  await t.test('distribución: valida límites y solapamientos, persiste y es atómica',async()=>{
   const ok=await mut(a,`/floors/${floor.id}/layout`,'PATCH',{spaces:[{id:s1.id,x:0,y:0,w:6,d:5},{id:s2.id,x:7,y:0,w:6,d:5},{id:s3.id,x:0,y:6,w:6,d:5}]});assert.equal(ok.status,200);
   assert.deepEqual(ok.data.building.floors[0].spaces[0].plan,{x:0,y:0,w:6,d:5});
   assert.equal((await mut(a,`/floors/${floor.id}/layout`,'PATCH',{spaces:[{id:s2.id,x:5,y:1,w:6,d:5}]})).status,400);
   assert.equal((await mut(a,`/floors/${floor.id}/layout`,'PATCH',{spaces:[{id:s2.id,x:15,y:0,w:6,d:5}]})).status,400);
   assert.equal((await mut(a,`/floors/${floor.id}/layout`,'PATCH',{spaces:[{id:s2.id,x:7,y:0,w:0.5,d:5}]})).status,400);
   assert.equal((await mut(a,`/floors/${floor.id}/layout`,'PATCH',{spaces:[{id:s2.id,x:null,y:0,w:2,d:2}]})).status,400);
   const again=(await req('/buildings/'+bld.id,{acct:a})).data.building;assert.equal(again.floors[0].spaces[1].plan.x,7);a.rev=again.revision;
   assert.equal((await req(`/floors/${floor.id}/layout`,{method:'PATCH',acct:b,body:{revision:0,spaces:[{id:s1.id,x:0,y:0,w:2,d:2}]}})).status,404);});
  await t.test('deshacer: solo la última operación, sin pisar cambios posteriores, ni entre organizaciones',async()=>{
   const before=(await req('/buildings/'+bld.id,{acct:a})).data.building;assert.equal(before.undo.op,'layout');
   assert.equal((await mut(a,`/buildings/${bld.id}/undo`,'POST')).status,200);
   const after=(await req('/buildings/'+bld.id,{acct:a})).data.building;a.rev=after.revision;assert.equal(after.floors[0].spaces[0].plan,null);assert.equal(after.undo,null);
   assert.equal((await mut(a,`/buildings/${bld.id}/undo`,'POST')).status,409);
   const c1=await mut(a,`/spaces/${s1.id}/equipment`,'POST',{name:'PC',category:'Computador',quantity:2,watts:100,hours:8,days:20});assert.equal(c1.status,201);assert.equal(c1.data.building.undo.op,'eq_create');
   const staleRev=a.rev;const other=await mut(a,`/floors/${floor.id}`,'PATCH',{name:'P1b'});assert.equal(other.status,200);
   const stale=await req(`/buildings/${bld.id}/undo`,{method:'POST',acct:a,body:{revision:staleRev}});assert.equal(stale.status,409);
   assert.equal((await req(`/buildings/${bld.id}/undo`,{method:'POST',acct:b,body:{revision:a.rev}})).status,404);
   const eid=c1.data.building.floors[0].spaces[0].equipment[0].id;
   const del=await mut(a,'/equipment/'+eid,'DELETE');assert.equal(del.data.building.undo.op,'eq_delete');
   const un=await mut(a,`/buildings/${bld.id}/undo`,'POST');assert.equal(un.status,200);assert.equal(un.data.building.floors[0].spaces[0].equipment[0].id,eid);});
  await t.test('medidores: lecturas monótonas por medidor, sin doble conteo general/sub',async()=>{
   await mut(a,`/buildings/${bld.id}/meters`,'POST',{name:'General',kind:'general',scope:'building'});
   let cur=(await req('/buildings/'+bld.id,{acct:a})).data.building;a.rev=cur.revision;const g=cur.meters[0];
   assert.equal((await mut(a,`/buildings/${bld.id}/meters`,'POST',{name:'Sub P1',kind:'sub',scope:'floor',floorId:floor.id,parentId:g.id})).status,201);
   assert.equal((await mut(a,`/buildings/${bld.id}/meters`,'POST',{name:'Mal',kind:'sub',scope:'floor',floorId:floor.id,parentId:999999})).status,400);
   cur=(await req('/buildings/'+bld.id,{acct:a})).data.building;a.rev=cur.revision;const sub=cur.meters[1];
   for(const [m,d,val] of [[g,'2026-01-01',1000],[g,'2026-02-01',1600],[sub,'2026-01-01',400],[sub,'2026-02-01',700]])assert.equal((await mut(a,`/meters/${m.id}/readings`,'POST',{date:d,value:val})).status,201);
   assert.equal((await mut(a,`/meters/${g.id}/readings`,'POST',{date:'2026-01-15',value:900})).status,400);
   assert.equal((await mut(a,`/meters/${g.id}/readings`,'POST',{date:'2026-01-15',value:1700})).status,400);
   assert.equal((await mut(a,`/meters/${g.id}/readings`,'POST',{date:'2026-02-01',value:1600})).status,400);
   assert.equal((await mut(a,`/meters/${g.id}/readings`,'POST',{date:'2999-01-01',value:9999})).status,400);
   cur=(await req('/buildings/'+bld.id,{acct:a})).data.building;a.rev=cur.revision;const r=measured(cur,'2026-01-01','2026-02-01');
   assert.equal(r.total,600);assert.equal(r.breakdown[0].unmetered,300);assert.equal(measured(cur,'2026-01-01','2026-03-01').total,null);
   assert.equal((await req(`/meters/${g.id}/readings`,{method:'POST',acct:b,body:{revision:0,date:'2026-03-01',value:2000}})).status,404);});
  await t.test('servicios comunes: se estiman aparte y no se reparten entre espacios',async()=>{
   const r=await mut(a,`/buildings/${bld.id}/common`,'POST',{name:'Ascensor',category:'Otro',quantity:2,watts:3000,hours:6,days:30});assert.equal(r.status,201);
   const t0=r.data.building.totals;assert.equal(t0.commonKwh,1080);assert.equal(t0.buildingKwh,t0.kwh+1080);
   assert.equal(r.data.building.floors[0].spaces.reduce((x,s)=>x+s.totals.kwh,0),t0.kwh);
   assert.equal((await req(`/buildings/${bld.id}/common`,{method:'POST',acct:b,body:{revision:0,name:'x',quantity:1}})).status,404);});
 }finally{
  try{const db=await database();for(const e of emails){const [u]=await db.execute('SELECT organization_id FROM org_users WHERE email=?',[e]);if(u[0])await db.execute('DELETE FROM organizations WHERE id=?',[u[0].organization_id]);}}catch{}
  await new Promise(r=>server.close(r));await closeDatabase();
 }
});

test('MySQL real empresarial III: espacios, copias v2 y deshacer ampliado',{skip:!configured()},async t=>{
 const server=createAppServer();server.listen(0,'127.0.0.1');await once(server,'listening');
 const base='http://127.0.0.1:'+server.address().port,emails=[];
 async function req(path,{method='GET',body,acct}={}){const h={Origin:base};if(body!==undefined)h['Content-Type']='application/json';if(acct){h.Cookie=acct.cookie;h['X-CSRF-Token']=acct.csrf;}
  const r=await fetch(base+'/api/org'+path,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')};}
 async function register(n){const email=randomUUID()+'@kwhtrack.test';emails.push(email);const r=await req('/auth/register',{method:'POST',body:{name:n,organization:'Org '+n,email,password:randomUUID()+'-Test'}});return {cookie:r.cookie.split(';')[0],csrf:r.data.csrfToken};}
 const mut=async(a,path,method,body={})=>{const r=await req(path,{method,acct:a,body:{revision:a.rev,...body}});if(r.status<300&&r.data.building)a.rev=r.data.building.revision;return r;};
 const get=async(a,id)=>{const r=(await req('/buildings/'+id,{acct:a})).data.building;a.rev=r.revision;return r;};
 try{
  const a=await register('A'),b=await register('B');
  let bld=(await req('/buildings',{method:'POST',acct:a,body:{name:'Torre',floors:[{name:'P1'},{name:'P2'}],spacesPerFloor:2}})).data.building;a.rev=bld.revision;
  const [f1,f2]=bld.floors;let cur;
  await t.test('duplicar espacio: ids nuevos, inventario opcional y deshacer',async()=>{
   const sp=f1.spaces[0];await mut(a,`/spaces/${sp.id}/equipment`,'POST',{name:'PC',category:'Computador',quantity:2,watts:100,hours:8,days:20});
   const d=await mut(a,`/spaces/${sp.id}/duplicate`,'POST',{floorId:f2.id,withInventory:true});assert.equal(d.status,201);
   const nf2=d.data.building.floors[1];const copy=nf2.spaces[nf2.spaces.length-1];assert.notEqual(copy.id,sp.id);assert.equal(copy.equipment.length,1);assert.notEqual(copy.equipment[0].id,d.data.building.floors[0].spaces[0].equipment[0].id);
   const d2=await mut(a,`/spaces/${sp.id}/duplicate`,'POST',{floorId:f2.id,withInventory:false});assert.equal(d2.data.building.floors[1].spaces.at(-1).equipment.length,0);
   assert.equal((await mut(a,`/buildings/${bld.id}/undo`,'POST')).status,200);
   assert.equal((await get(a,bld.id)).floors[1].spaces.length,f2.spaces.length+1);});
  await t.test('mover espacio: no cruza edificios ni organizaciones; el inventario viaja con el espacio',async()=>{
   const other=(await req('/buildings',{method:'POST',acct:a,body:{name:'Otra',floors:[{name:'X'}],spacesPerFloor:1}})).data.building;a.rev=(await get(a,bld.id)).revision;
   const sp=f1.spaces[0];assert.equal((await mut(a,`/spaces/${sp.id}/move`,'POST',{floorId:other.floors[0].id})).status,404);
   assert.equal((await req(`/spaces/${sp.id}/move`,{method:'POST',acct:b,body:{revision:0,floorId:f2.id}})).status,404);
   assert.equal((await mut(a,`/spaces/${sp.id}/move`,'POST',{floorId:f1.id})).status,400);
   const mv=await mut(a,`/spaces/${sp.id}/move`,'POST',{floorId:f2.id});assert.equal(mv.status,201);
   const moved=mv.data.building.floors[1].spaces.find(s=>s.id===sp.id);assert.equal(moved.equipment.length,1);assert.equal(mv.data.building.undo.op,'space_move');
   assert.equal((await mut(a,`/buildings/${bld.id}/undo`,'POST')).status,200);assert.ok((await get(a,bld.id)).floors[0].spaces.some(s=>s.id===sp.id));});
  await t.test('mover espacio con medidor exige confirmación y no reasigna lecturas',async()=>{
   await mut(a,`/buildings/${bld.id}/meters`,'POST',{name:'General',kind:'general',scope:'building'});let cur=await get(a,bld.id);const g=cur.meters[0],sp=f1.spaces[1];
   await mut(a,`/buildings/${bld.id}/meters`,'POST',{name:'Sub E',kind:'sub',scope:'space',spaceId:sp.id,parentId:g.id});cur=await get(a,bld.id);const sub=cur.meters[1];
   await mut(a,`/meters/${sub.id}/readings`,'POST',{date:'2026-01-01',value:10});
   const r=await mut(a,`/spaces/${sp.id}/move`,'POST',{floorId:f2.id});assert.equal(r.status,409);assert.equal(r.data.code,'METERS_CONFIRM');
   const ok=await mut(a,`/spaces/${sp.id}/move`,'POST',{floorId:f2.id,keepMeters:true});assert.equal(ok.status,201);
   const m=ok.data.building.meters.find(x=>x.id===sub.id);assert.equal(m.spaceId,sp.id);assert.equal(m.readings.length,1);assert.equal(m.readings[0].value,10);});
  await t.test('destino con distribución guardada: hueco válido o rechazo explícito',async()=>{
   cur=await get(a,bld.id);const fl=cur.floors[0];
   const rects=fl.spaces.map((s,i)=>({id:s.id,x:i%2?8.5:0,y:0,w:8,d:12}));assert.equal((await mut(a,`/floors/${fl.id}/layout`,'PATCH',{spaces:rects})).status,200);
   const mover=cur.floors[1].spaces[0];const full=await mut(a,`/spaces/${mover.id}/move`,'POST',{floorId:fl.id,keepMeters:true});assert.equal(full.status,400);assert.match(full.data.error,/hueco libre/);});
  await t.test('copia v2: exportar → importar → comparar y vista previa sin escribir',async()=>{
   cur=await get(a,bld.id);await mut(a,`/buildings/${bld.id}/common`,'POST',{name:'Ascensor',quantity:1,watts:3000,hours:6,days:30});
   await mut(a,`/buildings/${bld.id}/records`,'POST',{start:'2026-01-01',end:'2026-01-31',kwh:100,origin:'bill'});
   await mut(a,`/buildings/${bld.id}`,'PATCH',{name:'Torre',city:'Cartagena',budget:{monthlyBudget:1000000,tariffRate:900,tariffSource:'contrato',tariffDate:'2026-01-01'}});
   const exp=(await req('/export',{acct:a})).data;assert.equal(exp.version,5);
   const before=(await req('/buildings',{acct:a})).data.buildings.length;
   const dry=await req('/import',{method:'POST',acct:a,body:{data:exp,dryRun:true}});assert.equal(dry.status,200);assert.equal(dry.data.counts.buildings,exp.buildings.length);assert.ok(dry.data.counts.meters>=2);
   assert.equal((await req('/buildings',{acct:a})).data.buildings.length,before);
   const imp=await req('/import',{method:'POST',acct:a,body:{data:exp}});assert.equal(imp.status,201);
   const exp2=(await req('/export',{acct:a})).data;const norm=x=>JSON.stringify({...x,name:x.name.replace(/ \(importado\)$/,'')});
   const orig=exp.buildings.find(x=>x.name==='Torre'),copy=exp2.buildings.find(x=>x.name==='Torre (importado)');assert.ok(copy);assert.equal(norm(copy),norm(orig));
   assert.equal((await req('/export',{acct:b})).data.buildings.length,0);});
  await t.test('copia: rechaza referencias rotas, lecturas decrecientes, solapes y versión desconocida; acepta v1',async()=>{
   const good=(await req('/export',{acct:a})).data;const clone=()=>JSON.parse(JSON.stringify(good));
   const src=clone().buildings.find(x=>x.meters.length>1);
   let x=clone();x.buildings=[src];x.buildings[0].meters[1].floorRef='f999';x.buildings[0].meters[1].scope='floor';assert.equal((await req('/import',{method:'POST',acct:a,body:{data:x,dryRun:true}})).status,400);
   x=clone();x.buildings=[JSON.parse(JSON.stringify(src))];x.buildings[0].meters[0].readings=[{date:'2026-01-01',value:50},{date:'2026-02-01',value:10}];assert.equal((await req('/import',{method:'POST',acct:a,body:{data:x,dryRun:true}})).status,400);
   x=clone();x.buildings=[JSON.parse(JSON.stringify(src))];x.buildings[0].records=[{start:'2026-01-01',end:'2026-01-31',kwh:1,origin:'bill'},{start:'2026-01-15',end:'2026-02-15',kwh:1,origin:'bill'}];assert.equal((await req('/import',{method:'POST',acct:a,body:{data:x,dryRun:true}})).status,400);
   x=clone();x.version=9;assert.equal((await req('/import',{method:'POST',acct:a,body:{data:x,dryRun:true}})).status,400);
   const v1={product:'kwhtrack-empresas',version:1,buildings:[{name:'Antigua',floors:[{name:'P',spaces:[{name:'A',kind:'Oficina',equipment:[{name:'PC',category:'Computador',quantity:1,watts:100,hours:1,days:1}]}]}]}]};
   const r=await req('/import',{method:'POST',acct:a,body:{data:v1}});assert.equal(r.status,201);});
  await t.test('deshacer: eliminar espacio y piso con dependencias, mover equipo y registros; sin pisar cambios',async()=>{
   cur=await get(a,bld.id);const fl=cur.floors[1],sp=fl.spaces.find(s=>s.equipment.length)||fl.spaces[0];const nEq=sp.equipment.length;
   const del=await mut(a,'/spaces/'+sp.id,'DELETE');assert.equal(del.status,200);assert.equal(del.data.building.undo.op,'space_delete');
   assert.equal((await mut(a,`/buildings/${bld.id}/undo`,'POST')).status,200);const back=(await get(a,bld.id)).floors[1].spaces.find(s=>s.id===sp.id);assert.ok(back);assert.equal(back.equipment.length,nEq);
   const fd=await mut(a,'/floors/'+fl.id,'DELETE');assert.equal(fd.data.building.undo.op,'floor_delete');
   assert.equal((await mut(a,`/buildings/${bld.id}/undo`,'POST')).status,200);cur=await get(a,bld.id);assert.ok(cur.floors.some(f=>f.id===fl.id));
   const rec=(await get(a,bld.id)).records[0];const rd=await mut(a,'/records/'+rec.id,'DELETE');assert.equal(rd.data.building.undo.op,'rec_delete');
   assert.equal((await mut(a,`/buildings/${bld.id}/undo`,'POST')).status,200);assert.equal((await get(a,bld.id)).records.length,1);
   const f0=cur.floors.find(f=>f.spaces.some(s=>s.equipment.length));const e=f0.spaces.find(s=>s.equipment.length).equipment[0];const target=cur.floors.flatMap(f=>f.spaces).find(s=>s.id!==f0.spaces.find(q=>q.equipment.includes(e)).id);
   const mv=await mut(a,`/equipment/${e.id}/move`,'POST',{spaceId:target.id});assert.equal(mv.data.building.undo.op,'eq_move');
   const stale=a.rev;await mut(a,`/floors/${f0.id}`,'PATCH',{name:'Renombrado'});assert.equal((await req(`/buildings/${bld.id}/undo`,{method:'POST',acct:a,body:{revision:stale}})).status,409);});
 }finally{
  try{const db=await database();for(const e of emails){const [u]=await db.execute('SELECT organization_id FROM org_users WHERE email=?',[e]);if(u[0])await db.execute('DELETE FROM organizations WHERE id=?',[u[0].organization_id]);}}catch{}
  await new Promise(r=>server.close(r));await closeDatabase();
 }
});

test('MySQL real empresarial IV: configurar espacios (generador), atomicidad, copias v3 y deshacer',{skip:!configured()},async t=>{
 const server=createAppServer();server.listen(0,'127.0.0.1');await once(server,'listening');
 const base='http://127.0.0.1:'+server.address().port,emails=[];
 async function req(path,{method='GET',body,acct}={}){const h={Origin:base};if(body!==undefined)h['Content-Type']='application/json';if(acct){h.Cookie=acct.cookie;h['X-CSRF-Token']=acct.csrf;}
  const r=await fetch(base+'/api/org'+path,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')};}
 async function register(n){const email=randomUUID()+'@kwhtrack.test';emails.push(email);const r=await req('/auth/register',{method:'POST',body:{name:n,organization:'Org '+n,email,password:randomUUID()+'-Test'}});return {cookie:r.cookie.split(';')[0],csrf:r.data.csrfToken};}
 const mut=async(a,path,method,body={})=>{const r=await req(path,{method,acct:a,body:{revision:a.rev,...body}});if(r.status<300&&r.data.building)a.rev=r.data.building.revision;return r;};
 const get=async(a,id)=>{const r=(await req('/buildings/'+id,{acct:a})).data.building;a.rev=r.revision;return r;};
 const items=(k,c,size='standard',start=1)=>Array.from({length:c},(_,i)=>({name:`${k} ${start+i}`,kind:k,size}));
 try{
  const a=await register('A'),b=await register('B');
  let bld=(await req('/buildings',{method:'POST',acct:a,body:{name:'Torre',floors:[{name:'Piso 1'},{name:'Piso 2'},{name:'Piso 3'}],spacesPerFloor:0}})).data.building;a.rev=bld.revision;
  const [p1,p2,p3]=bld.floors;
  await t.test('Piso 3: cuatro oficinas y un lobby → cinco espacios distintos con distribución válida',async()=>{
   const r=await mut(a,`/floors/${p3.id}/configure`,'POST',{items:[...items('Lobby',1),...items('Oficina',4)],corridor:true,decor:true,variant:0});assert.equal(r.status,200);
   const f=r.data.building.floors[2];assert.equal(f.spaces.length,5);assert.equal(new Set(f.spaces.map(s=>s.id)).size,5);assert.equal(f.spaces.filter(s=>s.kind==='Oficina').length,4);assert.equal(f.spaces.filter(s=>s.kind==='Lobby').length,1);
   assert.ok(f.spaces.every(s=>s.plan&&s.plan.w>=1.5));assert.ok(f.config.corridorRect,'el corredor es un dato visual, no un espacio');assert.equal(r.data.building.floors[0].spaces.length,0);assert.equal(r.data.building.floors[1].spaces.length,0);});
  await t.test('el servidor recalcula la planta: ignora rectángulos enviados y rechaza propuestas imposibles de forma atómica',async()=>{
   const before=await get(a,bld.id);
   const forged=await mut(a,`/floors/${p1.id}/configure`,'POST',{items:items('Oficina',2),rects:[{x:-50,y:0,w:1,d:1}]});assert.equal(forged.status,200);
   assert.ok(forged.data.building.floors[0].spaces.every(s=>s.plan.x>=0&&s.plan.x+s.plan.w<=17));
   const many=await mut(a,`/floors/${p2.id}/configure`,'POST',{items:items('Oficina',17)});assert.equal(many.status,400);
   assert.equal((await get(a,bld.id)).floors[1].spaces.length,0,'un error no deja oficinas a medias');
   const nofit=await mut(a,`/floors/${p2.id}/configure`,'POST',{items:[{name:'Grande',kind:'Oficina',size:'standard',dims:{w:16,d:5}},{name:'Otra',kind:'Oficina',size:'standard',dims:{w:6,d:5}}]});assert.equal(nofit.status,400);assert.match(nofit.data.error,/no caben/i);
   assert.equal((await get(a,bld.id)).floors[1].spaces.length,0);void before;});
  await t.test('añadir sin recrear: conserva identidades, inventario y no elimina nada; exige conservar todo',async()=>{
   let cur=await get(a,bld.id);const f3=cur.floors[2],ger=f3.spaces.find(s=>s.name==='Oficina 1');
   await mut(a,`/spaces/${ger.id}/equipment`,'POST',{name:'Aire',category:'Aire acondicionado',quantity:2,watts:1200,hours:8,days:22});
   cur=await get(a,bld.id);const ids=cur.floors[2].spaces.map(s=>s.id);
   const keep=cur.floors[2].spaces.map(s=>({id:s.id,name:s.id===ger.id?'Gerencia':s.name,kind:s.id===ger.id?'Gerencia':s.kind,size:'standard'}));
   const rem=await mut(a,`/floors/${p3.id}/configure`,'POST',{items:keep.slice(1)});assert.equal(rem.status,400);assert.match(rem.data.error,/no elimina espacios/);
   const add=await mut(a,`/floors/${p3.id}/configure`,'POST',{items:[...keep,{name:'Oficina 5',kind:'Oficina',size:'compact'}]});assert.equal(add.status,200);
   const sp=add.data.building.floors[2].spaces;assert.equal(sp.length,6);for(const id of ids)assert.ok(sp.some(s=>s.id===id),'identidad conservada');
   const g=sp.find(s=>s.id===ger.id);assert.equal(g.name,'Gerencia');assert.equal(g.kind,'Gerencia');assert.equal(g.equipment.length,1);assert.equal(g.equipment[0].quantity,2);
   const other=await req(`/floors/${p3.id}/configure`,{method:'POST',acct:b,body:{revision:0,items:keep}});assert.equal(other.status,404);});
  await t.test('conflicto de revisión y deshacer de la configuración',async()=>{
   const stale=await req(`/floors/${p2.id}/configure`,{method:'POST',acct:a,body:{revision:a.rev-1,items:items('Oficina',2)}});assert.equal(stale.status,409);
   const cur=await get(a,bld.id);const n0=cur.floors[2].spaces.length;
   const r=await mut(a,`/floors/${p2.id}/configure`,'POST',{items:items('Oficina',3)});assert.equal(r.status,200);assert.equal(r.data.building.undo.op,'configure');
   assert.equal((await mut(a,`/buildings/${bld.id}/undo`,'POST')).status,200);const back=await get(a,bld.id);assert.equal(back.floors[1].spaces.length,0);assert.equal(back.floors[1].config,null);assert.equal(back.floors[2].spaces.length,n0);});
  await t.test('copia v3 conserva parámetros del generador y medidas declaradas; ida y vuelta idéntica',async()=>{
   await mut(a,`/floors/${p1.id}/configure`,'POST',{items:[{id:(await get(a,bld.id)).floors[0].spaces[0].id,name:'Oficina 1',kind:'Oficina',size:'standard',dims:{w:6,d:4}},{id:(await get(a,bld.id)).floors[0].spaces[1].id,name:'Oficina 2',kind:'Oficina',size:'wide'}],variant:1,corridor:false});
   const exp=(await req('/export',{acct:a})).data;assert.equal(exp.version,5);const f=exp.buildings[0].floors[0];assert.equal(f.layoutConfig.variant,1);assert.equal(f.spaces[0].dimsDeclared,true);assert.equal(f.spaces[1].dimsDeclared,false);
   const imp=await req('/import',{method:'POST',acct:a,body:{data:exp}});assert.equal(imp.status,201);
   const exp2=(await req('/export',{acct:a})).data;const norm=x=>JSON.stringify({...x,name:x.name.replace(/ \(importado\)$/,'')});
   assert.equal(norm(exp2.buildings.find(x=>x.name==='Torre (importado)')),norm(exp.buildings.find(x=>x.name==='Torre')));
   const bad=JSON.parse(JSON.stringify(exp));bad.buildings[0].floors[0].layoutConfig={v:1,variant:99,corridor:'x',corridorRect:{x:-5,y:0,w:99,d:1}};
   const dry=await req('/import',{method:'POST',acct:a,body:{data:bad,dryRun:true}});assert.equal(dry.status,200);});
 }finally{
  try{const db=await database();for(const e of emails){const [u]=await db.execute('SELECT organization_id FROM org_users WHERE email=?',[e]);if(u[0])await db.execute('DELETE FROM organizations WHERE id=?',[u[0].organization_id]);}}catch{}
  await new Promise(r=>server.close(r));await closeDatabase();
 }
});

test('MySQL real empresarial V: puestos, cubículos, superficie, copias v4 y deshacer',{skip:!configured()},async t=>{
 const server=createAppServer();server.listen(0,'127.0.0.1');await once(server,'listening');
 const base='http://127.0.0.1:'+server.address().port,emails=[];
 async function req(path,{method='GET',body,acct}={}){const h={Origin:base};if(body!==undefined)h['Content-Type']='application/json';if(acct){h.Cookie=acct.cookie;h['X-CSRF-Token']=acct.csrf;}
  const r=await fetch(base+'/api/org'+path,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')};}
 async function register(n){const email=randomUUID()+'@kwhtrack.test';emails.push(email);const r=await req('/auth/register',{method:'POST',body:{name:n,organization:'Org '+n,email,password:randomUUID()+'-Test'}});return {cookie:r.cookie.split(';')[0],csrf:r.data.csrfToken};}
 const mut=async(a,path,method,body={})=>{const r=await req(path,{method,acct:a,body:{revision:a.rev,...body}});if(r.status<300&&r.data.building)a.rev=r.data.building.revision;return r;};
 const get=async(a,id)=>{const r=(await req('/buildings/'+id,{acct:a})).data.building;a.rev=r.revision;return r;};
 try{
  const a=await register('A');
  let bld=(await req('/buildings',{method:'POST',acct:a,body:{name:'Torre',floors:[{name:'Piso 1'},{name:'Piso 2'}],spacesPerFloor:0}})).data.building;a.rev=bld.revision;
  const [p1,p2]=bld.floors;
  const conf=await mut(a,`/floors/${p1.id}/configure`,'POST',{items:[{name:'Oficina compartida',kind:'Oficina',size:'wide'},{name:'Cubículo A',kind:'Oficina',size:'compact'}]});assert.equal(conf.status,200);
  const [big,small]=conf.data.building.floors[0].spaces;
  await t.test('puestos: se guardan sin crear equipos y se restauran al recargar',async()=>{
   const r=await mut(a,`/spaces/${big.id}`,'PATCH',{name:big.name,kind:big.kind,workstations:8,occupied:5,deskMode:'open',areaM2:42.5});assert.equal(r.status,200);
   const s=r.data.building.floors[0].spaces.find(x=>x.id===big.id);assert.deepEqual([s.workstations,s.occupied,s.deskMode,s.areaM2],[8,5,'open',42.5]);assert.equal(s.equipment.length,0,'no se agregan computadores por puesto');
   const again=(await get(a,bld.id)).floors[0].spaces.find(x=>x.id===big.id);assert.equal(again.workstations,8);assert.equal(again.areaM2,42.5);assert.equal(again.equipment.length,0);});
  await t.test('validación: ocupados, máximos, cubículos y capacidad explicada',async()=>{
   const E=(extra)=>mut(a,`/spaces/${big.id}`,'PATCH',{name:big.name,kind:big.kind,...extra});
   assert.equal((await E({workstations:3,occupied:4})).status,400);assert.equal((await E({workstations:201})).status,400);assert.equal((await E({workstations:2.5})).status,400);assert.equal((await E({areaM2:0})).status,400);assert.equal((await E({deskMode:'otro'})).status,400);
   const full=await E({workstations:120,occupied:0});assert.equal(full.status,400);assert.match(full.data.error,/caben como máximo \d+/);
   const cub=await E({workstations:50,deskMode:'cubicle',occupied:null});assert.equal(cub.status,400);assert.match(cub.data.error,/cubículos/);
   const ok=await E({workstations:12,deskMode:'cubicle',occupied:6});assert.equal(ok.status,200);
   const sm=await mut(a,`/spaces/${small.id}`,'PATCH',{name:small.name,kind:small.kind,workstations:1});assert.equal(sm.status,200);});
  await t.test('un espacio pequeño o una distribución que no los deja caber se rechaza antes de guardar',async()=>{
   const cur=await get(a,bld.id),[b0,s0]=cur.floors[0].spaces;
   const tiny=await mut(a,`/floors/${p1.id}/layout`,'PATCH',{spaces:[{id:b0.id,x:0,y:0,w:2,d:2},{id:s0.id,x:5,y:0,w:2,d:2}]});assert.equal(tiny.status,400);assert.match(tiny.data.error,/no caben/);
   const unchanged=(await get(a,bld.id)).floors[0].spaces[0].plan;assert.ok(unchanged.w>3,'no se guardó nada');
   await mut(a,`/spaces/${s0.id}`,'PATCH',{name:s0.name,kind:s0.kind,workstations:null});
   const ok=await mut(a,`/floors/${p1.id}/layout`,'PATCH',{spaces:[{id:b0.id,x:0,y:0,w:12,d:12},{id:s0.id,x:13,y:0,w:2,d:2}]});assert.equal(ok.status,200);
   const conf2=await mut(a,`/floors/${p1.id}/configure`,'POST',{items:[{id:b0.id,name:b0.name,kind:b0.kind,size:'standard',workstations:4000},{id:s0.id,name:s0.name,kind:s0.kind,size:'standard'}]});assert.equal(conf2.status,400);});
  await t.test('duplicar espacio y piso conserva puestos y superficie; sin inventario ni medidores',async()=>{
   let cur=await get(a,bld.id);const b0=cur.floors[0].spaces.find(x=>x.id===big.id);
   const d=await mut(a,`/spaces/${big.id}/duplicate`,'POST',{floorId:p2.id,withInventory:false});assert.equal(d.status,201);
   const copy=d.data.building.floors[1].spaces.at(-1);assert.equal(copy.workstations,12);assert.equal(copy.areaM2,42.5);assert.equal(copy.deskMode,'cubicle');assert.notEqual(copy.id,big.id);
   assert.equal((await mut(a,`/buildings/${bld.id}/undo`,'POST')).status,200);assert.equal((await get(a,bld.id)).floors[1].spaces.length,0);
   const fd=await mut(a,`/floors/${p1.id}/duplicate`,'POST',{withInventory:false});assert.equal(fd.status,201);const nf=fd.data.building.floors.at(-1);assert.equal(nf.spaces.find(x=>x.name===b0.name).workstations,12);});
  await t.test('copia v4 conserva puestos, ocupación, disposición y superficie; ida y vuelta idéntica; v3 sigue importando',async()=>{
   const exp=(await req('/export',{acct:a})).data;assert.equal(exp.version,5);const sp=exp.buildings[0].floors[0].spaces.find(x=>x.name==='Oficina compartida');assert.deepEqual([sp.workstations,sp.occupied,sp.deskMode,sp.areaM2],[12,6,'cubicle',42.5]);
   assert.equal((await req('/import',{method:'POST',acct:a,body:{data:exp}})).status,201);
   const exp2=(await req('/export',{acct:a})).data;const norm=x=>JSON.stringify({...x,name:x.name.replace(/ \(importado\)$/,'')});
   assert.equal(norm(exp2.buildings.find(x=>x.name==='Torre (importado)')),norm(exp.buildings.find(x=>x.name==='Torre')));
   const bad=JSON.parse(JSON.stringify(exp));bad.buildings[0].floors[0].spaces[0].workstations=900;assert.equal((await req('/import',{method:'POST',acct:a,body:{data:bad,dryRun:true}})).status,400);
   const bad2=JSON.parse(JSON.stringify(exp));bad2.buildings[0].floors[0].spaces[0].occupied=999;assert.equal((await req('/import',{method:'POST',acct:a,body:{data:bad2,dryRun:true}})).status,400);
   const v3=JSON.parse(JSON.stringify(exp));v3.version=3;for(const f of v3.buildings[0].floors)for(const s of f.spaces){delete s.workstations;delete s.occupied;delete s.deskMode;delete s.areaM2;}assert.equal((await req('/import',{method:'POST',acct:a,body:{data:v3}})).status,201);});
  await t.test('deshacer: editar puestos y restaurar un espacio eliminado con sus puestos',async()=>{
   let cur=await get(a,bld.id);const s0=cur.floors[0].spaces.find(x=>x.id===big.id);
   const e=await mut(a,`/spaces/${big.id}`,'PATCH',{name:s0.name,kind:s0.kind,workstations:2,occupied:1,deskMode:'open',areaM2:null});assert.equal(e.data.building.undo.op,'space_edit');
   assert.equal((await mut(a,`/buildings/${bld.id}/undo`,'POST')).status,200);let back=(await get(a,bld.id)).floors[0].spaces.find(x=>x.id===big.id);assert.deepEqual([back.workstations,back.occupied,back.deskMode,back.areaM2],[12,6,'cubicle',42.5]);
   const del=await mut(a,'/spaces/'+big.id,'DELETE');assert.equal(del.status,200);assert.equal((await mut(a,`/buildings/${bld.id}/undo`,'POST')).status,200);
   back=(await get(a,bld.id)).floors[0].spaces.find(x=>x.id===big.id);assert.deepEqual([back.workstations,back.occupied,back.deskMode,back.areaM2],[12,6,'cubicle',42.5]);});
 }finally{
  try{const db=await database();for(const e of emails){const [u]=await db.execute('SELECT organization_id FROM org_users WHERE email=?',[e]);if(u[0])await db.execute('DELETE FROM organizations WHERE id=?',[u[0].organization_id]);}}catch{}
  await new Promise(r=>server.close(r));await closeDatabase();
 }
});
