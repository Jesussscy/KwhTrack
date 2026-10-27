import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),guide=require('../../frontend/tariff-guide.js');
test('los seis estratos tienen una explicación por servicio y fuentes trazables',()=>{
 for(let n=1;n<=6;n++)for(const service of guide.services){const info=guide.explain(n,service.id);assert.ok(info.title.includes(String(n)));assert.equal(info.steps.length,3);assert.ok(info.footer);for(const key of info.sources){assert.ok(guide.sources[key]);assert.ok(guide.sources[key].url.startsWith('https://'));}}
});
test('agua distingue máximos y mínimos nacionales de factores locales confirmados',()=>{
 for(const [n,percent] of [[1,70],[2,40],[3,15]]){const info=guide.explain(n,'water');assert.match(info.rule,new RegExp('hasta '+percent));assert.match(info.rule,/no el porcentaje local confirmado/);}
 for(const [n,percent] of [[5,50],[6,60]])assert.match(guide.explain(n,'water').rule,new RegExp('mínimo residencial del '+percent));
 assert.match(guide.explain(4,'water').rule,/Consulta la fila/);
});
test('tabla de Veolia conserva los valores del PDF y el periodo histórico',()=>{
 const expected=[[-70,12418.74,8859.74],[-40,25447.60,17719.47],[-15,36544.67,25102.59],[0,44446.40,29532.46],[90,90520.34,56111.67],[245,178398.70,101886.98]];
 for(let i=0;i<6;i++){const occupied=guide.historicWaste(i+1),unoccupied=guide.historicWaste(i+1,'unoccupied');assert.equal(occupied.factor,expected[i][0]);assert.equal(occupied.amount,expected[i][1]);assert.equal(unoccupied.amount,expected[i][2]);assert.equal(occupied.historical,true);assert.equal(occupied.period,'Enero de 2024');}
 assert.match(guide.sources.waste.note,/No es una tarifa vigente/);
});
test('predial y clasificación no se convierten en una tarifa por estrato',()=>{
 assert.match(guide.explain(2,'property').title,/no basta/);assert.match(guide.explain(2,'property').footer,/No se calcula/);assert.match(guide.explain(2,'assignment').description,/no certifica/);
 for(const invalid of [0,7,'2',null,NaN])assert.throws(()=>guide.explain(invalid,'energy'));
 assert.throws(()=>guide.explain(1,'gas'));assert.throws(()=>guide.historicWaste(1,'unknown'));assert.throws(()=>guide.historicWaste(0));
});
