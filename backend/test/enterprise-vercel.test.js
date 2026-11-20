import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import http from 'node:http';
import {E} from '../src/enterprise-energy.js';
import handler from '../../frontend/api/org/solar-profile.mjs';
import session from '../../frontend/api/org/session.mjs';
test('adaptador Vercel: origen, método, tamaño, validación y proveedor compartido',async t=>{
 const nativeFetch=globalThis.fetch,server=http.createServer(handler);server.listen(0,'127.0.0.1');await once(server,'listening');const base='http://127.0.0.1:'+server.address().port;
 const request=(body,extra={})=>nativeFetch(base,{method:'POST',headers:{Origin:base,'Content-Type':'application/json',...extra},body:typeof body==='string'?body:JSON.stringify(body)});
 try{
  assert.equal((await nativeFetch(base)).status,405);
  assert.equal((await request({config:E.defaults()},{Origin:'https://outside.example'})).status,403);
  assert.equal((await request('not-json')).status,400);
  assert.equal((await request({config:{...E.defaults(),panels:-1}})).status,400);
  assert.equal((await request({data:'x'.repeat(17000)})).status,413);
  let calls=0;const hourly=Array.from({length:8760},(_,i)=>{const date=new Date(Date.UTC(2023,0,1,0,30)+i*3600000),iso=date.toISOString();return {time:iso.slice(0,10).replaceAll('-','')+':'+iso.slice(11,16).replace(':',''),P:date.getUTCHours()>=12&&date.getUTCHours()<22?300:0};});
  t.mock.method(globalThis,'fetch',async url=>{assert.equal(new URL(url).hostname,'re.jrc.ec.europa.eu');calls++;return new Response(JSON.stringify({outputs:{hourly}}),{status:200});});
  const config={...E.defaults(),tilt:31.234},r=await request({config});assert.equal(r.status,200);const data=await r.json();assert.equal(data.production.hours.length,12);assert.equal(data.production.key,E.providerKey(config));assert.equal(calls,1);assert.equal((await request({config:{...config,panels:17}})).status,200);assert.equal(calls,1);
 }finally{t.mock.restoreAll();await new Promise(resolve=>server.close(resolve));}
});
test('despliegue de demostración no anuncia cuentas MySQL configuradas',async()=>{const server=http.createServer(session);server.listen(0,'127.0.0.1');await once(server,'listening');try{const response=await fetch('http://127.0.0.1:'+server.address().port);assert.deepEqual(await response.json(),{configured:false,authenticated:false,deployment:'demo'});}finally{await new Promise(resolve=>server.close(resolve));}});
