import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {readFile} from 'node:fs/promises';
import {equipmentKwh,computeBuilding} from '../src/enterprise-calc.js';
import * as v from '../src/enterprise-validation.js';
import {createAppServer} from '../server.js';

test('fórmula de potencia y kWh mensuales sin doble multiplicación',()=>{
 assert.equal(equipmentKwh({mode:'power',quantity:4,watts:1200,hours:8,days:22,factor:1}).kwh,844.8);
 assert.equal(equipmentKwh({mode:'monthly',quantity:3,monthlyKwh:10,watts:9999,hours:24,days:31,factor:.1}).kwh,30);
});
test('datos desconocidos no se inventan ni se suman',()=>{
 const c=equipmentKwh({mode:'power',quantity:2,watts:null,hours:8,days:20,factor:1});
 assert.equal(c.kwh,null);assert.deepEqual(c.missing,['potencia (W)']);
 const b=computeBuilding({id:1,isDemo:false,floors:[{id:1,name:'P1',spaces:[{id:1,name:'A',kind:'Oficina',equipment:[{id:1,mode:'power',quantity:1,watts:1000,hours:1,days:10,factor:1},{id:2,mode:'power',quantity:1,watts:null,hours:1,days:1,factor:1}]},{id:2,name:'B',kind:'Otro',equipment:[]}]}]});
 assert.equal(b.totals.kwh,10);assert.equal(b.totals.unknownItems,1);assert.equal(b.totals.spacesMissingData,2);assert.equal(b.origin,'estimación por inventario');
});
test('validación rechaza valores fuera de rango y no acepta campos de privilegio',()=>{
 assert.throws(()=>v.equipment({name:'x',quantity:0,watts:1}));
 assert.throws(()=>v.equipment({name:'x',quantity:1,watts:-5}));
 assert.throws(()=>v.equipment({name:'x',quantity:1,watts:5,hours:25}));
 assert.throws(()=>v.equipment({name:'x',quantity:1.5,watts:5}));
 assert.equal(v.equipment({name:'x',quantity:1}).watts,null);
 const c=v.credentialsOrg({name:'A',organization:'Org',email:'A@B.co',password:'una contraseña larga',role:'admin',org_role:'owner',organization_id:9},{register:true});
 assert.equal(c.role,undefined);assert.equal(c.organization_id,undefined);
 assert.throws(()=>v.id('1; DROP'));assert.throws(()=>v.record({start:'2026-02-01',end:'2026-01-01',kwh:1,origin:'bill'}));
});
test('ruta /empresarial se sirve, la API exige sesión y la app doméstica no enlaza a ella',async()=>{
 const server=createAppServer();server.listen(0,'127.0.0.1');await once(server,'listening');const base='http://127.0.0.1:'+server.address().port;
 try{
  const page=await fetch(base+'/empresarial');assert.equal(page.status,200);assert.match(await page.text(),/kwhTrack Empresas/);
  const g=await fetch(base+'/models/KWH-Empresarial.glb');assert.equal(g.status,200);assert.equal(g.headers.get('content-type'),'model/gltf-binary');assert.equal((await g.arrayBuffer()).byteLength>1e6,true);assert.equal((await fetch(base+'/enterprise-glb.js')).status,200);
  const s=await (await fetch(base+'/api/org/session')).json();assert.equal(s.authenticated,false);
  const r=await fetch(base+'/api/org/buildings');assert.ok([401,503].includes(r.status));
  const post=await fetch(base+'/api/org/buildings',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});assert.ok([401,503].includes(post.status));
  for(const f of ['index.html','app.js','experience.js','accounts.js','appliance-finder.js','energy-experience.js','bill-experience.js']){const t=await readFile(new URL('../../frontend/'+f,import.meta.url),'utf8');assert.equal(/empresarial/i.test(t),false,f+' no debe mencionar /empresarial');}
 }finally{await new Promise(r=>server.close(r));}
});

test('demostración: 3 pisos (4, 6 y 4 espacios) y caso de 4 aires + 3 luminarias coherente',async()=>{
 const {createRequire}=await import('node:module');const D=createRequire(import.meta.url)('../../frontend/enterprise-demo.js');
 assert.deepEqual(D.floors.map(f=>f.spaces.length),[4,6,4]);
 const a=D.floors[0].spaces[0].eq;assert.equal(a.find(e=>e.category==='Aire acondicionado').quantity,4);assert.equal(a.find(e=>e.category==='Iluminación').quantity,3);
 const b=computeBuilding({id:1,isDemo:true,floors:D.floors.map((f,i)=>({id:i+1,name:f.name,order:i,spaces:f.spaces.map((s,j)=>({id:i*10+j,name:s.name,kind:s.kind,slot:null,equipment:s.eq.map((e,k)=>({id:k,name:e.name,category:e.category,mode:'power',factor:1,monthlyKwh:null,...e}))}))}))});
 assert.equal(b.floors[0].spaces[0].equipment[0].calc.kwh,844.8);assert.equal(b.origin,'demostración');
});

test('presupuesto, plan y equipo pausado',()=>{
 assert.equal(v.budget({tariffRate:900,tariffSource:'Factura oct'}).tariffRate,900);
 assert.throws(()=>v.budget({tariffRate:900}));assert.throws(()=>v.budget({tariffRate:-1,tariffSource:'x'}));
 assert.throws(()=>v.planChanges([]));assert.throws(()=>v.planChanges([{equipmentId:1,hours:30}]));assert.throws(()=>v.planChanges([{equipmentId:1,hours:1},{equipmentId:1,days:2}]));
 assert.equal(v.planChanges([{equipmentId:2,hours:4}])[0].days,null);
 const p=equipmentKwh({mode:'power',quantity:2,watts:100,hours:1,days:1,factor:1,active:false});assert.equal(p.status,'paused');
 const b=computeBuilding({id:1,floors:[{id:1,name:'P',spaces:[{id:1,name:'A',kind:'x',equipment:[{id:1,mode:'power',quantity:1,watts:1000,hours:1,days:10,factor:1},{id:2,mode:'power',quantity:1,watts:1000,hours:1,days:10,factor:1,active:false}]}]}]});
 assert.equal(b.totals.kwh,10);assert.equal(b.totals.unknownItems,0);
});

test('distribución: límites, tamaño mínimo, solapamientos y cuadrícula automática',async()=>{
 const {createRequire}=await import('node:module');const L=createRequire(import.meta.url)('../../frontend/enterprise-layout.js');
 assert.deepEqual(L.validate([{id:1,x:0,y:0,w:5,d:5},{id:2,x:5,y:0,w:5,d:5}]),[]);
 assert.ok(L.validate([{id:1,x:0,y:0,w:5,d:5},{id:2,x:4.9,y:0,w:5,d:5}]).length);
 assert.ok(L.validate([{id:1,x:16,y:0,w:2,d:2}]).length);assert.ok(L.validate([{id:1,x:0,y:0,w:1,d:2}]).length);
 assert.ok(L.validate([{id:1,x:NaN,y:0,w:2,d:2}]).length);assert.ok(L.validate([{id:1,x:0,y:0,w:Infinity,d:2}]).length);
 for(const n of [1,4,6,9,12])assert.deepEqual(L.validate(L.auto(n).map((r,i)=>({id:i,...r}))),[],'auto '+n);
});

test('medidores: intervalos solo del mismo medidor, sin doble conteo y sin interpolar',async()=>{
 const {createRequire}=await import('node:module');const C=createRequire(import.meta.url)('../../frontend/enterprise-calc-client.js');
 const b={meters:[{id:1,kind:'general',scope:'building',parentId:null,readings:[{date:'2026-01-01',value:1000},{date:'2026-02-01',value:1600}]},
  {id:2,kind:'sub',scope:'floor',parentId:1,readings:[{date:'2026-01-01',value:50},{date:'2026-02-01',value:350}]},
  {id:3,kind:'general',scope:'building',parentId:null,readings:[{date:'2026-01-01',value:10}]}]};
 let m=C.measured(b,'2026-01-01','2026-02-01');
 assert.equal(m.total,null);assert.equal(m.partialTotal,600);                       // falta lectura del medidor 3: total incompleto
 assert.equal(m.breakdown[0].unmetered,300);                                        // 600 general − 300 sub, el sub no se suma al total
 b.meters.pop();m=C.measured(b,'2026-01-01','2026-02-01');assert.equal(m.total,600);
 assert.equal(C.meterKwh(b.meters[0],'2026-02-01','2026-01-01').kwh,null);
 assert.equal(C.meterKwh(b.meters[0],'2026-01-15','2026-02-01').kwh,null);          // sin lectura exacta: no interpola
 assert.equal(C.meterKwh({readings:[{date:'2026-01-01',value:10},{date:'2026-02-01',value:5}]},'2026-01-01','2026-02-01').kwh,null);
});

test('servicios comunes: se suman al edificio pero no a los espacios',async()=>{
 const b=computeBuilding({id:1,floors:[{id:1,name:'P',spaces:[{id:1,name:'A',kind:'x',equipment:[{id:1,mode:'power',quantity:1,watts:1000,hours:1,days:10,factor:1}]}]}],common:[{id:9,name:'Ascensor',category:'Otro',mode:'power',quantity:2,watts:3000,hours:6,days:30,factor:1,active:true},{id:10,name:'Bomba',category:'Otro',mode:'power',quantity:1,watts:null,hours:1,days:1,factor:1}]});
 assert.equal(b.totals.kwh,10);assert.equal(b.totals.commonKwh,1080);assert.equal(b.totals.buildingKwh,1090);assert.equal(b.totals.commonUnknown,1);
});

test('generador de planta: casos del encargo, determinismo y rechazo explícito',async()=>{
 const {createRequire}=await import('node:module');const L=createRequire(import.meta.url)('../../frontend/enterprise-layout.js');
 const mk=(k,c,size='standard')=>Array.from({length:c},(_,i)=>({ref:k+i,kind:k,size}));
 const rectsOf=g=>g.rects.map(r=>({id:r.ref,name:r.ref,...r}));
 for(const [n,items] of [['2 oficinas',mk('Oficina',2)],['4 oficinas + lobby',[...mk('Oficina',4),...mk('Lobby',1)]],['6 oficinas',mk('Oficina',6)],['12 oficinas',mk('Oficina',12)],['1 oficina',mk('Oficina',1)]]){
  const g=L.generate(items);assert.equal(g.ok,true,n);assert.equal(g.rects.length,items.length,n);assert.deepEqual(L.validate(rectsOf(g)),[],n);}
 const five=L.generate([...mk('Oficina',4),...mk('Lobby',1)]);assert.equal(five.rects.length,5);assert.ok(five.corridor,'corredor visual, no es un espacio');
 assert.equal(new Set(five.rects.map(r=>r.ref)).size,5);
 assert.equal(JSON.stringify(L.generate(mk('Oficina',5))),JSON.stringify(L.generate(mk('Oficina',5))));          // determinista
 assert.notEqual(JSON.stringify(L.generate(mk('Oficina',5),{variant:1}).rects),JSON.stringify(L.generate(mk('Oficina',5)).rects)); // variante distinta
 const wide=L.generate([{ref:'a',kind:'Oficina',size:'wide'},{ref:'b',kind:'Oficina',size:'compact'}]);assert.ok(wide.rects[0].w*wide.rects[0].d>wide.rects[1].w*wide.rects[1].d||wide.rects[0].w>wide.rects[1].w);
 const tooMany=L.generate(mk('Oficina',17));assert.equal(tooMany.ok,false);assert.match(tooMany.error,/hasta 16/);
 const noFit=L.generate([{ref:'x',kind:'Oficina',size:'standard',dims:{w:15,d:5}},{ref:'y',kind:'Oficina',size:'standard',dims:{w:5,d:5}}]);assert.equal(noFit.ok,false);assert.match(noFit.error,/no caben/i);
 const declared=L.generate([{ref:'x',kind:'Oficina',size:'standard',dims:{w:4,d:4}},{ref:'y',kind:'Oficina',size:'standard'}]);assert.equal(declared.rects[0].w,4);assert.equal(declared.rects[0].declared,true);assert.equal(declared.rects[1].declared,false);
});

test('qué consume más: ranking y explicación calculados del inventario, sin ganar por nombre ni cantidad',async()=>{
 const {createRequire}=await import('node:module');const C=createRequire(import.meta.url)('../../frontend/enterprise-calc-client.js');
 const E=(id,name,category,quantity,watts,hours,days)=>({id,name,category,mode:'power',quantity,watts,hours,days,factor:1,monthlyKwh:null});
 const b=C.computeBuilding({id:1,floors:[{id:1,name:'Piso 3',spaces:[
  {id:1,name:'Gerencia',kind:'Gerencia',equipment:[E(1,'Aire','Aire acondicionado',2,1200,8,22)]},
  {id:2,name:'Oficina 1',kind:'Oficina',equipment:[E(2,'PC','Computador',10,150,8,22),E(3,'Foco','Iluminación',6,18,10,22)]},
  {id:3,name:'Oficina 2',kind:'Oficina',equipment:[E(4,'Aire','Aire acondicionado',1,null,8,22)]},
  {id:4,name:'Lobby',kind:'Lobby',equipment:[]}]}]});
 const x=C.explainFloor(b.floors[0]);
 assert.equal(x.top.name,'Gerencia');assert.equal(+x.top.kwh.toFixed(1),422.4);                 // 2 × 1200 W × 8 h × 22 d / 1000
 assert.ok(x.top.units<x.spaces.find(s=>s.name==='Oficina 1').units);                          // gana con menos aparatos: pesa la potencia y el uso
 assert.equal(x.provisional,true);assert.match(x.sentences.join(' '),/mayor consumo conocido/);assert.match(x.sentences.join(' '),/Oficina 2/);assert.match(x.sentences.join(' '),/Lobby/);
 assert.equal(x.ranked.some(s=>s.name==='Oficina 2'),false);                                    // potencia desconocida: no entra al ranking
 assert.ok(Math.abs(x.categories.reduce((a,c)=>a+c.kwh,0)-x.totalKnown)<1e-9);                 // las categorías suman el total conocido
 assert.equal(x.lines[0].method.includes('1200 W'),true);
 const none=C.explainFloor(C.computeBuilding({id:1,floors:[{id:1,name:'P',spaces:[{id:1,name:'A',kind:'x',equipment:[]}]}]}).floors[0]);
 assert.equal(none.top,null);assert.equal(none.totalKnown,0);assert.equal(none.spaces[0].kwh,null);assert.match(none.sentences[0],/no hay datos suficientes/);
});

test('puestos y superficie: indicadores con denominador visible y sin inventar datos',async()=>{
 const {createRequire}=await import('node:module');const require=createRequire(import.meta.url);const C=require('../../frontend/enterprise-calc-client.js'),L=require('../../frontend/enterprise-layout.js');
 const E=(id,name,category,quantity,watts,hours,days)=>({id,name,category,mode:'power',quantity,watts,hours,days,factor:1,monthlyKwh:null});
 const b=C.computeBuilding({id:1,floors:[{id:1,name:'P',spaces:[
  {id:1,name:'Compartida',kind:'Oficina',workstations:10,occupied:6,areaM2:50,equipment:[E(1,'PC','Computador',6,150,8,22),E(2,'Aire','Aire acondicionado',2,1200,8,22)]},
  {id:2,name:'Abierta',kind:'Oficina',workstations:4,occupied:null,areaM2:null,equipment:[E(3,'PC','Computador',4,150,8,22)]},
  {id:3,name:'Sin datos',kind:'Oficina',workstations:5,occupied:2,areaM2:30,equipment:[E(4,'PC','Computador',5,null,8,22)]},
  {id:4,name:'Sin puestos',kind:'Otro',workstations:null,areaM2:null,equipment:[E(5,'Foco','Iluminación',3,18,10,22)]}]}]});
 const f=b.floors[0],x=C.indicators(f.spaces);
 const k1=f.spaces[0].totals.kwh,k2=f.spaces[1].totals.kwh;
 assert.equal(x.perDesk.denominator,14);assert.ok(Math.abs(x.perDesk.value-(k1+k2)/14)<1e-9);                // solo espacios con puestos Y datos; el espacio sin datos no entra
 assert.equal(x.perDesk.partial,true);assert.equal(x.perDesk.spaces,2);assert.equal(x.perDesk.spacesWithDesksTotal,3);
 assert.equal(x.perOccupied,null,'un espacio sin ocupación declarada impide calcular kWh por puesto ocupado');
 assert.equal(x.perM2.denominator,50);assert.ok(Math.abs(x.perM2.value-k1/50)<1e-9);assert.equal(x.perM2.spaces,1);                // solo superficie declarada
 assert.match(x.caution,/no pruebas de eficiencia/);assert.equal(x.occupancy.total,19);assert.equal(x.occupancy.occupied,null);
 const none=C.indicators(C.computeBuilding({id:1,floors:[{id:1,name:'P',spaces:[{id:1,name:'A',kind:'Oficina',equipment:[E(1,'PC','Computador',4,150,8,22)]}]}]}).floors[0].spaces);
 assert.equal(none.perDesk,null);assert.equal(none.perM2,null);assert.equal(none.occupancy,null);                                    // sin puestos ni superficie: nada que calcular
 const only=C.indicators(C.computeBuilding({id:1,floors:[{id:1,name:'P',spaces:[{id:1,name:'A',kind:'Oficina',workstations:4,occupied:2,equipment:[E(1,'PC','Computador',4,150,8,22)]}]}]}).floors[0].spaces);
 assert.ok(Math.abs(only.perOccupied.value-only.perDesk.value*2)<1e-9);                                                             // mismos kWh, la mitad de denominador
 // capacidad de puestos
 const open=L.workstations({x:0,y:0,w:8,d:6},8,'open','s');assert.equal(open.ok,true);assert.equal(open.positions.length,8);
 assert.equal(L.workstations({x:0,y:0,w:8,d:6},9,'open','s').ok,false);assert.equal(L.workstations({x:0,y:0,w:8,d:6},7,'cubicle','s').ok,false);assert.equal(L.workstations({x:0,y:0,w:2,d:2},1,'open','s').ok,false);
 const pos=open.positions;assert.ok(pos.every(p=>p.x>0&&p.x<8&&p.y>0&&p.y<6));assert.equal(new Set(pos.map(p=>p.x+','+p.y)).size,8);   // dentro del espacio y sin superponerse
 assert.equal(L.doorSide({x:0,y:8,w:4,d:4},{y:6,d:1.6}),'n');assert.equal(L.doorSide({x:0,y:0,w:4,d:4},{y:6,d:1.6}),'s');
});
