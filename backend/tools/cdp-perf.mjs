// Mide carga y fluidez del visor con edificios sintéticos (solo demostración local, sin servidor de datos).
// Uso: node tools/cdp-perf.mjs <baseUrl> ; los resultados dependen del equipo: se imprime el contexto (render por software en headless).
import {spawn} from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
const base=process.argv[2],port=9334,prof=path.resolve(os.tmpdir(),'kwh-perf-'+Date.now());
const chrome=process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe';
const proc=spawn(chrome,['--headless=new','--disable-gpu','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader',`--remote-debugging-port=${port}`,`--user-data-dir=${prof}`,'--window-size=1360,900','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let tgt;for(let i=0;i<40;i++){try{tgt=(await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t=>t.type==='page');if(tgt)break;}catch{}await sleep(500);}
const ws=new WebSocket(tgt.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r));
let id=0;const pend=new Map();ws.addEventListener('message',m=>{const d=JSON.parse(m.data);if(d.id&&pend.has(d.id)){pend.get(d.id)(d);pend.delete(d.id);}});
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
const ev=async e=>{const r=await Promise.race([send('Runtime.evaluate',{expression:e,awaitPromise:true,returnByValue:true}),new Promise(x=>setTimeout(()=>x({result:{result:{value:null}}}),20000))]);if(r.result.exceptionDetails)throw Error(r.result.exceptionDetails.exception?.description);return r.result.result.value;};
await send('Page.navigate',{url:base+'/empresarial#demo&sec=edificios'});await sleep(6000); // calentamiento: descarga del modelo
const rows=[];
for(const [floors,spaces,eq,level] of [[3,4,4,'building'],[3,4,4,'floor'],[10,4,10,'building'],[10,4,10,'floor'],[10,6,8,'building'],[10,6,8,'floor'],[25,6,10,'building'],[25,6,10,'floor'],[40,6,10,'building'],[40,6,10,'floor']]){
 const t0=Date.now();
 const lv=level==='floor'?'&floor=1&level=floor':'';
 await send('Page.navigate',{url:`${base}/empresarial#demo&sec=edificios&big=${floors}-${spaces}-${eq}${lv}`});await sleep(800);await send('Page.reload');
 let ready=null;for(let i=0;i<80;i++){await sleep(250);try{if(await ev("document.querySelectorAll('.glb-label').length>0")){ready=Date.now()-t0;break;}}catch{}}
 const stat=await ev(`new Promise(res=>{const btn=document.querySelector('[data-act=cam-right]');let n=0;const t=setInterval(()=>{btn&&btn.click();if(++n>=30){clearInterval(t);setTimeout(()=>{try{res(KwhGlb.last.perf());}catch(e){res(null);}},600);}},150);})`);
 const resp=level==='building'?await ev(`new Promise(res=>{const b=document.querySelector('[data-act=enter-floor]');const t0=performance.now();b.click();requestAnimationFrame(()=>requestAnimationFrame(()=>res(performance.now()-t0)));})`):null; // clic → segundo fotograma pintado
 if(!stat){console.log(JSON.stringify({pisos:floors,nivel:level,error:'visor no listo'}));continue;}
 const mem=await ev("performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576):null");
 rows.push({pisos:floors,espacios_por_piso:spaces,lineas_por_espacio:eq,nivel:level,lineas_total:floors*spaces*eq,listo_ms:ready,render_ms_prom:+stat.avgMs.toFixed(2),render_ms_p95:+stat.p95Ms.toFixed(2),draw_calls:stat.calls,triangulos:stat.triangles,geometrias:stat.geometries,interiores:stat.interiors,heap_mb:mem,clic_a_frame_ms:resp==null?null:+resp.toFixed(1)});
 console.log(JSON.stringify(rows[rows.length-1]));
}
console.log('contexto:',os.cpus()[0].model.trim(),os.cpus().length+' hilos','render por software (SwiftShader, headless)');
try{await send('Browser.close');}catch{}proc.kill();setTimeout(()=>process.exit(0),300);
