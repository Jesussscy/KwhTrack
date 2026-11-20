import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),Savings=require('../../frontend/enterprise-savings.js'),Calc=require('../../frontend/enterprise-calc-client.js');
const ac={id:1,name:'Aires',category:'Aire acondicionado',mode:'power',quantity:4,watts:1200,hours:8,days:22,factor:1,active:true};
const building=(equipment=[ac],common=[])=>Calc.computeBuilding({id:1,revision:7,floors:[{id:1,name:'Piso 1',spaces:[{id:2,name:'Oficina',equipment}]}],common,records:[]});
test('two hours per day use actual equipment count and days, without mutating inventory',()=>{
 const b=building(),original=structuredClone(b),r=Savings.simulate(b,{1:2});
 assert.equal(r.before,844.8);assert.equal(r.after,633.6);assert.equal(r.saving,211.2);assert.equal(r.changes[0].perUnitHours,44);assert.equal(r.changes[0].groupHours,176);assert.deepEqual(b,original);
});
test('factor, individual days and common consumption stay in the building comparison',()=>{
 const b=building([{...ac,factor:.5,days:20}],[{...ac,id:3,category:'Iluminación',name:'Común',quantity:1,watts:100,hours:24,days:30}]),r=Savings.simulate(b,{1:2,3:24});
 assert.equal(r.before,456);assert.equal(r.saving,96);assert.equal(r.after,360);assert.equal(r.changes.length,1);assert.equal(r.floors[0].saving,96);
});
test('essential, paused, continuous and monthly equipment cannot be cut by automatic scenarios',()=>{
 const b=building([{...ac,essential:true},{...ac,id:2,active:false},{...ac,id:3,category:'Servidor',name:'Servidor'},{...ac,id:4,mode:'monthly',monthlyKwh:100}]);
 const r=Savings.simulate(b,{1:2,2:2,3:2,4:2});assert.equal(r.saving,0);assert.equal(r.changes.length,0);assert(r.rows.every(x=>x.blocked));
});
test('unknown consumption remains unknown, including an empty building',()=>{
 const r=Savings.simulate(building([{...ac,watts:null}]),{1:2});assert.equal(r.before,null);assert.equal(r.after,null);assert.equal(r.rows[0].before,null);assert(r.partial);assert.equal(Savings.simulate(building([])).before,null);
});
test('reductions are bounded and rounded conservatively without creating negative hours',()=>{
 const r=Savings.simulate(building([{...ac,hours:7.333}]),{1:24});assert(r.changes[0].hours>=7.333*.5);assert(r.saving>0);assert.throws(()=>Savings.simulate(building(),{1:NaN}));assert.throws(()=>Savings.simulate(building(),{1:-1}));
 const zero=Savings.simulate(building([{...ac,hours:0}]),{1:2});assert.equal(zero.saving,0);assert.equal(zero.changes.length,0);
});
test('a scenario always starts at original inventory and never double counts equipment',()=>{
 const b=building(),a=Savings.simulate(b,{1:2}),again=Savings.simulate(b,{1:2});assert.deepEqual(a,again);assert.equal(Savings.simulate(b).saving,0);assert.equal(Savings.simulate(b,{1:.5}).saving,52.8);
});
test('explicit exclusions prevent reductions even when a preset requests them',()=>{
 const r=Savings.simulate(building(),{1:2},{exclude:[1]});assert.equal(r.saving,0);assert.equal(r.rows[0].hours,8);assert.equal(r.rows[0].excluded,true);
});
test('time drafts handle midnight and validate exact durations',()=>{
 const s=Savings.schedule(22,8,6);assert.equal(s.end,30);assert.equal(s.proposedEnd,28);const t=Savings.track(22,8);assert.equal(t.length,2);assert(Math.abs(t.reduce((sum,x)=>sum+x.width,0)-8/24*100)<1e-8);assert.throws(()=>Savings.schedule(24,8,6));assert.throws(()=>Savings.schedule(8,6,8));assert.deepEqual(Savings.track(8,0),[]);
});
test('budget handles missing rate and zero budgets explicitly',()=>{
 assert.match(Savings.budgetText(null,10),/Añade tu tarifa/);assert.match(Savings.budgetText(0,null),/Define un presupuesto/);assert.match(Savings.budgetText(100,0),/Superarías/);assert.match(Savings.budgetText(0,0),/por debajo/);
});
