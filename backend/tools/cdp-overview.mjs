import {launch,sleep} from './cdp-lib.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
const out=path.resolve('../tmp/overview-experience'),c=await launch({port:9388,out,width:1500,height:1120}),checks=[];
const check=(name,ok)=>{checks.push({name,ok:!!ok});console.log(ok?'OK':'FAIL',name);if(!ok)throw Error(name);};
try{
 await c.send('Page.addScriptToEvaluateOnNewDocument',{source:"window.overviewErrors=[];addEventListener('error',e=>overviewErrors.push(e.message));addEventListener('unhandledrejection',e=>overviewErrors.push(String(e.reason)));"});
 await c.nav('http://127.0.0.1:3000/empresarial?overviewTest=1#demo&sec=resumen&fresh=1');await c.waitFor('!!document.querySelector(".overview-ranking")');
 check('demo summary has real inventory charts',await c.ev("document.querySelectorAll('.overview-level-bars>button').length===3&&document.querySelector('.overview-donut')!==null"));
 check('total includes only inventory',await c.ev("document.querySelector('.overview-kpis b').textContent.includes('2.671')"));
 check('registered units include quantities',await c.ev("document.querySelectorAll('.overview-kpis b')[1].textContent.includes('52')"));
 check('highest group is four AC units at 844.8 kWh',await c.ev("(()=>{const first=document.querySelector('.overview-ranking li');return first.textContent.includes('844,8')&&first.textContent.includes('×4')&&first.textContent.includes('Piso 1')})()"));
 check('second rank is servers at 576 kWh',await c.ev("document.querySelectorAll('.overview-ranking li')[1].textContent.includes('576')"));
 check('missing spaces remain explicit despite full coverage of lines',await c.ev("document.querySelectorAll('.overview-kpis p')[2].textContent.includes('5 espacio')"));
 check('grouping of minor categories preserves total',await c.ev("document.querySelector('.overview-category-key').textContent.includes('Otras categorías')"));
 await c.shot('01-summary');await c.click('[data-act=overview-more]');check('ranking expands to ten',await c.ev("document.querySelectorAll('.overview-ranking li').length===10"));await c.ev("document.querySelector('.overview-ranking').scrollIntoView({block:'start'})");await c.shot('02-ranking');
 await c.click('.overview-ranking li button');await c.waitFor("document.querySelector('#panel-title')?.textContent==='Aire acondicionado'");check('ranking opens the exact equipment',await c.ev("document.querySelector('#panel').textContent.includes('844,8')&&document.querySelector('#panel').textContent.includes('Espacio A')"));
 await c.click('[data-act=sec][data-sec=resumen]');await c.click('.overview-level-bars>button');await c.waitFor("document.querySelector('#panel-title')?.textContent==='Piso 1'");check('floor graph opens correct floor',await c.ev("KwhGlb.last.debug().view.level==='floor'"));
 await c.click('[data-act=sec][data-sec=resumen]');await c.send('Emulation.setDeviceMetricsOverride',{width:500,height:950,deviceScaleFactor:1,mobile:false});await sleep(300);check('summary mobile has no page overflow',await c.ev('document.documentElement.scrollWidth<=innerWidth+1'));await c.shot('03-mobile');
 await c.ev("document.querySelector('.overview-ranking').scrollIntoView({block:'start'})");await c.shot('04-mobile-ranking');
 check('no page errors',await c.ev('overviewErrors.length===0'));
}catch(e){checks.push({name:e.message,ok:false});console.error(e.stack);process.exitCode=1;}
finally{await fs.writeFile(path.join(out,'results.json'),JSON.stringify(checks,null,2));await c.close();}
