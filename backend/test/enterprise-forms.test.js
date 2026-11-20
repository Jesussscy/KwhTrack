import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {equipment as serverEquipment} from '../src/enterprise-validation.js';
const require=createRequire(import.meta.url),Forms=require('../../frontend/enterprise-forms.js');
const fd=extra=>{const form=new FormData();for(const [key,val] of Object.entries({name:'Aires de oficina',category:'Aire acondicionado',quantity:'4',mode:'power',watts:'1200',hours:'8',days:'22',factor:'1',...extra}))if(val!==null)form.set(key,val);return form;};
test('known equipment values agree with authoritative server validation',()=>{
 const value=Forms.equipment(fd());assert.equal(value.quantity,4);assert.equal(value.watts,1200);const checked=serverEquipment(value);for(const [key,v] of Object.entries(value))assert.deepEqual(checked[key],v);
});
test('blank consumption inputs stay unknown, factor defaults explicitly to one',()=>{
 const value=Forms.equipment(fd({watts:'',hours:'',days:'',factor:''}));assert.equal(value.watts,null);assert.equal(value.hours,null);assert.equal(value.days,null);assert.equal(value.factor,1);
});
test('zero hours, days and factor remain meaningful zero values',()=>{
 const value=Forms.equipment(fd({hours:'0',days:'0',factor:'0'}));assert.deepEqual([value.hours,value.days,value.factor],[0,0,0]);
});
test('out of range and fractional quantities identify the erroneous field',()=>{
 for(const quantity of ['0','1001','1.5','Infinity','0x10'])assert.throws(()=>Forms.equipment(fd({quantity})),e=>e.field==='quantity');
});
test('power and monthly limits match server limits',()=>{
 assert.equal(Forms.equipment(fd({watts:'1000000'})).watts,1000000);assert.throws(()=>Forms.equipment(fd({watts:'1000001'})),e=>e.field==='watts');
 assert.equal(Forms.equipment(fd({mode:'monthly',monthlyKwh:'1000000'})).monthlyKwh,1000000);assert.throws(()=>Forms.equipment(fd({mode:'monthly',monthlyKwh:'1000001'})),e=>e.field==='monthlyKwh');
});
test('hours, days and factor reject incompatible values',()=>{
 for(const [key,val] of [['hours','24.1'],['hours','-1'],['days','1.5'],['days','32'],['factor','1.01'],['factor','-0.1']])assert.throws(()=>Forms.equipment(fd({[key]:val})),e=>e.field===key);
});
test('monthly mode ignores hidden power inputs',()=>{
 const value=Forms.equipment(fd({mode:'monthly',monthlyKwh:'0',watts:'-100',hours:'99'}));assert.equal(value.monthlyKwh,0);assert(!('watts' in value));assert(!('hours' in value));
});
test('name is required for submission, but not for live preview',()=>{
 assert.throws(()=>Forms.equipment(fd({name:' '})),e=>e.field==='name');assert.equal(Forms.equipment(fd({name:''}),{preview:true}).name,'');assert.throws(()=>Forms.equipment(fd({name:'x'.repeat(81)})),e=>e.field==='name');
});
test('decimal comma and flags are read without losing intent',()=>{
 const value=Forms.equipment(fd({hours:'7,5',factor:'0,7',paused:'on',essential:'on'}));assert.equal(value.hours,7.5);assert.equal(value.factor,.7);assert.equal(value.active,false);assert.equal(value.essential,true);
});
test('method and category remain validated',()=>{
 assert.throws(()=>Forms.equipment(fd({mode:'unexpected'})),e=>e.field==='mode');assert.throws(()=>Forms.equipment(fd({category:''})),e=>e.field==='category');assert.throws(()=>Forms.equipment(fd({category:'x'.repeat(51)})),e=>e.field==='category');
});
