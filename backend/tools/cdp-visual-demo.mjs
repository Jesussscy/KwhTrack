// Validación visual acotada: solo sandbox local. No crea cuentas ni toca MySQL.
import {launch,sleep} from './cdp-lib.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
const out=path.resolve(process.argv[2]||'../tmp/visual-demo'),base=process.argv[3]||'http://127.0.0.1:3000';
const c=await launch({port:9385,out,width:1540,height:1100}),results=[];
const check=(name,value)=>{results.push({name,ok:!!value});console.log(value?'OK':'FAIL',name);if(!value)throw Error(name);};
const debug=()=>c.ev('KwhGlb.last.debug()');
try{
 await c.send('Page.addScriptToEvaluateOnNewDocument',{source:"window.visualErrors=[];window.visualWrites=[];addEventListener('error',e=>visualErrors.push(e.message));addEventListener('unhandledrejection',e=>visualErrors.push(String(e.reason)));const nativeFetch=window.fetch;window.fetch=(url,opts={})=>{if(opts.method&&opts.method!=='GET')visualWrites.push(String(url));return nativeFetch(url,opts);};"});
 await c.nav(base+'/empresarial#demo&sec=edificios&fresh=1');await c.waitFor('window.KwhGlb?.last?.debug().floors.length===3',60000);await sleep(2000);
 await c.shot('01-exterior');check('exterior assembled by default',!(await c.ev("document.querySelector('[data-act=opt-explode]').getAttribute('aria-pressed')==='true'")));
 for(const i of [0,1,2]){await c.ev(`document.querySelectorAll('#floors-sel [data-act=enter-floor]')[${i}].click()`);await sleep(1800);const d=await debug(),f=d.floors[i];check('interior visible floor '+(i+1),!f.roof&&!f.facade&&d.view.floorId===f.id);await c.shot('02-interior-'+(i+1));}
 const strip=await c.ev("(()=>{const g=document.querySelector('#space-strip svg [tabindex]');g.focus();return {outline:getComputedStyle(g).outlineStyle,shadow:getComputedStyle(g).boxShadow}})()");check('SVG focus does not obscure rooms',strip.outline==='none'&&strip.shadow==='none');await c.shot('03-plan-focus');
 for(const i of [0,2,1,0,2]){await c.ev(`document.querySelectorAll('#floors-sel [data-act=enter-floor]')[${i}].click()`);await sleep(50);}await sleep(2300);const d=await debug();check('rapid changes end on requested floor',d.view.floorId===d.floors[2].id&&!d.floors[2].roof);
 check('particles based on known consumption',d.particles.enabled&&d.particles.count>0&&d.particles.count<=560);
 await c.click('#panel [data-act=tour-floor]');await c.click('#dlg-ok');await c.waitFor('!!document.querySelector("#tour-bar [data-act=tour-toggle]")');await c.click('[data-act=cam-reset]');check('manual navigation pauses tour',await c.ev("document.querySelector('#tour-bar [data-act=tour-toggle]').textContent.includes('Reanudar')"));await c.click('[data-act=tour-exit]');
 await c.click('[data-act=cam-preset][data-preset=top]');await sleep(1400);let camera=await debug();check('top camera has near vertical direction',Math.abs(camera.cam[0]-camera.tgt[0])<.2);await c.shot('04-top-view');
 await c.click('[data-act=cam-preset][data-preset=iso]');await c.click('[data-act=add-floor]');await c.waitFor('document.querySelector("#dlg").open');await c.setv('#f-name','Piso 4 · Nuevo');await c.setv('#f-offices',4);await c.click('#dlg-ok');await c.waitFor('!document.querySelector("#dlg").open');await sleep(2200);
 const added=await debug();check('add floor with four offices and lobby',added.floors.length===4&&await c.ev("document.querySelector('#space-strip').textContent.includes('(5)')"));check('unknown floor has no consumption particles',added.particles.count===0);await c.shot('05-new-floor');
 await c.ev("document.querySelector('#space-strip .chip').click()");await c.click('#panel [data-act=enter-space]');await c.click('[data-act=add-eq]');await c.setv('#f-name','Aire de ejemplo');await c.setv('#f-category','Aire acondicionado');await c.setv('#f-quantity','2');await c.setv('#f-watts','1200');await c.setv('#f-hours','8');await c.setv('#f-days','22');await c.click('#dlg-ok');await c.waitFor('!document.querySelector("#dlg").open');await sleep(900);check('local inventory updates consumption and particles',await c.ev("document.querySelector('#panel').textContent.includes('422,4')")&&(await debug()).particles.count>0);
 check('sandbox mutations never call server',await c.ev('visualWrites.length===0'));
 await c.send('Page.reload');await c.waitFor('window.KwhGlb?.last?.debug().floors.length===4',60000);check('sandbox survives reload',(await debug()).floors.length===4);
 await c.ev("document.querySelectorAll('#floors-sel [data-act=enter-floor]')[2].click()");await sleep(1700);
 await c.click('.viewer-options summary');await c.click('[data-act=opt-particles]');await sleep(200);check('particles can be disabled',!(await debug()).particles.enabled);
 await c.click('[data-act=opt-particles]');await c.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await sleep(200);check('reduced motion disables particles',!(await debug()).particles.enabled);
 await c.send('Emulation.setEmulatedMedia',{features:[]});await c.setv('#visual-quality','basic');await sleep(200);check('basic quality disables particles',!(await debug()).particles.enabled);
 await c.setv('#visual-quality','balanced');await c.click('.viewer-options summary');
 await c.click('[data-act=full-view]');check('expanded view opens',await c.ev('!!document.querySelector(".expanded-view")'));await c.key('Escape','Escape',27);check('escape closes expanded view',!await c.ev('!!document.querySelector(".expanded-view")'));
 await c.send('Emulation.setDeviceMetricsOverride',{width:500,height:900,deviceScaleFactor:1,mobile:false});await sleep(900);check('mobile no horizontal overflow',await c.ev('document.documentElement.scrollWidth<=innerWidth+1'));await c.shot('06-mobile');
 await c.send('Emulation.clearDeviceMetricsOverride');await c.click('[data-act=demo-reset]');await c.click('#dlg-ok');await c.waitFor('!document.querySelector("#dlg").open');await sleep(1200);check('reset sandbox restores three floors',(await debug()).floors.length===3);
 check('no page errors',await c.ev('visualErrors.length===0'));
}catch(e){results.push({name:e.message,ok:false});console.error(e.stack);process.exitCode=1;}
finally{await fs.writeFile(path.join(out,'results.json'),JSON.stringify(results,null,2));await c.close();}
