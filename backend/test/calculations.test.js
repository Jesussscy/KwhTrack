import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateDevice} from '../src/calculations.js';
const device={watts:1000,quantity:1,hours:2,days:30,factor:1};
test('equipo de 1000 W, 2 h y 30 días consume 60 kWh',()=>assert.equal(calculateDevice(device),60));
test('los ciclos de funcionamiento reducen el consumo',()=>assert.equal(calculateDevice({...device,factor:.5}),30));
test('consumo mensual conocido reemplaza potencia y horario',()=>assert.equal(calculateDevice({...device,mode:'monthly',monthlyKwh:30,quantity:2}),60));
test('rechaza consumo conocido negativo y cantidad fraccionaria',()=>{assert.throws(()=>calculateDevice({mode:'monthly',monthlyKwh:-1,quantity:1}));assert.throws(()=>calculateDevice({mode:'monthly',monthlyKwh:30,quantity:1.5}));});
test('rechaza horas imposibles, infinitos y cantidades fraccionarias',()=>{for(const value of [{hours:25},{watts:Infinity},{quantity:1.5},{factor:-1}])assert.throws(()=>calculateDevice({...device,...value}));});
