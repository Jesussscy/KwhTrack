import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {suggestPlan,evaluatePlan}=require('../../frontend/insights.js');
const {validate}=require('../../frontend/backup.js');
const device=(id,category='Aire acondicionado',extra={})=>({id,name:id,category,watts:1000,hours:8,days:30,quantity:1,factor:.65,...extra});
test('una meta del 15% produce horarios verificables sin mutar el hogar',()=>{
 const devices=[device('ac'),device('tv','Televisor',{watts:100,hours:4,factor:1}),device('fridge','Nevera',{watts:150,hours:24,factor:.35})],snapshot=structuredClone(devices);
 const proposal=suggestPlan(devices,15),result=evaluatePlan(devices,proposal.changes,1000,200000);
 assert.ok(proposal.reached);assert.ok(proposal.savedKwh>=proposal.targetKwh);assert.ok(result.nextKwh<result.currentKwh);assert.ok(Math.abs(result.saved/1000-proposal.savedKwh)<1e-9);assert.deepEqual(devices,snapshot);
 for(const c of proposal.changes){const d=devices.find(d=>d.id===c.id);assert.ok(d.hours-c.hours<=d.hours*.35+1e-8);assert.equal(c.days,d.days);}
});
test('protege equipos continuos, pausados y consumos conocidos incluso con meta inalcanzable',()=>{
 const devices=[device('fridge','Nevera'),device('router','Router y conectividad'),device('other','Otro'),device('off','Televisor',{active:false}),device('known','Computador',{mode:'monthly',monthlyKwh:40}),device('console','Consola de videojuegos',{hours:2})];
 const proposal=suggestPlan(devices,50);assert.deepEqual(proposal.changes.map(r=>r.id),['console']);assert.equal(proposal.reached,false);assert.ok(proposal.shortfallKwh>0);
 assert.equal(suggestPlan(devices,15,{excludedIds:['console']}).changes.length,0);
});
test('no inventa ahorro con cero consumo o cero meta y respeta el límite de horarios',()=>{
 assert.deepEqual(suggestPlan([],15).changes,[]);assert.equal(suggestPlan([],15).reached,false);assert.equal(suggestPlan([device('a')],0).changes.length,0);
 const r=suggestPlan([device('a')],50,{maxReduction:20});assert.equal(r.reached,false);assert.ok(r.achievedPercent<=20+1e-8);
 assert.equal(suggestPlan([device('short','Televisor',{hours:.1})],15).changes.length,0);
 for(const value of [-1,51,NaN])assert.throws(()=>suggestPlan([],value));
});
test('nuevas categorías sobreviven validación local, copias y contrato del servidor',()=>{
 const categories=['Consola de videojuegos','Router y conectividad','Cocina eléctrica','Pequeños aparatos','Herramientas eléctricas'];
 const data={settings:{name:'Pruebas',budget:100000,rate:1000},devices:categories.map((c,i)=>device(String(i),c)),readings:[],bills:[]};
 assert.deepEqual(validate({product:'kwhTrack',version:1,data}).devices.map(d=>d.category),categories);
});
