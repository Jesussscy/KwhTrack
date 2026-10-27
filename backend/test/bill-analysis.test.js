import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const analysis=createRequire(import.meta.url)('../../frontend/bill-analysis.js');
const bill=(id,start,end,kwh,amount=100000)=>({id,start,end,kwh,amount});
const previous=[bill('a','2025-01-01','2025-02-01',310),bill('b','2025-02-01','2025-03-01',280),bill('c','2025-03-01','2025-04-01',310)];
test('normaliza duraciones distintas sin confundir gasto con consumo',()=>{
 const result=analysis.compare(previous[0],bill('d','2025-04-01','2025-05-01',300,120000));
 assert.equal(result.daily.absolute,0);assert.equal(result.kwh.absolute,-10);assert.equal(result.amount.percent,20);
});
test('no calcula porcentajes con referencia cero ni compara periodos superpuestos',()=>{
 assert.equal(analysis.compare(bill('zero','2024-12-01','2025-01-01',0,0),previous[0]).daily.percent,null);
 assert.equal(analysis.compare(previous[0],bill('x','2025-01-15','2025-02-15',200)),null);
 assert.equal(analysis.compare(previous[0],previous[0]),null);
});
test('alerta usa los tres promedios diarios anteriores y un umbral estricto',()=>{
 const equal=analysis.alert([...previous,bill('d','2025-04-01','2025-05-01',360)]);
 assert.equal(equal.baseline,10);assert.equal(equal.status,'normal');
 const high=analysis.alert([...previous,bill('d','2025-04-01','2025-05-01',390)]);
 assert.equal(high.status,'high');assert.equal(high.change,30);
 assert.equal(analysis.alert([...previous,bill('d','2025-04-01','2025-05-01',390)],35).status,'normal');
});
test('faltan antecedentes, referencia nula y fechas imposibles no inventan alertas',()=>{
 assert.equal(analysis.alert(previous).status,'insufficient');
 assert.equal(analysis.alert([...previous.map(b=>({...b,kwh:0})),bill('d','2025-04-01','2025-05-01',390)]).status,'zero');
 assert.equal(analysis.metrics(bill('bad','2025-02-30','2025-03-15',20)),null);
 assert.throws(()=>analysis.alert(previous,NaN));assert.throws(()=>analysis.alert(previous,0));
});
test('antecedentes superpuestos se explican y la entrada permanece intacta',()=>{
 const rows=[...previous,bill('extra','2025-03-15','2025-03-30',200),bill('d','2025-04-01','2025-05-01',390)];
 const snapshot=structuredClone(rows);assert.equal(analysis.alert(rows).status,'overlap');assert.deepEqual(rows,snapshot);
});
