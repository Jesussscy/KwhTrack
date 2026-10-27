import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {billMetrics}=createRequire(import.meta.url)('../../frontend/insights.js');
test('promedios de factura usan días reales, incluso en año bisiesto',()=>{assert.deepEqual(billMetrics({start:'2024-02-01',end:'2024-03-01',kwh:58,amount:29000}),{days:29,daily:2,paidDaily:1000});});
test('cero consumo y cero pagado son válidos, campos incompletos no equivalen a cero',()=>{assert.deepEqual(billMetrics({start:'2025-01-01',end:'2025-01-11',kwh:0,amount:0}),{days:10,daily:0,paidDaily:0});assert.deepEqual(billMetrics({start:'2025-01-01',end:'2025-01-11',kwh:null,amount:null}),{days:10,daily:null,paidDaily:null});});
test('no inventa promedios para fechas imposibles, iguales o invertidas',()=>{for(const [start,end] of [['2025-02-30','2025-03-05'],['2025-01-01','2025-01-01'],['2025-02-01','2025-01-01'],['','2025-01-01']])assert.deepEqual(billMetrics({start,end,kwh:10,amount:1000}),{days:null,daily:null,paidDaily:null});});
test('valores no finitos o negativos no producen resultados de consumo',()=>{assert.deepEqual(billMetrics({start:'2025-01-01',end:'2025-01-11',kwh:Infinity,amount:-1}),{days:10,daily:null,paidDaily:null});});
