// Mini cliente CDP para verificar la interfaz en Chrome real. Sin dependencias (usa WebSocket de Node).
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
export const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export async function launch({port=9340,out=os.tmpdir(),width=1360,height=900,flags=[]}={}){
 await fs.mkdir(out,{recursive:true});
 const chrome=process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe';
 const prof=path.resolve(os.tmpdir(),'kwh-cdp-'+port+'-'+Date.now());
 const proc=spawn(chrome,['--headless=new','--disable-gpu','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader',`--remote-debugging-port=${port}`,`--user-data-dir=${prof}`,`--window-size=${width},${height}`,...flags,'about:blank'],{stdio:['ignore','ignore','pipe']});let launchErrors='';proc.stderr.on('data',chunk=>{launchErrors=(launchErrors+String(chunk)).slice(-1800);});proc.on('error',e=>launchErrors=e.message);
 let tgt;for(let i=0;i<40;i++){try{tgt=(await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t=>t.type==='page');if(tgt)break;}catch{}await sleep(500);}
 if(!tgt){proc.kill();throw Error('Chrome no arrancó (salida '+proc.exitCode+'): '+launchErrors.slice(-900));}
 const ws=new WebSocket(tgt.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r));
 let id=0;const pend=new Map();ws.addEventListener('message',m=>{const d=JSON.parse(m.data);if(d.id&&pend.has(d.id)){pend.get(d.id)(d);pend.delete(d.id);}});
 const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
 const ev=async expr=>{const r=await send('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true});if(r.result.exceptionDetails)throw Error(r.result.exceptionDetails.exception?.description||'error');return r.result.result.value;};
 const lib={send,ev,out,sleep,
  async shot(n){const r=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(path.join(out,n+'.png'),Buffer.from(r.result.data,'base64'));},
  async waitFor(expr,ms=30000){const t=Date.now();while(Date.now()-t<ms){try{if(await ev(expr))return true;}catch{}await sleep(250);}throw Error('timeout: '+expr);},
  click:sel=>ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)throw Error('no existe '+${JSON.stringify(sel)});e.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));return true})()`),
  setv:(sel,v)=>ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});e.value=${JSON.stringify(String(v))};e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));return true})()`),
  async key(k,code=k,vk=0){const text=k==='Enter'?String.fromCharCode(13):k===' '?' ':undefined;for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:k,code,windowsVirtualKeyCode:vk,...(type==='keyDown'&&text?{text}:{})});},
  async nav(url){await send('Page.navigate',{url});await sleep(1200);},
  async close(){try{await Promise.race([send('Browser.close'),sleep(1500)]);}catch{}if(proc.exitCode==null)await Promise.race([new Promise(resolve=>proc.once('exit',resolve)),sleep(1500)]);proc.kill();await sleep(150);}};
 await send('Page.enable');await send('Runtime.enable');await send('DOM.enable');
 return lib;
}
