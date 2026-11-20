import {launch,sleep} from './cdp-lib.mjs';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs/promises';
import path from 'node:path';
const out=fileURLToPath(new URL('../../tmp/solar-ux/',import.meta.url)),c=await launch({port:9456,out,width:390,height:844}),checks=[];
const check=(name,ok)=>{checks.push({name,ok:!!ok});console.log(ok?'OK':'FAIL',name);if(!ok)throw Error(name);};
try{
 await c.nav('http://127.0.0.1:3000/empresarial?ux=mobile-final#demo&sec=solar&fresh=1');await c.waitFor('KwhGlb.last?.debug().view.roofMode');
 await c.click('.solar-mobile-stepper [data-solar-step="1"]');await sleep(650);
 check('mobile controls beside roof update exact count without hiding the header',await c.ev('document.querySelector("#solar-mobile-count").textContent==="13"&&KwhGlb.last.debug().floors.at(-1).solarDrawn===13&&document.documentElement.scrollWidth<=innerWidth+1&&getComputedStyle(document.querySelector(".solar-quantity")).position==="static"'));
 await c.ev('document.querySelector(".solar-preview").scrollIntoView({block:"start"})');await sleep(250);await c.shot('04-mobile');
 await c.setv('#solar-city','Cartagena de Indias');await c.click('[data-city="0"]');await c.click('#solar-form button[type=submit]');await c.waitFor('!!document.querySelector("#solar-generation-goal")',30000);
 await c.setv('#solar-generation-goal','75');const expected=await c.ev('Number(document.querySelector("#solar-try-sizing").textContent.replace(/[^0-9]/g,""))');await c.click('#solar-try-sizing');await sleep(650);
 check('generation target recommendation can be applied directly to the roof',await c.ev(`Number(document.querySelector('#solar-panel-count').value)===${expected}&&KwhGlb.last.debug().floors.at(-1).solarDrawn===${expected}`));
}finally{await fs.writeFile(path.join(out,'mobile-results.json'),JSON.stringify(checks,null,2));await c.close();}
