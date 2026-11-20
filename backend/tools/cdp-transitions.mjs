// Reproduce transiciones entre pisos en el visor real (demostración local, 3 pisos) y verifica el estado final contra lo esperado.
// Uso: node tools/cdp-transitions.mjs <baseUrl> <carpetaCapturas>
import {launch,sleep} from './cdp-lib.mjs';
const [base,out]=[process.argv[2],process.argv[3]];
const c=await launch({out,port:9341});const R=[];
const state=()=>c.ev("KwhGlb.last.debug()");
// Esperado (independiente de la implementación): piso activo a (índice 0..n-1), H=3,4 m y YMAX=1,55
const expected=(a,n,{explode=false}={})=>({tgtY:a*(3.4+(explode?2.2:0))+1.55-.9,open:i=>i===a?1:0,visible:i=>i<=a});
async function settle(ms=25000){const t=Date.now();let last='';while(Date.now()-t<ms){const d=await state();const sig=JSON.stringify([d.cam,d.floors.map(f=>[f.y,f.open])]);if(sig===last&&!d.follow)return d;last=sig;await sleep(700);}return state();}
function check(name,d,a,opts){const e=expected(a,d.floors.length,opts),errs=[];
 if(Math.abs(d.tgt[1]-e.tgtY)>.6)errs.push(`objetivo de cámara y=${d.tgt[1]} (esperado ≈${e.tgtY.toFixed(2)})`);
 d.floors.forEach((f,i)=>{if(Math.abs(f.open-e.open(i))>.05)errs.push(`piso ${i+1}: apertura ${f.open} (esperado ${e.open(i)})`);if(f.visible!==e.visible(i))errs.push(`piso ${i+1}: visible=${f.visible} (esperado ${e.visible(i)})`);if(Math.abs(f.y-f.yT)>.05)errs.push(`piso ${i+1}: sin asentar (y=${f.y}, destino=${f.yT})`);});
 d.floors.forEach((f,i)=>{if(f.kind!=='proc')return;if(i===a&&(f.roof===true||f.facade===true))errs.push(`piso ${i+1} (generado) abierto pero con ${f.roof?'cubierta':'fachada'} visible: tapa el interior`);if(i!==a&&f.facade===false)errs.push(`piso ${i+1} (generado) cerrado sin fachada`);});
 if(d.view.floorId!==d.floors[a].id)errs.push(`piso activo del visor=${d.view.floorId}`);
 R.push({secuencia:name,ok:errs.length===0,errores:errs});console.log((errs.length?'FALLA ':'ok    ')+name+(errs.length?' → '+errs.join('; '):''));}
try{
 await c.nav(base+'/empresarial#demo&sec=edificios'+(process.argv[4]||''));await c.waitFor("window.KwhGlb&&KwhGlb.last&&KwhGlb.last.debug().floors.length===3&&document.querySelectorAll('.glb-label').length>0",60000);await sleep(2500);
 const floorBtn=i=>`document.querySelectorAll('#floors-sel [data-act=enter-floor]')[${i}]`; // Selector de pisos: excluye CTA contextual y árbol alternativo.
 const go=async i=>c.ev(`${floorBtn(i)}.click()`);
 const seqs={'P1 → P2':[0,1],'P2 → P1':[1,0],'P1 → P2 → P1 → P2 (rápido, sin esperar)':[0,1,0,1],'P1 → P2 → P3 → P2 → P1 (rápido)':[0,1,2,1,0],'P3 → P1 → P3 (rápido)':[2,0,2],'P1 → P3 → P2 (rápido)':[0,2,1]};
 for(const [name,seq] of Object.entries(seqs)){for(const i of seq){await go(i);await sleep(60);}await settle();check(name,await state(),seq.at(-1));await c.shot('t-'+name.replace(/[^a-z0-9]+/gi,'_'));}
 // vuelta al edificio y de nuevo adentro
 await c.ev("document.querySelector('[data-act=to-building]').click()");await sleep(300);await go(1);await sleep(100);await c.ev("document.querySelector('[data-act=to-building]').click()");await sleep(100);await go(2);await settle();check('edificio → P2 → edificio → P3 (rápido)',await state(),2);
 // actualizar un valor numérico no debe mover la cámara
 const before=await state();await c.ev("document.querySelector('[data-act=opt-layer]').click()");await sleep(1500);await c.ev("document.querySelector('[data-act=opt-layer]').click()");await sleep(1500);const after=await state();
 const moved=Math.hypot(...before.cam.map((v,i)=>v-after.cam[i]));R.push({secuencia:'refrescar capa/cálculo no mueve la cámara',ok:moved<.05,errores:moved<.05?[]:['la cámara se movió '+moved.toFixed(2)+' m']});console.log((moved<.05?'ok    ':'FALLA ')+'refrescar capa de consumo: movimiento de cámara = '+moved.toFixed(3));
 // aislar y explotar
 await go(1);await c.ev("document.querySelector('[data-act=opt-explode]').click()");await settle();check('P2 con vista explotada',await state(),1,{explode:true});await c.shot('t-explotada');
}catch(e){console.log('ERROR',e.message);R.push({secuencia:'error',ok:false,errores:[e.message]});}
await (await import('node:fs/promises')).writeFile(out+'/transiciones.json',JSON.stringify(R,null,1));
await c.close();setTimeout(()=>process.exit(R.every(r=>r.ok)?0:1),300);
