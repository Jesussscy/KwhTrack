import {launch} from './cdp-lib.mjs';
const c=await launch({port:9395,out:'../tmp/forms-reliability',width:1360,height:800});
try{
 await c.nav('http://127.0.0.1:3000/empresarial#demo&sec=edificios&floor=1&space=1&level=space&fresh=1');
 await c.waitFor('!!document.querySelector("[data-act=add-eq]")');await c.click('[data-act=add-eq]');
 console.log(await c.ev(`(()=>{const d=document.querySelector('#dlg'),e=d.querySelector('[name=paused]'),l=e.closest('label');return {checkbox:e.getBoundingClientRect().toJSON(),label:l.getBoundingClientRect().toJSON(),minHeight:getComputedStyle(e).minHeight,padding:getComputedStyle(e).padding,dialog:d.getBoundingClientRect().toJSON(),dialogScroll:d.scrollHeight,formScroll:document.querySelector('#dlg-form').scrollHeight,preview:document.querySelector('#eq-preview').textContent,ok:document.querySelector('#dlg-ok').getBoundingClientRect().toJSON()};})()`));
 await c.ev('document.querySelector(".dlg-scroll").scrollTop=10000');await c.shot('diagnosis-current');
}finally{await c.close();}
