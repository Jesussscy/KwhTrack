// E2E de la etapa “asistente de espacios, recorridos y análisis” en Chrome real.
// Uso: node tools/cdp-e2e3.mjs <baseUrlConBaseDePruebas> <carpetaCapturas>
import {launch,sleep} from './cdp-lib.mjs';
import {randomUUID} from 'node:crypto';
import path from 'node:path';
const [base,out]=[process.argv[2],path.resolve(process.argv[3])];
const c=await launch({out,port:9350});const R={};
const ok=(k,v)=>{R[k]=v;console.log(k,typeof v==='string'?v.slice(0,170):JSON.stringify(v).slice(0,230));};
const api=(p,method='GET',body)=>c.ev(`(async()=>{const s=await fetch('/api/org/session').then(r=>r.json());const r=await fetch('/api/org'+${JSON.stringify(p)},{method:${JSON.stringify(method)},headers:{'Content-Type':'application/json','X-CSRF-Token':s.csrfToken},body:${body===undefined?'undefined':`JSON.stringify(${JSON.stringify(body)})`}});return {status:r.status,data:await r.json()};})()`);
const bld=async id=>(await api('/buildings/'+id)).data.building;
const dbg=()=>c.ev("KwhGlb.last.debug()");
const reload=async hash=>{await c.nav(base+'/empresarial?r='+Date.now()+hash);await c.waitFor("!!document.querySelector('#sidebar')");};
async function openFloor(fid){await c.waitFor("!!document.querySelector('#stage-wrap')");await c.click(`[data-act=enter-floor][data-id="${fid}"]`);await sleep(1200);}
try{
 await c.nav(base+'/empresarial');await c.waitFor("!!document.querySelector('#auth-form')");
 await c.click('[data-act=tab-register]');await c.setv('#f-organization','Empresa Asistente');await c.setv('#f-name','Tester');await c.setv('#f-email',randomUUID()+'@kwhtrack.test');await c.setv('#f-password',randomUUID()+'-Pw1');
 await c.ev("document.querySelector('#auth-form .primary').click()");await c.waitFor("!!document.querySelector('#sidebar')");
 let b=(await api('/buildings','POST',{name:'Sede Asistente',floors:[{name:'Piso 1'},{name:'Piso 2'},{name:'Piso 3'},{name:'Piso 4'}],spacesPerFloor:0})).data.building;
 const [P1,P2,P3,P4]=b.floors;
 await reload('#edificios');await c.waitFor("window.KwhGlb&&KwhGlb.last",60000);
 // ---------- Piso 3: cuatro oficinas y un lobby
 await openFloor(P3.id);await c.click(`[data-act=wizard][data-id="${P3.id}"]`);await c.waitFor("!!document.querySelector('#wz-sum')&&document.querySelector('#wz-sum').textContent.length>5");
 ok('resumen_previo',await c.ev("document.querySelector('#wz-sum').textContent"));await c.shot('b1-asistente-piso3');
 ok('suma_categorias_5',await c.ev("/5 espacio/.test(document.querySelector('#wz-sum').textContent)&&/4 oficina/.test(document.querySelector('#wz-sum').textContent)&&/1 lobby/.test(document.querySelector('#wz-sum').textContent)"));
 await c.setv('#wz-c-Oficina','3');await c.setv('#wz-c-Oficina','4');await sleep(300);
 ok('vista_previa_no_escribe',(await bld(b.id)).floors[2].spaces.length===0);
 await c.ev("document.querySelector('[data-wz=name][data-key=\"Oficina#0\"]').value='Dirección';document.querySelector('[data-wz=name][data-key=\"Oficina#0\"]').dispatchEvent(new Event('input',{bubbles:true}))");
 await c.ev("document.querySelector('#dlg-ok').click()");await c.waitFor("!document.querySelector('#dlg').open");await sleep(5000);
 b=await bld(b.id);const f3=b.floors[2];
 ok('piso3_5_espacios',{n:f3.spaces.length,oficinas:f3.spaces.filter(s=>s.kind==='Oficina').length,lobby:f3.spaces.filter(s=>s.kind==='Lobby').length,ids_unicos:new Set(f3.spaces.map(s=>s.id)).size,corredor:!!f3.config.corridorRect,renombrado:f3.spaces.some(s=>s.name==='Dirección')});
 await c.shot('b2-piso3-generado');
 // ---------- selección sincronizada (regleta, miniatura, panel, modelo, ubicación)
 const strip=await c.ev("document.querySelectorAll('#space-strip .chip').length");ok('fichas_en_regleta',strip);
 const target=f3.spaces.find(s=>s.name==='Oficina 2');
 await c.click(`#space-strip .chip[data-id="${target.id}"]`);await sleep(600);
 const sync=async id=>c.ev(`(()=>{const chips=[...document.querySelectorAll('#space-strip .chip[aria-pressed=true]')].map(e=>e.dataset.id),mini=[...document.querySelectorAll('#space-strip svg g[aria-pressed=true]')].map(e=>e.dataset.id),title=document.querySelector('#panel-title').textContent,loc=document.querySelector('#loc').textContent,v=KwhGlb.last.debug().view.spaceId;return {chips,mini,title,loc:loc.replace(/\\s+/g,' ').trim().slice(0,60),visor:v,esperado:${id}}})()`);
 let s1=await sync(target.id);ok('seleccion_regleta',s1);ok('misma_seleccion_en_todo',s1.chips.length===1&&s1.mini.length===1&&s1.chips[0]==String(target.id)&&s1.mini[0]==String(target.id)&&s1.visor===target.id&&s1.title.includes('Oficina 2')&&s1.loc.includes('Piso 3')&&s1.loc.includes('Oficina 2'));
 const other=f3.spaces.find(s=>s.name==='Lobby');
 await c.ev(`document.querySelector('#space-strip svg g[data-id="${other.id}"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))`);await sleep(600);
 s1=await sync(other.id);ok('seleccion_miniatura',s1.chips[0]==String(other.id)&&s1.mini[0]==String(other.id)&&s1.visor===other.id&&s1.title.includes('Lobby'));
 await c.ev(`(()=>{const g=document.querySelector('#space-strip svg g[data-id="${target.id}"]');g.focus();})()`);await c.key('Enter','Enter',13);await sleep(600);
 ok('seleccion_con_teclado_en_miniatura',(await sync(target.id)).visor===target.id);
 await c.click('[data-act=view-floor-all]');await sleep(400);ok('ver_todo_el_piso',await c.ev("KwhGlb.last.debug().view.spaceId===null&&document.querySelector('#panel-title').textContent==='Piso 3'"));
 // ---------- Piso 1 (2 oficinas sin lobby) y Piso 2 (3 oficinas + recepción)
 const wiz=async(fid,counts)=>{await c.click(`[data-act=enter-floor][data-id="${fid}"]`);await sleep(800);await c.click(`[data-act=wizard][data-id="${fid}"]`);await c.waitFor("!!document.querySelector('#wz-sum')");
  for(const [k,v] of Object.entries(counts))await c.setv(`#wz-c-${k}`,String(v));await sleep(300);await c.ev("document.querySelector('#dlg-ok').click()");await c.waitFor("!document.querySelector('#dlg').open");await sleep(1500);};
 await wiz(P1.id,{Oficina:2,Lobby:0});await wiz(P2.id,{Oficina:3,Lobby:1});
 b=await bld(b.id);ok('piso1_dos_oficinas_sin_lobby',b.floors[0].spaces.map(s=>s.kind).join(','));ok('piso2_tres_oficinas_y_recepcion',b.floors[1].spaces.map(s=>s.kind).sort().join(','));
 // ---------- piso con seis oficinas (no se limita a las 4 salas del activo)
 await api(`/floors/${P4.id}/configure`,'POST',{revision:b.revision,items:Array.from({length:6},(_,i)=>({name:`Oficina ${i+1}`,kind:'Oficina',size:'standard'}))});
 await reload('#edificios');await c.waitFor("window.KwhGlb&&KwhGlb.last",60000);await openFloor(P4.id);await sleep(5000);
 ok('seis_oficinas_etiquetas_3d',await c.ev("[...document.querySelectorAll('.glb-label')].filter(e=>/^Oficina \\d/.test(e.textContent)).length"));await c.shot('b3-seis-oficinas');
 // ---------- inventario y análisis en el Piso 3
 b=await bld(b.id);const sp=n=>b.floors[2].spaces.find(s=>s.name===n);let rev=b.revision;
 const eq=async(sid,e)=>{const r=await api(`/spaces/${sid}/equipment`,'POST',{revision:rev,...e});rev=r.data.building.revision;};
 await eq(sp('Dirección').id,{name:'Aire acondicionado',category:'Aire acondicionado',quantity:2,watts:1200,hours:8,days:22});
 await eq(sp('Oficina 2').id,{name:'Computador',category:'Computador',quantity:10,watts:150,hours:8,days:22});await eq(sp('Oficina 2').id,{name:'Luminaria',category:'Iluminación',quantity:6,watts:18,hours:10,days:22});
 await eq(sp('Oficina 3').id,{name:'Aire acondicionado',category:'Aire acondicionado',quantity:1,hours:8,days:22});
 await reload('#edificios');await c.waitFor("window.KwhGlb&&KwhGlb.last",60000);await openFloor(P3.id);await sleep(5000);
 ok('analisis_texto',await c.ev("[...document.querySelectorAll('#panel ul li')].map(l=>l.textContent).join(' ')"));
 ok('gerencia_lidera_por_calculo',await c.ev("/Dirección es el espacio con mayor consumo conocido[^.]*422,4|Dirección es el espacio con mayor consumo conocido[^.]*422\\.4/.test(document.querySelector('#panel').textContent)"));
 ok('advierte_cobertura_parcial',await c.ev("/Faltan datos en/.test(document.querySelector('#panel').textContent)&&/Oficina 3/.test(document.querySelector('#panel').textContent)"));
 ok('oficina3_sin_potencia_no_rankeada',await c.ev("(()=>{const rows=[...document.querySelectorAll('#panel .bars button')].map(b=>b.textContent);const r=rows.find(x=>x.includes('Oficina 3'));return r?r.replace(/\\s+/g,' '):'no listada'})()"));
 await c.shot('b4-piso3-inventario-analisis');
 // ---------- recorrido
 await c.click(`[data-act=tour-floor][data-id="${P3.id}"]`);await c.waitFor("document.querySelector('#dlg').open");await c.setv('#f-sp','6');await c.ev("document.querySelector('#dlg-ok').click()");await c.waitFor("!!document.querySelector('.tour')");
 const stops=await c.ev("document.querySelector('.tour strong').textContent");ok('recorrido_inicial',stops);
 ok('primera_parada_es_piso_completo',await c.ev("document.querySelector('.tour').textContent.includes('Vista general de Piso 3')&&KwhGlb.last.debug().view.spaceId===null"));
 await sleep(8200);ok('avanza_solo',await c.ev("document.querySelector('.tour strong').textContent"));
 await c.click('[data-act=tour-toggle]');const pos1=await c.ev("document.querySelector('.tour strong').textContent");await sleep(7500);ok('pausa_mantiene_parada',pos1===await c.ev("document.querySelector('.tour strong').textContent"));
 await c.click('[data-act=tour-next]');await sleep(500);const st=await c.ev("(()=>({card:document.querySelector('.tour [aria-live]').textContent.slice(0,150),visor:KwhGlb.last.debug().view.spaceId,focus:KwhGlb.last.debug().viewKey}))()");ok('parada_con_informacion_del_inventario',st);
 await c.shot('b5-recorrido-parada');
 await c.click('[data-act=tour-prev]');await sleep(300);ok('anterior_funciona',await c.ev("document.querySelector('.tour strong').textContent"));
 // abrir un formulario pausa el recorrido
 await c.click('[data-act=tour-toggle]');await c.click('[data-act=edit-space]');await sleep(500);ok('formulario_pausa_recorrido',await c.ev("document.querySelector('.tour [data-act=tour-toggle]').textContent.includes('Reanudar')&&/editas/.test(document.querySelector('.tour').textContent)"));
 await c.ev("document.querySelector('[data-close]').click()");await sleep(300);
 // borrar, desde la interfaz, el espacio de la parada actual: el recorrido se actualiza sin saltos ni errores
 const nParadas=await c.ev("+document.querySelector('.tour strong').textContent.match(/\d+/g).pop()");
 await c.click('[data-act=del-space]');await c.waitFor("document.querySelector('#dlg').open");await c.ev("document.querySelector('#dlg-ok').click()");await sleep(2500);ok('dialogo_borrado',await c.ev("({abierto:document.querySelector('#dlg').open,error:document.querySelector('#dlg-error').textContent,titulo:document.querySelector('#dlg-title').textContent})"));await c.waitFor("!document.querySelector('#dlg').open");await sleep(1500);
 ok('borrar_parada_actualiza_recorrido',await c.ev(`(()=>{const t=document.querySelector('.tour');return t?{ahora:t.querySelector('strong').textContent,antes:${nParadas},nota:/actualizaron/.test(t.textContent)}:'terminó: '+(document.querySelector('#inline-err')||{}).textContent})()`));
 // borrar el espacio de una parada futura
 const lobbyId=(await bld(b.id)).floors[2].spaces.find(s=>s.kind==='Lobby').id;
 await c.click('[data-act=tour-next]');await sleep(400);
 await api(`/spaces/${lobbyId}`,'DELETE',{revision:(await bld(b.id)).revision});await reload('#edificios');await c.waitFor("window.KwhGlb&&KwhGlb.last",60000);
 ok('recorrido_no_se_reactiva_al_recargar',await c.ev("!document.querySelector('.tour')"));
 // salir del recorrido conserva la selección
 await openFloor(P3.id);await c.click(`[data-act=tour-floor][data-id="${P3.id}"]`);await c.waitFor("document.querySelector('#dlg').open");await c.ev("document.querySelector('#dlg-ok').click()");await c.waitFor("!!document.querySelector('.tour')");
 await c.click('[data-act=tour-next]');await sleep(500);const sel=await c.ev("KwhGlb.last.debug().view.spaceId");await c.click('[data-act=tour-exit]');await sleep(500);
 ok('salir_conserva_seleccion',await c.ev(`!document.querySelector('.tour')&&KwhGlb.last.debug().view.spaceId===${sel}`));
 // ---------- movimiento reducido
 await c.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await reload('#edificios');await c.waitFor("window.KwhGlb&&KwhGlb.last",60000);await openFloor(P3.id);await c.click(`[data-act=tour-floor][data-id="${P3.id}"]`);await c.waitFor("document.querySelector('#dlg').open");await c.ev("document.querySelector('#dlg-ok').click()");await c.waitFor("!!document.querySelector('.tour')");
 ok('reducido_no_avanza_solo',await c.ev("document.querySelector('.tour [data-act=tour-toggle]').textContent.includes('Reanudar')"));
 await sleep(12000);ok('reducido_sigue_en_parada_1',await c.ev("document.querySelector('.tour strong').textContent.includes('parada 1')"));
 await c.click('[data-act=tour-next]');await sleep(500);const d=await dbg();ok('reducido_camara_instantanea',Math.hypot(...d.cam.map((v,i)=>v-d.goal.p[i]))<.05);
 await c.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
 R.fin=true;
}catch(e){console.log('ERROR',e.message);R.error=e.message;await c.shot('zz-error3').catch(()=>{});}
await (await import('node:fs/promises')).writeFile(path.join(out,'resultado3.json'),JSON.stringify(R,null,1));
await c.close();setTimeout(()=>process.exit(0),300);
