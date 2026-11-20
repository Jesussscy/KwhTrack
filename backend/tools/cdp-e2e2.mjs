// E2E ampliado en Chrome real (CDP): segundo piso, inventario representado, distribución, duplicar/mover, importación con vista previa, contraste.
// Uso: node tools/cdp-e2e2.mjs <baseUrlConBaseDePruebas> <carpetaCapturas>   (registra una organización nueva y la elimina el servidor de pruebas al apagar la base)
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
const base=process.argv[2],out=path.resolve(process.argv[3]);await fs.mkdir(out,{recursive:true});
const chrome=process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',port=9335;
const proc=spawn(chrome,['--headless=new','--disable-gpu','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader',`--remote-debugging-port=${port}`,`--user-data-dir=${path.join(out,'profile2')}`,'--window-size=1360,900','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let tgt;for(let i=0;i<40;i++){try{tgt=(await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t=>t.type==='page');if(tgt)break;}catch{}await sleep(500);}
const ws=new WebSocket(tgt.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r));
let id=0;const pend=new Map();ws.addEventListener('message',m=>{const d=JSON.parse(m.data);if(d.id&&pend.has(d.id)){pend.get(d.id)(d);pend.delete(d.id);}});
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
const ev=async expr=>{const r=await send('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true});if(r.result.exceptionDetails)throw Error(r.result.exceptionDetails.exception?.description||'error');return r.result.result.value;};
const shot=async n=>{const r=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(`${out}/${n}.png`,Buffer.from(r.result.data,'base64'));};
const waitFor=async(expr,ms=30000)=>{const t=Date.now();while(Date.now()-t<ms){try{if(await ev(expr))return true;}catch{}await sleep(300);}throw Error('timeout: '+expr);};
const click=sel=>ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)throw Error('no existe '+${JSON.stringify(sel)});e.dispatchEvent(new MouseEvent('click',{bubbles:true}));return true})()`);
const setv=(sel,v)=>ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});e.value=${JSON.stringify(String(v))};e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));return true})()`);
// API desde la página (misma sesión y CSRF)
const api=(p,method='GET',body)=>ev(`(async()=>{const s=await fetch('/api/org/session').then(r=>r.json());const r=await fetch('/api/org'+${JSON.stringify(p)},{method:${JSON.stringify(method)},headers:{'Content-Type':'application/json','X-CSRF-Token':s.csrfToken},body:${body===undefined?'undefined':`JSON.stringify(${JSON.stringify(body)})`}});return {status:r.status,data:await r.json()};})()`);
const R={};const ok=(k,v)=>{R[k]=v;console.log(k,typeof v==='string'?v.slice(0,160):JSON.stringify(v).slice(0,200));};
const lum=([r,g,b])=>{const f=c=>{c/=255;return c<=.03928?c/12.92:((c+.055)/1.055)**2.4;};return .2126*f(r)+.7152*f(g)+.0722*f(b);};
try{
 await send('Page.enable');await send('Runtime.enable');await send('DOM.enable');
 await send('Page.navigate',{url:base+'/empresarial'});await waitFor("!!document.querySelector('#auth-form')");
 await click('[data-act=tab-register]');await setv('#f-organization','Empresa Final');await setv('#f-name','Tester');await setv('#f-email',randomUUID()+'@kwhtrack.test');await setv('#f-password',randomUUID()+'-Pw1');
 await ev("document.querySelector('#auth-form .primary').click()");await waitFor("!!document.querySelector('#sidebar')");
 // datos por API
 let b=(await api('/buildings','POST',{name:'Sede Final',city:'Cartagena',floors:[{name:'Piso 1'},{name:'Piso 2'}],spacesPerFloor:4})).data.building;let rev=b.revision;
 const kinds=['Oficina','Sala de reuniones','Recepción','Cafetería'];
 for(const [i,s] of b.floors[0].spaces.entries()){const r=await api('/spaces/'+s.id,'PATCH',{revision:rev,name:['Oficina A','Sala B','Recepción','Descanso'][i],kind:kinds[i]});rev=r.data.building.revision;}
 const eq=async(sid,e)=>{const r=await api(`/spaces/${sid}/equipment`,'POST',{revision:rev,...e});rev=r.data.building.revision;};
 const [A1]=b.floors[0].spaces,[A2,B2]=b.floors[1].spaces;
 await eq(A1.id,{name:'Aire acondicionado',category:'Aire acondicionado',quantity:4,watts:1200,hours:8,days:22});await eq(A1.id,{name:'Luminaria',category:'Iluminación',quantity:3,watts:18,hours:10,days:22});await eq(A1.id,{name:'Computador',category:'Computador',quantity:2,watts:150,hours:8,days:22});
 await eq(A2.id,{name:'Computador',category:'Computador',quantity:6,watts:150,hours:8,days:22});await eq(B2.id,{name:'Proyector',category:'Proyector',quantity:1,watts:250,hours:2,days:12});
 const lay=await api(`/floors/${b.floors[1].id}/layout`,'PATCH',{revision:rev,spaces:[{id:A2.id,x:0,y:0,w:8,d:6},{id:B2.id,x:9,y:0,w:8,d:6},{id:b.floors[1].spaces[2].id,x:0,y:7,w:8,d:6},{id:b.floors[1].spaces[3].id,x:9,y:7,w:8,d:6}]});rev=lay.data.building.revision;ok('layout_piso2_guardado',lay.status);
 await send('Page.navigate',{url:base+'/empresarial?r='+Date.now()+'#edificios'});await waitFor("!!document.querySelector('#stage-wrap')");
 await ev(`[...document.querySelectorAll('[data-act=open-b]')].length`);
 await waitFor("document.querySelectorAll('.glb-label').length>=2",60000);await sleep(5000);await shot('a1-edificio');
 const f1=b.floors[0].id,f2=b.floors[1].id;
 await click(`[data-act=enter-floor][data-id="${f1}"]`);await sleep(6000);await shot('a2-piso1-modelo-glb');
 await click(`[data-act=enter-floor][data-id="${f2}"]`);await sleep(6000);await shot('a3-piso2-distribucion-propia');
 ok('piso2_distinto_de_piso1',await ev("document.querySelector('#panel').textContent.includes('6 computador')&&!document.querySelector('#panel').textContent.includes('aire acondicionado')"));
 await click(`[data-act=enter-space][data-id="${A1.id}"][data-floor="${f1}"]`);await sleep(6000);await shot('a4-espacio-inventario');
 ok('inventario_en_panel',await ev("document.querySelector('#panel').textContent.match(/4 aire acondicionado · 3 iluminación · 2 computador/i)?.[0]"));
 ok('etiquetas_3d_inventario',await ev("[...document.querySelectorAll('.glb-label')].map(e=>e.textContent).join(' | ')"));
 // editor de planta y actualización de escena
 await click(`[data-act=enter-floor][data-id="${f2}"]`);await sleep(1500);await click('[data-act=edit-layout]');await waitFor("!!document.querySelector('#plan')");
 await setv('[data-lay=w][data-i="0"]','7');await ev("document.querySelector('#dlg-ok').click()");await waitFor("!document.querySelector('#dlg').open");await sleep(4000);
 const got=(await api('/buildings/'+b.id)).data.building
 ok('ancho_guardado',got.floors[1].spaces[0].plan.w);rev=got.revision;await shot('a5-piso2-tras-redimensionar');
 // duplicar espacio por UI
 await click(`[data-act=select-space][data-id="${A2.id}"]`);await sleep(300);await click('[data-act=dup-space]');await waitFor("document.querySelector('#dlg').open");await setv('#f-fl',String(f1));await ev("document.querySelector('[name=inv]').click()");await shot('a6-dialogo-duplicar');
 await ev("document.querySelector('#dlg-ok').click()");await waitFor("!document.querySelector('#dlg').open");await sleep(800);
 const after=(await api('/buildings/'+b.id)).data.building;ok('duplicado_en_piso1',after.floors[0].spaces.length===5&&after.floors[0].spaces[4].equipment.length===1);
 // mover al piso 2 (sin hueco): rechazo explícito
 await click(`[data-act=enter-floor][data-id="${f1}"]`);await sleep(800);
 await click(`[data-act=select-space][data-id="${after.floors[0].spaces[4].id}"]`);await click('[data-act=move-space]');await waitFor("document.querySelector('#dlg').open");await ev("document.querySelector('#dlg-ok').click()");await sleep(900);
 ok('mover_sin_hueco_rechazado',await ev("document.querySelector('#dlg-error').textContent"));await shot('a7-mover-sin-hueco');await ev("document.querySelector('[data-close]').click()");
 // deshacer duplicado
 await click('[data-act=undo]');await waitFor("document.querySelector('#dlg').open");await ev("document.querySelector('#dlg-ok').click()");await waitFor("!document.querySelector('#dlg').open");await sleep(500);
 ok('deshacer_duplicado',(await api('/buildings/'+b.id)).data.building.floors[0].spaces.length);
 // exportar → importar con vista previa (UI) → comparar
 const exp=(await api('/export')).data;const file=path.join(out,'copia.json');await fs.writeFile(file,JSON.stringify(exp));
 await click('[data-act=sec][data-sec=cuenta]');await waitFor("!!document.querySelector('#import-file')");
 const doc=await send('DOM.getDocument');const n=await send('DOM.querySelector',{nodeId:doc.result.root.nodeId,selector:'#import-file'});await send('DOM.setFileInputFiles',{files:[file],nodeId:n.result.nodeId});
 await waitFor("document.querySelector('#dlg').open&&document.querySelector('#dlg-title').textContent.includes('Resumen')");await shot('a8-importacion-resumen');
 ok('resumen_importacion',await ev("document.querySelector('#dlg-body').innerText.replace(/\\n+/g,' · ')"));
 await ev("document.querySelector('#dlg-ok').click()");await waitFor("!document.querySelector('#dlg').open",20000);await sleep(800);
 const exp2=(await api('/export')).data;const norm=x=>JSON.stringify({...x,name:x.name.replace(/ \(importado\)$/,'')});
 ok('ida_y_vuelta_identica',norm(exp2.buildings.find(x=>x.name==='Sede Final (importado)'))===norm(exp.buildings.find(x=>x.name==='Sede Final')));
 // comparar original vs importado
 await click('[data-act=sec][data-sec=comparar]');await waitFor("document.querySelectorAll('.cmp-host canvas').length===2",60000);await sleep(5000);await shot('a9-comparar-original-vs-importado');
 // contraste y estados sin dato
 await click('[data-act=sec][data-sec=edificios]');await sleep(500);
 const contrast=await ev(`(()=>{const rgb=s=>{const m=s.match(/\\d+(\\.\\d+)?/g).map(Number);return m.slice(0,3)};const bgOf=e=>{while(e){const c=getComputedStyle(e).backgroundColor;const m=c.match(/[\\d.]+/g).map(Number);if(m.length<4||m[3]>0.5)return rgb(c);e=e.parentElement;}return [255,255,255];};
  const L=${lum.toString()};const out={};const sel={'texto principal':'main h1','texto secundario .mute':'.mute','nota .note':'.note','botón primario':'button.primary','menú activo':'.sidebar nav a.active','badge incompleto':'.badge.warn','etiqueta 3D seleccionada':'.glb-label.sel','etiqueta 3D':'.glb-label'};
  for(const [k,q] of Object.entries(sel)){const e=document.querySelector(q);if(!e){out[k]='(no presente en esta vista)';continue;}const fg=rgb(getComputedStyle(e).color),bg=bgOf(e),a=L(fg),b=L(bg);out[k]=+((Math.max(a,b)+.05)/(Math.min(a,b)+.05)).toFixed(2);}return out;})()`);
 ok('contraste_wcag',contrast);
 const SC=['#fff1b8','#ffd535','#e0a800','#a87400','#5c3f00'].map(h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)));const ink=[0x20,0x25,0x1e];
 ok('contraste_texto_sobre_escala',SC.map(c=>+((Math.max(lum(c),lum(ink))+.05)/(Math.min(lum(c),lum(ink))+.05)).toFixed(2)));
 ok('estado_sin_datos_en_texto',await ev("[...document.querySelectorAll('.glb-label')].some(e=>/sin datos/.test(e.textContent))||document.querySelector('#panel').textContent.includes('sin datos')"));
 R.fin=true;
}catch(e){console.log('ERROR',e.message);R.error=e.message;await shot('zz-error2').catch(()=>{});}
await fs.writeFile(out+'/resultado2.json',JSON.stringify(R,null,1));
try{await send('Browser.close');}catch{}proc.kill();setTimeout(()=>process.exit(0),500);
