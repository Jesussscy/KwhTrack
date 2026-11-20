import {launch,sleep} from './cdp-lib.mjs';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs/promises';
const out=fileURLToPath(new URL('../../tmp/integral/',import.meta.url)),c=await launch({port:9479,out,width:1360,height:1000}),rows=[];
try{
 for(const floors of [3,12,40]){
  const began=Date.now();await c.nav(`http://127.0.0.1:3000/empresarial?integral=perf-${floors}#demo&sec=edificios&big=${floors}-6-4`);await c.waitFor(`KwhGlb.last?.debug().floors.length===${floors}&&!KwhGlb.last.debug().follow`,60000);
  const settledMs=Date.now()-began;for(let i=0;i<10;i++){await c.ev('KwhGlb.last.rotate(.05)');await sleep(80);}const perf=await c.ev('KwhGlb.last.perf()'),debug=await c.ev('KwhGlb.last.debug()');rows.push({floors,spaces:floors*6,equipmentGroups:floors*6*4,settledMs,render:perf,cameraDistance:Math.hypot(...debug.cam.map((x,i)=>x-debug.tgt[i]))});
  console.log(JSON.stringify(rows.at(-1)));if(floors===40){if(debug.floors.filter(f=>f.compact).length!==39)throw Error('La vista general no activó simplificación para 40 pisos.');await c.ev('document.querySelectorAll("#floors-sel [data-act=enter-floor]")[17].click()');await c.waitFor('KwhGlb.last.debug().floors[17].built&&!KwhGlb.last.debug().floors[17].compact',60000);rows.at(-1).detailVerified=true;}
 }
 // Escena expresamente incompleta para comprobar patrón no cromático en WebGL.
 await c.nav('http://127.0.0.1:3000/empresarial?integral=pattern#demo&fresh=1&sec=edificios');await c.waitFor('KwhGlb.last?.debug().floors.length===3');await c.ev('(()=>{const b=EnterpriseDemo.create();for(const e of b.floors[0].spaces[0].equipment)e.watts=null;localStorage.setItem("kwh-enterprise-visual-sandbox-v1",JSON.stringify({version:1,building:b}));})()');await c.nav('http://127.0.0.1:3000/empresarial?integral=pattern-restored#demo&sec=edificios&floor=1');await c.waitFor('KwhGlb.last?.debug().floors.length===3');await c.click('[data-act=opt-layer]');await c.waitFor('KwhGlb.last.debug().floors[0].missingPattern.length===1');await c.ev('document.querySelector("#glb-host").scrollIntoView({block:"start"})');await sleep(800);await c.shot('09-patron-sin-datos');
}finally{await fs.writeFile(out+'/rendimiento.json',JSON.stringify({environment:'Chrome headless, Windows, SwiftShader, sin aceleración GPU; intervalos del script y no FPS sostenidos',rows},null,2));await c.close();}
