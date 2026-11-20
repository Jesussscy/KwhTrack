import {launch,sleep} from './cdp-lib.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
const out=path.resolve('../tmp/forms-reliability'),c=await launch({port:9396,out,width:1360,height:800}),checks=[];
const check=(name,ok)=>{checks.push({name,ok:!!ok});console.log(ok?'OK':'FAIL',name);if(!ok)throw Error(name);};
const open=async()=>{await c.click('[data-act=add-eq]');await c.waitFor('document.querySelector("#dlg").open');};
const save=()=>c.click('#dlg-ok');
const stored=()=>c.ev('JSON.parse(localStorage.getItem("kwh-enterprise-visual-sandbox-v1")).building');
try{
 await c.send('Page.addScriptToEvaluateOnNewDocument',{source:"window.formErrors=[];addEventListener('error',e=>formErrors.push(e.message));addEventListener('unhandledrejection',e=>formErrors.push(String(e.reason)));"});
 await c.nav('http://127.0.0.1:3000/empresarial#demo&sec=edificios&floor=1&space=1&level=space&fresh=1');await c.waitFor('!!document.querySelector("[data-act=add-eq]")');await open();
 check('initial preview is guidance instead of a name error',await c.ev('document.querySelector("#eq-preview").textContent.includes("Completa los datos")&&document.querySelector("#dlg-error").hidden'));
 check('checkboxes have explicit small dimensions',await c.ev('[...document.querySelectorAll("#dlg input[type=checkbox]")].every(e=>{const r=e.getBoundingClientRect();return r.width===18&&r.height===18;})'));
 check('checkbox and label text remain side by side',await c.ev('[...document.querySelectorAll(".choice")].every(l=>{const a=l.querySelector("input").getBoundingClientRect(),b=l.querySelector("span").getBoundingClientRect();return a.right<b.left&&Math.abs(a.top-b.top)<12;})'));
 check('header and footer fit the viewport',await c.ev('(()=>{const d=document.querySelector("#dlg").getBoundingClientRect(),b=document.querySelector("#dlg-ok").getBoundingClientRect();return d.top>=0&&d.bottom<=innerHeight&&b.bottom<=d.bottom;})()'));
 check('document is locked while the body scrolls internally',await c.ev('getComputedStyle(document.documentElement).overflow==="hidden"&&getComputedStyle(document.querySelector(".dlg-scroll")).overflowY==="auto"'));
 await c.ev('document.querySelector("[data-close]").click();document.querySelector("[data-act=add-eq]").click()');await sleep(120);check('rapid close and reopen keeps the new dialog active',await c.ev('document.querySelector("#dlg").open&&document.documentElement.classList.contains("org-dialog-open")'));
 await c.ev('document.querySelector(".dlg-scroll").scrollTop=10000');await c.shot('01-controls-corrected');
 await c.ev('document.querySelector("[name=paused]").focus()');await c.key(' ','Space',32);check('Space toggles paused checkbox',await c.ev('document.querySelector("[name=paused]").checked'));
 await c.ev('document.querySelector("[name=essential]").focus()');await c.key(' ','Space',32);check('Space toggles essential checkbox',await c.ev('document.querySelector("[name=essential]").checked'));
 await save();check('submit marks and focuses required name without losing flags',await c.ev('document.activeElement.name==="name"&&document.querySelector("#f-name").getAttribute("aria-invalid")==="true"&&document.querySelector("[name=paused]").checked'));await c.shot('02-validation');
 await c.setv('#f-name','Equipo de verificación');await c.setv('#f-quantity',1001);await save();check('quantity errors stay on the right field',await c.ev('document.activeElement.name==="quantity"&&!document.querySelector("#dlg-error").hidden'));
 await c.setv('#f-quantity',4);await c.ev('document.querySelector("#f-hours").focus()');await c.send('Input.insertText',{text:'-'});await save();check('an unfinished numeric input is rejected instead of saved as unknown',await c.ev('document.querySelector("#f-hours").validity.badInput&&document.activeElement.name==="hours"&&document.querySelector("#dlg-error").textContent.includes("Revisa el número")'));
 await c.setv('#f-watts',1200);await c.setv('#f-hours',25);await c.setv('#f-days',22);await save();check('hours beyond 24 are rejected before saving',await c.ev('document.activeElement.name==="hours"&&!localStorage.getItem("kwh-enterprise-visual-sandbox-v1")'));
 await c.setv('#f-hours',8);await c.setv('#f-days',1.5);await save();check('fractional days are rejected locally',await c.ev('document.activeElement.name==="days"'));
 await c.setv('#f-days',22);await c.setv('#f-factor',1.2);await save();check('factor above one is rejected locally',await c.ev('document.activeElement.name==="factor"'));
 await c.setv('#f-factor',1);await save();await c.waitFor('!document.querySelector("#dlg").open');let b=await stored(),eq=b.floors[0].spaces[0].equipment.find(e=>e.name==='Equipo de verificación');check('paused and essential flags persist without losing numeric inputs',eq.active===false&&eq.essential===true&&eq.hours===8&&eq.quantity===4);
 check('paused equipment stays excluded after save',eq.calc.kwh===0&&eq.calc.status==='paused');check('scroll lock is removed after close',await c.ev('!document.documentElement.classList.contains("org-dialog-open")'));
 await open();await c.setv('#f-name','Consumo mensual');await c.setv('#f-mode','monthly');check('inactive power fields are disabled and omitted',await c.ev('document.querySelector("#f-watts").disabled&&!new FormData(document.querySelector("#dlg-form")).has("hours")'));await c.setv('#f-quantity',3);await c.setv('#f-monthlyKwh',10);await save();await c.waitFor('!document.querySelector("#dlg").open');b=await stored();eq=b.floors[0].spaces[0].equipment.find(e=>e.name==='Consumo mensual');check('monthly mode multiplies only by quantity',eq.calc.kwh===30);
 await open();await c.setv('#f-name','Sin datos');await save();await c.waitFor('!document.querySelector("#dlg").open');b=await stored();eq=b.floors[0].spaces[0].equipment.find(e=>e.name==='Sin datos');check('blank usage fields remain unknown instead of zero',eq.watts===null&&eq.hours===null&&eq.days===null&&eq.calc.kwh===null);
 // Cambiar de tipo de diálogo detecta listeners viejos del formulario reutilizado.
 await c.click('[data-act=sec][data-sec=presupuesto]');await c.click('[data-act=edit-budget]');await c.setv('#f-mb',500000);check('opening another dialog does not execute stale equipment listeners',await c.ev('formErrors.length===0'));await c.key('Escape','Escape',27);await c.click('[data-discard=discard]');
 await c.click('[data-act=sec][data-sec=edificios]');await c.waitFor('!!document.querySelector("[data-act=add-eq]")');
 for(const width of [500,390,320]){await c.send('Emulation.setDeviceMetricsOverride',{width,height:700,deviceScaleFactor:1,mobile:false});await open();await c.ev('document.querySelector(".dlg-scroll").scrollTop=10000');await sleep(100);check(`dialog controls remain visible without page overflow at ${width}px`,await c.ev('(()=>{const r=document.querySelector("#dlg-ok").getBoundingClientRect();return r.bottom<=innerHeight&&r.left>=0&&document.documentElement.scrollWidth<=innerWidth+1;})()'));if(width===390)await c.shot('03-mobile-controls');await c.click('[data-close]');}
 check('no runtime errors across reused dialogs',await c.ev('formErrors.length===0'));
}catch(e){console.error(e.stack);checks.push({name:e.message,ok:false});process.exitCode=1;await c.shot('failure');}
finally{await fs.writeFile(path.join(out,'results.json'),JSON.stringify(checks,null,2));await c.close();}
