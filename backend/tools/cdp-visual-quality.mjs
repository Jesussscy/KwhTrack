import {launch,sleep} from './cdp-lib.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
const out=path.resolve('../tmp/visual-quality'),rows=[];
let c=await launch({port:9386,out,width:1360,height:1000});
try{
 for(const n of [3,12]){
  await c.nav(`http://127.0.0.1:3000/empresarial?visualSample=${n}#demo&sec=edificios&big=${n}-4-1`);await c.waitFor(`KwhGlb.last?.debug().floors.length===${n}`,60000);await sleep(2000);
  for(const quality of ['basic','balanced']){
   await c.ev("document.querySelector('.viewer-options').open=true");await c.setv('#visual-quality',quality);await sleep(1200);
   const t=Date.now();await c.click('[data-act=cam-preset][data-preset=front]');await sleep(1500);
   rows.push({floors:n,quality,softwareRendering:true,sampleWindowMs:Date.now()-t,...await c.ev('KwhGlb.last.perf()')});
   await c.click('[data-act=cam-preset][data-preset=iso]');await sleep(700);
  }
 }
 await c.close();c=await launch({port:9386,out,width:500,height:900,flags:['--disable-3d-apis']});await c.nav('http://127.0.0.1:3000/empresarial#demo&sec=edificios');await c.waitFor("document.querySelector('#stage-status')?.textContent.includes('WebGL no disponible')",30000);await c.shot('fallback');
 rows.push({fallbackWithoutWebGL:true,noHorizontalOverflow:await c.ev('document.documentElement.scrollWidth<=innerWidth+1'),explanation:await c.ev("document.querySelector('#stage-status').textContent")});
}finally{await fs.mkdir(out,{recursive:true});await fs.writeFile(path.join(out,'quality.json'),JSON.stringify(rows,null,2));await c.close();}
console.log(JSON.stringify(rows,null,2));
