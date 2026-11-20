import test from 'node:test';
import assert from 'node:assert/strict';
import {record,budget,meterReading} from '../src/enterprise-validation.js';
test('periods reject dates that Date.parse would normalize',()=>{
 for(const date of ['2026-02-30','2025-02-29','2026-04-31','2026-13-01','2026-00-02'])assert.throws(()=>record({start:date,end:date,origin:'bill',kwh:1}));
 assert.equal(record({start:'2024-02-29',end:'2024-03-01',origin:'bill',kwh:0}).kwh,0);
});
test('tariff dates and meter dates use the same civil-date rule',()=>{
 assert.throws(()=>budget({tariffRate:1000,tariffSource:'Contrato',tariffDate:'2026-02-30'}));assert.throws(()=>meterReading({date:'2026-02-30',value:0}));
 assert.equal(budget({tariffRate:1000,tariffSource:'Contrato',tariffDate:'2024-02-29'}).tariffDate,'2024-02-29');assert.equal(meterReading({date:'2024-02-29',value:0}).value,0);
});
