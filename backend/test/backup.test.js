import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{validate}=require('../../frontend/backup.js');
const sample=()=>({product:'kwhTrack',version:1,data:{settings:{name:'Casa',budget:300000,rate:1000,customRate:true},example:false,devices:[{id:'equipo-1',name:'Nevera',category:'Nevera',quantity:1,mode:'monthly',monthlyKwh:30,active:false}],readings:[],bills:[]}});
test('restaura consumo conocido y estado pausado sin conservar campos extraños',()=>{const x=sample();x.data.devices[0].extra='<script>';const result=validate(x);assert.equal(result.devices[0].monthlyKwh,30);assert.equal(result.devices[0].active,false);assert.equal(result.devices[0].extra,undefined);});
test('rechaza formato desconocido, números inválidos y nombres vacíos',()=>{const a=sample();a.version=9;assert.throws(()=>validate(a));const b=sample();b.data.settings.rate=Infinity;assert.throws(()=>validate(b));const c=sample();c.data.devices[0].name=' ';assert.throws(()=>validate(c));});
test('rechaza lecturas decrecientes y fechas imposibles',()=>{const a=sample();a.data.readings=[{id:'r1',date:'2026-02-01',value:100},{id:'r2',date:'2026-02-02',value:90}];assert.throws(()=>validate(a));a.data.readings=[{id:'r1',date:'2026-02-30',value:100}];assert.throws(()=>validate(a));});
test('rechaza duplicados y periodos de facturas superpuestos',()=>{const a=sample();a.data.devices.push({...a.data.devices[0]});assert.throws(()=>validate(a));const b=sample();b.data.bills=[{id:'f1',start:'2026-01-01',end:'2026-02-01',kwh:10,amount:100},{id:'f2',start:'2026-01-15',end:'2026-02-15',kwh:10,amount:100}];assert.throws(()=>validate(b));});
