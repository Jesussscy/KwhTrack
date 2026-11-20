// Recorrido de verificación en Chrome real (CDP). Uso: node tools/cdp-e2e.mjs <baseUrlConCuenta> <carpetaCapturas>
// Requiere Chrome y un servidor con MySQL de pruebas. No toca bases ajenas: registra una organización nueva.
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
const base=process.argv[2],out=process.argv[3];await fs.mkdir(out,{recursive:true});
const chrome=process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',port=9333,prof=(await import('node:path')).resolve(out,'profile');
const proc=spawn(chrome,['--headless=new','--disable-gpu','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader',`--remote-debugging-port=${port}`,`--user-data-dir=${prof}`,'--window-size=1360,900','about:blank'],{stdio:['ignore','ignore','pipe']});
proc.stderr.on('data',d=>{if(/error|fail/i.test(String(d)))console.log('chrome:',String(d).slice(0,200));});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let tgt;for(let i=0;i<40;i++){try{tgt=(await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t=>t.type==='page');if(tgt)break;}catch{}await sleep(500);}
const ws=new WebSocket(tgt.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r));
let id=0;const pend=new Map();ws.addEventListener('message',m=>{const d=JSON.parse(m.data);if(d.id&&pend.has(d.id)){pend.get(d.id)(d);pend.delete(d.id);}});
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
const ev=async expr=>{const r=await send('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true});if(r.result.exceptionDetails)throw Error(r.result.exceptionDetails.exception?.description||'error');return r.result.result.value;};
const shot=async n=>{const r=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(`${out}/${n}.png`,Buffer.from(r.result.data,'base64'));};
const view=async(w,h)=>send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:w<600});
const waitFor=async(expr,ms=20000)=>{const t=Date.now();while(Date.now()-t<ms){try{if(await ev(expr))return true;}catch{}await sleep(300);}throw Error('timeout: '+expr);};
const click=sel=>ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)throw Error('no existe '+${JSON.stringify(sel)});e.click();return true})()`);
const clickText=(sel,txt)=>ev(`(()=>{const e=[...document.querySelectorAll(${JSON.stringify(sel)})].find(x=>x.textContent.includes(${JSON.stringify(txt)}));if(!e)throw Error('no existe '+${JSON.stringify(txt)});e.click();return true})()`);
const setv=(sel,v)=>ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});e.value=${JSON.stringify(String(v))};e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));return true})()`);
const nav=async u=>{await send('Page.navigate',{url:u});await sleep(1500);};
const R={};const ok=(k,v)=>{R[k]=v;console.log(k,JSON.stringify(v));};
try{
 await send('Page.enable');await send('Runtime.enable');await view(1360,900);
 const email=randomUUID()+'@kwhtrack.test',pass=randomUUID()+'-Pw1';
 await nav(base+'/empresarial');await waitFor("!!document.querySelector('#auth-form')");
 await click('[data-act=tab-register]');await setv('#f-organization','Empresa E2E');await setv('#f-name','Tester');await setv('#f-email',email);await setv('#f-password',pass);
 await ev("document.querySelector('#auth-form .primary').click()");await waitFor("!!document.querySelector('#sidebar')");ok('registro_y_sesion',true);
 await shot('01-resumen-vacio');
 await clickText('button','Añadir edificio de demostración');await waitFor("document.querySelectorAll('.card .badge.demo').length>0");
 await clickText('button','Crear edificio');await waitFor("!!document.querySelector('#f-name')");
 await setv('#f-name','Sede E2E');await setv('#f-count','2');await setv('#f-per','3');await ev("document.querySelector('#dlg-ok').click()");await waitFor("document.querySelector('#stage-wrap')");
 ok('crear_edificio_ui',await ev("document.querySelector('h1').textContent.includes('Sede E2E')"));
 await waitFor("document.querySelectorAll('.glb-label').length>=2",40000);await sleep(3000);await shot('02-edificio-3d-cuenta');
 // piso, distribución
 await click('[data-act=enter-floor]');await sleep(4000);await shot('03-piso-abierto');
 await clickText('button','Editar distribución');await waitFor("!!document.querySelector('#plan')");await shot('04-editor-planta');
 await setv('[data-lay=x][data-i="1"]','0.5');await setv('[data-lay=y][data-i="1"]','0.5');
 ok('solape_detectado',await ev("document.querySelector('#lay-err').textContent.length>0"));
 await ev("document.querySelector('#dlg-ok').click()");await sleep(800);
 ok('solape_rechazado_al_guardar',await ev("!document.querySelector('#dlg-error').hidden&&document.querySelector('#dlg-error').textContent.length>0"));
 await shot('05-editor-solape');
 await setv('[data-lay=x][data-i="0"]','0');await setv('[data-lay=y][data-i="0"]','0');await setv('[data-lay=w][data-i="0"]','5');await setv('[data-lay=d][data-i="0"]','5');
 await setv('[data-lay=x][data-i="1"]','6');await setv('[data-lay=y][data-i="1"]','0');await setv('[data-lay=w][data-i="1"]','6');await setv('[data-lay=d][data-i="1"]','5');
 await setv('[data-lay=x][data-i="2"]','0');await setv('[data-lay=y][data-i="2"]','6');await setv('[data-lay=w][data-i="2"]','12');await setv('[data-lay=d][data-i="2"]','5');
 await ev("document.querySelector('#dlg-ok').click()");await waitFor("!document.querySelector('#dlg').open");await sleep(3500);
 ok('layout_guardado',await ev("fetch('/api/org/buildings').then(r=>r.json()).then(async d=>{const b=d.buildings.find(x=>x.name==='Sede E2E');const f=await fetch('/api/org/buildings/'+b.id).then(r=>r.json());return JSON.stringify(f.building.floors[0].spaces.map(s=>s.plan))})"));
 await shot('06-piso-distribucion-personalizada');
 await nav(base+'/empresarial#edificios');await waitFor("!!document.querySelector('#stage-wrap')");
 ok('layout_tras_recargar',await ev("fetch('/api/org/buildings').then(r=>r.json()).then(async d=>{const b=d.buildings.find(x=>x.name==='Sede E2E');const f=await fetch('/api/org/buildings/'+b.id).then(r=>r.json());return f.building.floors[0].spaces[2].plan.w})"));
 // deshacer
 await ev("document.querySelector('[data-act=open-b]')?.click()").catch(()=>{});
 await clickText('[data-act=sec]','Resumen');await waitFor("document.querySelector('[data-act=open-b]')");
 await ev(`[...document.querySelectorAll('[data-act=open-b]')].find(b=>b.closest('article')?.textContent.includes('Sede E2E')).click()`);await waitFor("!!document.querySelector('#stage-wrap')");
 ok('boton_deshacer',await ev("document.querySelector('[data-act=undo]')?.textContent"));
 await click('[data-act=undo]');await waitFor("document.querySelector('#dlg').open");await shot('07-deshacer-confirmacion');
 await ev("document.querySelector('#dlg-ok').click()");await sleep(1500);
 ok('layout_tras_deshacer',await ev("document.querySelector('[data-act=undo]')===null||document.querySelector('[data-act=undo]').textContent"));
 // medidores
 await clickText('[data-act=sec]','Lecturas y facturas');await waitFor("!!document.querySelector('[data-act=add-meter]')");
 await click('[data-act=add-meter]');await waitFor("!!document.querySelector('#f-name')");await setv('#f-name','Medidor general');await ev("document.querySelector('#dlg-ok').click()");await waitFor("document.querySelector('[data-act=add-reading]')");
 for(const [d,v] of [['2026-01-01',1000],['2026-02-01',1600]]){await click('[data-act=add-reading]');await waitFor("!!document.querySelector('#f-date')");await setv('#f-date',d);await setv('#f-value',v);await ev("document.querySelector('#dlg-ok').click()");await waitFor("!document.querySelector('#dlg').open");await sleep(500);}
 await sleep(500);ok('medicion_periodo',await ev("document.querySelector('#main').textContent.match(/Total medido del edificio[^.]*/)?.[0]"));await shot('08-lecturas-medidores');
 await click('[data-act=add-reading]');await setv('#f-date','2026-01-15');await setv('#f-value',900);await ev("document.querySelector('#dlg-ok').click()");await sleep(700);
 ok('lectura_decreciente_rechazada',await ev("document.querySelector('#dlg-error').textContent"));await ev("document.querySelector('[data-close]').click()");
 // comparar
 await clickText('[data-act=sec]','Comparar edificios');await waitFor("document.querySelectorAll('.cmp-host canvas').length===2",40000);await sleep(3000);await shot('09-comparar');
 // teclado: orden de foco y diálogo
 await clickText('[data-act=sec]','Equipos y espacios');await sleep(300);
 await ev("document.body.focus();document.activeElement.blur()");
 const order=[];for(let i=0;i<8;i++){await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});order.push(await ev("(()=>{const a=document.activeElement;return (a.tagName+':'+(a.getAttribute('aria-label')||a.textContent||a.id||'').trim().slice(0,28))})()"));}
 ok('orden_de_foco_tab',order);
 await click('[data-act=add-common]');await waitFor("document.querySelector('#dlg').open");
 ok('foco_en_dialogo',await ev("document.querySelector('#dlg').contains(document.activeElement)"));
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await sleep(400);
 ok('escape_cierra_dialogo',await ev("!document.querySelector('#dlg').open"));
 ok('foco_vuelve_al_disparador',await ev("document.activeElement?.dataset?.act||document.activeElement.tagName"));
 // móvil
 await view(500,900);
 for(const [sec,n] of [['presupuesto','10-movil-presupuesto'],['simulador','11-movil-simulador'],['comparar','12-movil-comparar'],['edificios','13-movil-edificios']]){await ev(`location.hash='${sec}';`);await ev(`document.querySelector('[data-act=sec][data-sec=${sec}]').click()`);await sleep(sec==='edificios'||sec==='comparar'?5000:1200);await shot(n);ok('sin_scroll_horizontal_'+sec,await ev("document.documentElement.scrollWidth<=document.documentElement.clientWidth+1"));}
 await view(1360,900);
 // sin WebGL: forzar fallo
 R.fin=true;
}catch(e){console.log('ERROR',e.message);R.error=e.message;await shot('zz-error').catch(()=>{});}
await fs.writeFile(out+'/resultado.json',JSON.stringify(R,null,1));
try{await send('Browser.close');}catch{}proc.kill();setTimeout(()=>process.exit(0),500);
