// Prueba el pronóstico y la aplicación del plan solo sobre el sandbox local.
import {launch,sleep} from './cdp-lib.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
const out=path.resolve('../tmp/prediction-experience'),c=await launch({port:9390,out,width:1480,height:1120}),checks=[];
const check=(name,ok)=>{checks.push({name,ok:!!ok});console.log(ok?'OK':'FAIL',name);if(!ok)throw Error(name);};
const generate=()=>c.ev("document.querySelector('#prediction-config button[type=submit]').click()");
try{
 await c.send('Page.addScriptToEvaluateOnNewDocument',{source:"window.predictionErrors=[];window.predictionWrites=[];addEventListener('error',e=>predictionErrors.push(e.message));addEventListener('unhandledrejection',e=>predictionErrors.push(String(e.reason)));const originalFetch=fetch;window.fetch=(url,opts={})=>{if(opts.method&&opts.method!=='GET')predictionWrites.push(String(url));return originalFetch(url,opts);};"});
 await c.nav('http://127.0.0.1:3000/empresarial?predictionTest=1#demo&sec=prediccion&fresh=1');await c.waitFor('!!document.querySelector("#prediction-config")');
 check('prediction is a visible navigation section',await c.ev("!!document.querySelector('.sidebar [data-sec=prediccion]')"));
 check('no history does not pretend a trained model',await c.ev("document.querySelector('.prediction-hero').textContent.includes('ESCENARIO POR INVENTARIO')&&document.querySelector('#main').textContent.includes('se necesitan al menos 6')"));await c.shot('01-inventory-scenario');
 await c.click('[data-act=sec][data-sec=resumen]');check('overview has direct prediction action',await c.ev("!!document.querySelector('[data-act=prediction-open]')"));await c.click('[data-act=prediction-open]');await c.click('[data-act=pred-example]');
 check('illustrative history is clearly labeled',await c.ev("document.querySelector('.demo-banner').textContent.includes('8 periodos ilustrativos')"));
 check('six models are evaluated out of sample',await c.ev("document.querySelectorAll('.prediction-method [data-model-kind]').length===6&&document.querySelector('.prediction-hero').textContent.includes('5 periodos no usados')"));
 check('six-month forecast and savings chart exist',await c.ev("document.querySelectorAll('.prediction-plot tbody tr').length===6&&!!document.querySelector('.prediction-chart-wrap svg')"));await c.shot('02-prediction');
 check('continuous servers are protected',await c.ev("!document.querySelector('.prediction-plan tbody').textContent.includes('Servidor')&&document.querySelector('.prediction-protected').textContent.includes('Servidor')"));
 const exclude=await c.ev("(()=>{const e=document.querySelector('#prediction-config input[name=exclude]');e.checked=true;e.dispatchEvent(new Event('input',{bubbles:true}));return e.value;})()");check('editing settings requires recalculation',await c.ev("document.querySelector('[data-act=pred-apply]').disabled"));
 await c.setv('#prediction-config [name=goal]',80);await c.setv('#prediction-config [name=limit]',10);await c.setv('#prediction-config [name=horizon]',3);await generate();
 check('unreachable target is explicit',await c.ev("document.querySelector('.prediction-plan>p').textContent.includes('no es alcanzable')"));check('equipment exclusions are honored',await c.ev(`!document.querySelector('.prediction-plan [data-eq="${exclude}"]')`));check('horizon is configurable',await c.ev("document.querySelectorAll('.prediction-plot tbody tr').length===3"));
 await c.ev("document.querySelectorAll('#prediction-config input[name=exclude]').forEach(e=>e.checked=false)");await c.setv('#prediction-config [name=goal]',15);await c.setv('#prediction-config [name=limit]',30);await c.setv('#prediction-config [name=horizon]',6);await c.setv('#prediction-config [name=tariff]',1000);await generate();
 check('scenario tariff produces explicit cost estimate',await c.ev("document.querySelector('.prediction-hero-number').textContent.includes('COP')"));
 const reportPath=path.join(out,'kwh-pronostico-y-plan.json');await fs.rm(reportPath,{force:true});await fs.rm(reportPath+'.crdownload',{force:true});await c.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:out});await c.click('[data-act=pred-export]');let exported;for(let i=0;i<100;i++){try{exported=JSON.parse(await fs.readFile(reportPath,'utf8'));break;}catch{}await sleep(100);}if(!exported)throw Error('La descarga del informe no terminó.');
 check('proposal exports model and exact changes',exported.result.historical.ready&&exported.result.plan.changes.length>0&&exported.illustrativeHistory===true);
 check('calculating a plan does not mutate inventory',await c.ev("!localStorage.getItem('kwh-enterprise-visual-sandbox-v1')"));
 await c.click('[data-act=pred-apply]');await c.waitFor('document.querySelector("#dlg").open');check('review shows exact schedule changes',await c.ev("document.querySelector('#dlg-body').textContent.includes('5,6')&&document.querySelector('#dlg-body').textContent.includes('Aire acondicionado')"));await c.shot('03-plan-review');await c.click('[data-close]');
 check('canceling review does not save',await c.ev("!localStorage.getItem('kwh-enterprise-visual-sandbox-v1')"));
 await c.click('[data-act=pred-apply]');await c.click('#dlg-ok');await c.waitFor('!document.querySelector("#dlg").open');
 const saved=await c.ev("JSON.parse(localStorage.getItem('kwh-enterprise-visual-sandbox-v1')).building"),equipment=saved.floors.flatMap(f=>f.spaces.flatMap(s=>s.equipment));
 check('approved plan updates exactly proposed hours',exported.result.plan.changes.every(ch=>equipment.find(e=>e.id===ch.id).hours===ch.hours));check('protected server still uses 24 hours',equipment.find(e=>e.category==='Servidor').hours===24);
 check('applied plan is acknowledged and not reapplied implicitly',await c.ev("!!document.querySelector('.prediction-success')&&document.querySelector('[data-act=pred-apply]').disabled"));
 await c.send('Emulation.setDeviceMetricsOverride',{width:500,height:950,deviceScaleFactor:1,mobile:false});await sleep(300);check('mobile has no horizontal page overflow',await c.ev('document.documentElement.scrollWidth<=innerWidth+1'));await c.shot('04-mobile');
 check('sandbox does not send mutation requests',await c.ev('predictionWrites.length===0'));check('no page errors',await c.ev('predictionErrors.length===0'));
}catch(e){checks.push({name:e.message,ok:false});console.error(e.stack);process.exitCode=1;}
finally{await fs.writeFile(path.join(out,'results.json'),JSON.stringify(checks,null,2));await c.close();}
