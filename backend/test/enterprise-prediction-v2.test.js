import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),P=require('../../frontend/enterprise-prediction.js'),C=require('../../frontend/enterprise-calc-client.js');
const records=(levels,year=2024,month=0)=>levels.map((daily,i)=>{const a=Date.UTC(year,month+i,1),z=Date.UTC(year,month+i+1,0),days=(z-a)/864e5+1;return {id:i+1,start:new Date(a).toISOString().slice(0,10),end:new Date(z).toISOString().slice(0,10),kwh:daily*days,origin:'bill'};});
const opts={asOf:'2024-08-31',horizon:6};
test('V2 compares six candidates on exactly the same rolling test windows',()=>{
 const r=P.forecast(records([10,20,30,40,50,60,70,80]),opts);assert.equal(r.version,'2.0');assert.equal(r.candidates.length,6);const windows=c=>c.pairs.map(p=>[p.trainingLast,p.testStart,p.step]);const naive=r.candidates.find(c=>c.kind==='naive');for(const c of r.candidates.filter(c=>c.valid))assert.deepEqual(windows(c),windows(naive));assert.equal(naive.mae,10);assert(naive.score>naive.mae);assert.equal(naive.horizons[1].mae,20);assert.equal(naive.horizons[2].mae,30);
});
test('all test predictions only depend on earlier training data',()=>{
 const data=records([10,20,30,40,50,60,70,80]),a=P.forecast(data,opts),changed=structuredClone(data);changed.at(-1).kwh*=4;const b=P.forecast(changed,opts);
 for(const c of a.candidates.filter(c=>c.valid)){const peer=b.candidates.find(x=>x.kind===c.kind);for(const point of c.pairs){assert(point.trainingLast<point.testStart);const same=peer.pairs.find(x=>x.trainingLast===point.trainingLast&&x.testStart===point.testStart);assert.equal(same.predicted,point.predicted);}}
});
test('long consecutive monthly history enables and can select annual reference',()=>{
 const cycle=[10,15,40,80,100,30,20,15,80,40,20,10],data=records(Array.from({length:36},(_,i)=>cycle[i%12]),2023);const r=P.forecast(data,{asOf:'2025-12-31',historyWindow:36});assert.equal(r.selection.seasonalAvailable,true);assert.equal(r.kind,'seasonal');assert.equal(r.selection.score,0);assert.equal(r.points[0].value,310);assert(r.candidates.every(c=>c.checks[0].trainingLast==='2024-12-31'));
});
test('annual reference is disabled for short windows and histories with missing months',()=>{
 const data=records(Array.from({length:36},(_,i)=>10+i%12),2023);assert.equal(P.forecast(data,{asOf:'2025-12-31'}).selection.seasonalAvailable,false);data.splice(18,1);const r=P.forecast(data,{asOf:'2025-12-31',historyWindow:36});assert.equal(r.selection.seasonalAvailable,false);assert.equal(r.diagnostics.gaps.length,1);assert(r.quality.warnings.some(s=>s.includes('hueco')));
});
test('diagnostics preserve outliers and warn about old history',()=>{
 const data=records([10,10,10,10,10,200,10,10]),copy=JSON.stringify(data),r=P.forecast(data,{asOf:'2025-05-01'});assert.equal(r.diagnostics.outliers.length,1);assert.equal(r.rows.find(x=>x.id===6).kwh,data[5].kwh);assert.equal(r.quality.level,'review');assert(r.staleDays>90);assert.equal(JSON.stringify(data),copy);
});
test('constant and all-zero series avoid fictitious percentage accuracy',()=>{
 const r=P.forecast(records(Array(8).fill(0)),opts);assert.equal(r.kind,'mean');assert.equal(r.validation.wape,null);assert.equal(r.selection.improvement,0);assert(r.points.every(p=>p.value===0&&p.low===0&&p.high===0));
});
test('user can choose reference mode and limit the historical window',()=>{
 const data=records(Array.from({length:36},(_,i)=>10+i),2023),r=P.forecast(data,{asOf:'2025-12-31',historyWindow:12,strategy:'reference'});assert.equal(r.rows.length,12);assert.equal(r.rows[0].start,'2025-01-01');assert.equal(r.kind,'mean');assert.equal(r.selection.strategy,'reference');assert.throws(()=>P.forecast(data,{...opts,historyWindow:100}));assert.throws(()=>P.forecast(data,{...opts,strategy:'invented'}));
});
test('historical bands disclose extrapolation and never narrow in daily units',()=>{
 const r=P.forecast(records([15,10,30,14,50,20,60,35]),opts);let previous=0;for(const p of r.points){assert(p.high>=p.value&&p.low<=p.value&&p.low>=0);assert(p.band.radiusDaily>=previous);previous=p.band.radiusDaily;assert(p.band.samples>0);}assert(r.points.at(-1).band.extrapolated);assert(r.bandNote.includes('No es un intervalo de confianza'));
});
test('invalid extreme readings are rejected without numeric overflow',()=>{
 const data=records([10,11,12,13,14,15,16,17]);data.push({id:100,start:'2024-09-01',end:'2024-09-30',origin:'bill',kwh:1e308});const r=P.forecast(data,{asOf:'2024-10-01'});assert.equal(r.rejected,1);assert(r.points.every(p=>Number.isFinite(p.value)));assert.throws(()=>P.forecast(null,opts));
});
test('scenario cumulative totals equal the explicit monthly values',()=>{
 const b=C.computeBuilding({id:1,revision:1,records:records([10,11,12,13,14,15,16,17]),floors:[{id:1,name:'P1',spaces:[{id:1,name:'A',equipment:[{id:1,name:'Aire',category:'Aire acondicionado',mode:'power',quantity:1,watts:1200,hours:8,days:22,factor:1}]}]}]});const r=P.scenario(b,{...opts,goal:15,maxReduction:30});assert(Math.abs(r.totals.saving-r.points.reduce((a,p)=>a+p.saving,0))<.001);assert(r.reconciliation.inventory>0);assert(r.reconciliation.historyTypical>0);assert(r.plan.changes.every(c=>c.hours>=c.oldHours*.7));
});
test('reserved final periods cannot influence model choice for the independent audit',()=>{
 const data=records([10,20,30,40,50,60,70,80,90,100,110,120]),options={asOf:'2024-12-31'},a=P.forecast(data,options);const changed=structuredClone(data);changed.slice(-3).forEach(r=>r.kwh*=10);const b=P.forecast(changed,options);assert(a.reservedAudit.ready);assert.equal(a.reservedAudit.trainingPeriods,9);assert.equal(a.reservedAudit.kind,b.reservedAudit.kind);assert.deepEqual(a.reservedAudit.checks.map(x=>x.predicted),b.reservedAudit.checks.map(x=>x.predicted));assert(a.reservedAudit.checks.every(x=>x.trainingLast<x.testStart));assert(b.reservedAudit.mae>a.reservedAudit.mae);
});
test('short histories do not invent a reserved audit',()=>{
 const r=P.forecast(records([10,11,12,13,14,15,16,17]),opts);assert.equal(r.reservedAudit.ready,false);assert(r.reservedAudit.reason.includes('9 periodos'));
});
