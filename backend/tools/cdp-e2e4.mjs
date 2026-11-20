// E2E de oficinas compartidas: puestos, cubículos, puertas, indicadores y recorrido por tarjetas. Chrome real (CDP).
// Uso: node tools/cdp-e2e4.mjs <baseUrlConBaseDePruebas> <carpetaCapturas>
import {launch,sleep} from './cdp-lib.mjs';
import {randomUUID} from 'node:crypto';
import path from 'node:path';
const [base,out]=[process.argv[2],path.resolve(process.argv[3])];
const R={};const ok=(k,v)=>{R[k]=v;console.log(k,typeof v==='string'?v.slice(0,200):JSON.stringify(v).slice(0,260));};
let c=await launch({out,port:9370});
const api=(p,method='GET',body)=>c.ev(`(async()=>{const s=await fetch('/api/org/session').then(r=>r.json());const r=await fetch('/api/org'+${JSON.stringify(p)},{method:${JSON.stringify(method)},headers:{'Content-Type':'application/json','X-CSRF-Token':s.csrfToken},body:${body===undefined?'undefined':`JSON.stringify(${JSON.stringify(body)})`}});return {status:r.status,data:await r.json()};})()`);
const bld=async id=>(await api('/buildings/'+id)).data.building;
const dbg=()=>c.ev("KwhGlb.last.debug()");
const reload=async hash=>{await c.nav(base+'/empresarial?r='+Date.now()+hash);await c.waitFor("!!document.querySelector('#sidebar')");await c.waitFor("window.KwhGlb&&KwhGlb.last",60000);};
const noHScroll=()=>c.ev("document.documentElement.scrollWidth<=document.documentElement.clientWidth+1");
try{
 await c.nav(base+'/empresarial');await c.waitFor("!!document.querySelector('#auth-form')");
 await c.click('[data-act=tab-register]');await c.setv('#f-organization','Empresa Puestos');await c.setv('#f-name','Tester');await c.setv('#f-email',randomUUID()+'@kwhtrack.test');await c.setv('#f-password',randomUUID()+'-Pw1');
 await c.ev("document.querySelector('#auth-form .primary').click()");await c.waitFor("!!document.querySelector('#sidebar')");
 let b=(await api('/buildings','POST',{name:'Sede Puestos',floors:[{name:'Piso 1'},{name:'Piso 2'}],spacesPerFloor:0})).data.building;const [P1,P2]=b.floors;
 const conf=await api(`/floors/${P1.id}/configure`,'POST',{revision:b.revision,items:[{name:'Oficina compartida',kind:'Oficina',size:'wide'},{name:'Oficina pequeña',kind:'Oficina',size:'compact'},{name:'Sala',kind:'Sala de reuniones',size:'standard'}]});
 const [big,small]=conf.data.building.floors[0].spaces;
 await reload('#edificios');await c.click(`[data-act=enter-floor][data-id="${P1.id}"]`);await sleep(1500);
 // ---------- editar puestos desde la interfaz
 await c.click(`#space-strip .chip[data-id="${big.id}"]`);await sleep(400);await c.click('[data-act=edit-space]');await c.waitFor("!!document.querySelector('#ws-prev')");
 ok('capacidad_visible_en_el_formulario',await c.ev("document.querySelector('#ws-prev').textContent.replace(/\\s+/g,' ')"));
 await c.setv('#f-ws','500');await sleep(300);ok('cantidad_que_no_cabe_se_explica_y_bloquea_guardar',await c.ev("({texto:document.querySelector('#ws-prev').textContent.replace(/\\s+/g,' ').slice(-170),guardarDeshabilitado:document.querySelector('#dlg-ok').disabled})"));await c.shot('e1-no-caben');
 await c.setv('#f-ws','12');await c.setv('#f-oc','7');await c.setv('#f-ar','60');await sleep(300);
 await c.ev("document.querySelector('#dlg-ok').click()");await c.waitFor("!document.querySelector('#dlg').open");await sleep(1500);
 b=await bld(b.id);let bs=b.floors[0].spaces.find(s=>s.id===big.id);
 ok('guardado_12_abiertos',{puestos:bs.workstations,ocupados:bs.occupied,modo:bs.deskMode||'open',area:bs.areaM2,equipos:bs.equipment.length});
 await c.click(`[data-act=enter-space][data-id="${big.id}"][data-floor="${P1.id}"]`);await sleep(5000);
 const dOpen=(await dbg()).floors[0];ok('escritorios_abiertos_en_3d',{desks:dOpen.desks,errores:dOpen.wsError});await c.shot('e2-12-puestos-abiertos');
 // cubículos: 12 no caben en esta sala -> se explica y no se guarda
 await c.click('[data-act=edit-space]');await c.waitFor("!!document.querySelector('#ws-prev')");await c.setv('#f-dm','cubicle');await sleep(300);
 ok('doce_cubiculos_no_caben',await c.ev("({explicacion:document.querySelector('#ws-prev').textContent.replace(/ +/g,' ').slice(0,260),guardarDeshabilitado:document.querySelector('#dlg-ok').disabled})"));await c.shot('e1b-cubiculos-no-caben');
 await c.setv('#f-ws','4');await c.setv('#f-oc','3');await sleep(300);await c.ev("document.querySelector('#dlg-ok').click()");await c.waitFor("!document.querySelector('#dlg').open");await sleep(5000);
 bs=(await bld(b.id)).floors[0].spaces.find(s=>s.id===big.id);ok('guardado_4_cubiculos',{puestos:bs.workstations,ocupados:bs.occupied,modo:bs.deskMode,area:bs.areaM2});
 const dCub=(await dbg()).floors[0];ok('cubiculos_en_3d',{desks:dCub.desks,errores:dCub.wsError});await c.shot('e2b-4-cubiculos');
 // ---------- sin equipos automáticos + lote con revisión
 ok('sin_equipos_automaticos',(await bld(b.id)).floors[0].spaces.find(s=>s.id===big.id).equipment.length===0);
 await c.click('[data-act=batch-eq]');await c.waitFor("!!document.querySelector('#batch-prev')");
 ok('revision_del_lote',await c.ev("document.querySelector('#batch-prev').textContent.replace(/\\s+/g,' ')"));
 ok('nada_creado_antes_de_confirmar',(await bld(b.id)).floors[0].spaces.find(s=>s.id===big.id).equipment.length===0);
 await c.setv('#f-bw','150');await c.setv('#f-bh','8');await c.setv('#f-bd','22');await sleep(200);await c.shot('e3-lote-revision');
 await c.ev("document.querySelector('#dlg-ok').click()");await c.waitFor("!document.querySelector('#dlg').open");await sleep(1500);
 bs=(await bld(b.id)).floors[0].spaces.find(s=>s.id===big.id);ok('lote_crea_una_linea',{lineas:bs.equipment.length,cantidad:bs.equipment[0]&&bs.equipment[0].quantity,kwh:bs.equipment[0]&&bs.equipment[0].calc.kwh});
 await sleep(2500);await c.shot('e4-puestos-con-computadores');
 // ---------- indicadores
 ok('indicadores_visibles',await c.ev("(()=>{const t=document.querySelector('#panel').textContent.replace(/\\s+/g,' ');return {porPuesto:/kWh por puesto/.test(t),denominador:/4 puestos declarados/.test(t),porM2:/kWh por m²/.test(t)&&/60 m²/.test(t),porOcupado:/kWh por puesto ocupado/.test(t)&&/3 puestos ocupados/.test(t),cautela:/no pruebas de eficiencia/.test(t)}})()"));
 ok('escritorio_sin_scroll_horizontal_con_indicadores',await noHScroll());
 // espacio sin superficie: no hay kWh/m² para él
 await c.click('[data-act=to-floor]');await sleep(600);await c.click(`#space-strip .chip[data-id="${small.id}"]`);await sleep(400);
 ok('sin_superficie_no_calcula_m2',await c.ev("/kWh\\/m² no se calcula|Declara puestos o superficie real/.test(document.querySelector('#panel').textContent)"));
 // ---------- espacio pequeño: no caben puestos
 await c.click('[data-act=edit-space]');await c.waitFor("!!document.querySelector('#ws-prev')");await c.setv('#f-ws','40');await sleep(300);
 ok('oficina_pequena_con_muchos_puestos',await c.ev("({error:/no caben/.test(document.querySelector('#ws-prev').textContent),guardarDeshabilitado:document.querySelector('#dlg-ok').disabled})"));await c.ev("document.querySelector('[data-close]').click()");await sleep(300);
 // ---------- puertas (3D)
 await c.click('[data-act=view-floor-all]');await sleep(800);
 const doorsState=async()=>{const f=(await dbg()).floors[0];return f.doors.map(d=>d.a);};
 const before=await doorsState();await c.click('[data-act=opt-doors]');await sleep(5000);const opened=await doorsState();await c.shot('e5-puertas-abiertas');await c.click('[data-act=opt-doors]');await sleep(5000);const closed=await doorsState();
 ok('puertas_abren_y_cierran',{antes:before.every(x=>x===0),abiertas:opened.every(x=>x>0.95),cerradas:closed.every(x=>x<0.05)});
 ok('puertas_ilustrativas_aviso',await c.ev("document.querySelector('#stage-status').textContent.includes('solo como ilustración')"));
 // las hojas no bloquean la selección ni los controles
 ok('hojas_de_puerta_no_se_seleccionan',await c.ev("(()=>{let n=0;KwhGlb.last&&1;return true})()"));
 // ---------- movimiento reducido: estado final instantáneo
 await c.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await reload('#edificios');await c.click(`[data-act=enter-floor][data-id="${P1.id}"]`);await sleep(1500);
 await c.click('[data-act=opt-doors]');await sleep(700);ok('reducido_puertas_instantaneas',(await doorsState()).every(x=>x>0.99));
 await c.click('[data-act=opt-doors]');await sleep(700);ok('reducido_puertas_cierran_al_instante',(await doorsState()).every(x=>x<0.01));
 // ---------- recorrido por tarjetas (teclado, sin autoavance, foco estable)
 await c.click(`[data-act=ctour-floor][data-id="${P1.id}"]`);await c.waitFor("!!document.querySelector('#ctour .ctour')");
 const activeBefore=await c.ev("document.activeElement.tagName+':'+(document.activeElement.dataset.act||document.activeElement.id)");
 await c.ev("document.querySelector('#ctour [data-act=ctour-next]').focus()");await c.key('Enter','Enter',13);await sleep(400);
 const t1=await c.ev("document.querySelector('#ctour h2').textContent");const focoTrasEnter=await c.ev("document.activeElement.dataset.act");
 await c.key('ArrowRight','ArrowRight',39);await sleep(300);const t2=await c.ev("document.querySelector('#ctour h2').textContent");const focoTrasFlecha=await c.ev("document.activeElement.dataset.act");
 await c.key('ArrowLeft','ArrowLeft',37);await sleep(300);const t3=await c.ev("document.querySelector('#ctour h2').textContent");
 await c.key('ArrowRight','ArrowRight',39);await sleep(300);
 await c.key('ArrowRight','ArrowRight',39);await sleep(300);const tFinal=await c.ev("document.querySelector('#ctour h2').textContent");
 ok('tarjetas_teclado',{inicio:activeBefore,trasEnter:t1,trasFlecha:t2,trasFlechaIzq:t3,foco:[focoTrasEnter,focoTrasFlecha]});
 await sleep(11000);ok('tarjetas_no_avanzan_solas',await c.ev("document.querySelector('#ctour h2').textContent")===tFinal);
 ok('tarjeta_contenido',await c.ev("(()=>{const t=document.querySelector('#ctour .ctour-body').textContent.replace(/\\s+/g,' ');return {ubicacion:/Ubicación: Sede Puestos › Piso 1/.test(t),inventario:/(Sin equipos registrados|\\d+ ×)/.test(t),consumo:/kWh\\/mes/.test(t)||/sin datos/.test(t)}})()"));
 await c.shot('e6-recorrido-tarjetas');
 // mismo contenido que el recorrido 3D
 const collect=async(sel,btn,dis)=>{const out=[];for(let i=0;i<12;i++){out.push(await c.ev(`document.querySelector('${sel}').textContent.replace(/\s+/g,' ').trim().slice(0,60)`));const off=await c.ev(`(()=>{const b=document.querySelector('${btn}');return b.disabled||b.getAttribute('aria-disabled')==='true'})()`);if(off)break;await c.click(btn);await sleep(120);}return out;};
 await c.ev("document.querySelector('#ctour [data-act=ctour-prev]').click()");for(let i=0;i<6;i++)await c.click('[data-act=ctour-prev]');
 const cardsAll=await collect('#ctour .ctour-body','[data-act=ctour-next]');
 const cardText=await c.ev("document.querySelector('#ctour .ctour-body').textContent.replace(/\\s+/g,' ').trim()");
 await c.key('Escape','Escape',27);await sleep(300);ok('esc_sale_y_devuelve_foco',await c.ev("!document.querySelector('#ctour .ctour')&&document.activeElement.dataset.act==='ctour-floor'"));
 await c.click(`[data-act=tour-floor][data-id="${P1.id}"]`);await c.waitFor("document.querySelector('#dlg').open");await c.ev("document.querySelector('#dlg-ok').click()");await c.waitFor("!!document.querySelector('.tour')");await c.click('[data-act=tour-toggle]');
 await c.click('[data-act=tour-next]');await sleep(300);await c.click('[data-act=tour-next]');await sleep(500);const tourText=await c.ev("document.querySelector('.tour [aria-live]').textContent.replace(/\\s+/g,' ').trim()");
  for(let i=0;i<6;i++){await c.click('[data-act=tour-prev]');}
 const tourAll=await collect('.tour [aria-live]','[data-act=tour-next]');
 ok('misma_secuencia_de_paradas_3d_y_tarjetas',JSON.stringify(cardsAll.map(x=>x.replace(/\W+/g,'')))===JSON.stringify(tourAll.map(x=>x.replace(/\W+/g,'')))?'igual ('+cardsAll.length+' paradas)':{tarjetas:cardsAll,tour3d:tourAll});
 ok('mismo_contenido_3d_y_tarjetas',tourText===cardText?'igual':{tarjetas:cardText.slice(0,160),tour3d:tourText.slice(0,160)});await c.click('[data-act=tour-exit]');
 // ---------- persistencia, duplicación y copia
 await reload('#edificios');await c.click(`[data-act=enter-floor][data-id="${P1.id}"]`);await sleep(1500);await c.click(`#space-strip .chip[data-id="${big.id}"]`);await sleep(500);
 ok('restaurado_al_recargar',await c.ev("document.querySelector('#panel').textContent.replace(/\\s+/g,' ').match(/Puestos: [^·]*·[^·]*·[^·]*/)?.[0]"));
 const dup=await api(`/floors/${P1.id}/duplicate`,'POST',{revision:(await bld(b.id)).revision,withInventory:true});const nf=dup.data.building.floors.at(-1).spaces.find(s=>s.name==='Oficina compartida');ok('duplicar_piso_conserva_puestos',[nf.workstations,nf.occupied,nf.deskMode,nf.areaM2,nf.equipment.length]);
 const exp=(await api('/export')).data;const es=exp.buildings[0].floors[0].spaces.find(s=>s.name==='Oficina compartida');ok('copia_incluye_puestos',[exp.version,es.workstations,es.occupied,es.deskMode,es.areaM2]);
 // ---------- 60 puestos: rendimiento
 await api(`/floors/${P2.id}/configure`,'POST',{revision:(await bld(b.id)).revision,items:[{name:'Sala grande',kind:'Oficina',size:'wide'}]});
 const P2s=(await bld(b.id)).floors[1].spaces[0];const w60=await api(`/spaces/${P2s.id}`,'PATCH',{revision:(await bld(b.id)).revision,name:P2s.name,kind:P2s.kind,workstations:60,occupied:45,deskMode:'open'});ok('sesenta_puestos',w60.status);
 await reload('#edificios');await c.click(`[data-act=enter-floor][data-id="${P2.id}"]`);await sleep(7000);const f2=(await dbg()).floors[1];
 for(let i=0;i<20;i++){await c.click('[data-act=cam-right]');await sleep(120);}await sleep(500);
 ok('muchos_puestos_3d',{desks:f2.desks,render:await c.ev("(()=>{const p=KwhGlb.last.perf();return {avgMs:+p.avgMs.toFixed(2),p95Ms:+p.p95Ms.toFixed(2),drawCalls:p.calls}})()")});await c.shot('e7-sesenta-puestos');
 // ---------- móvil
 await c.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
 await c.send('Emulation.setDeviceMetricsOverride',{width:500,height:1000,deviceScaleFactor:1,mobile:true});
 await reload('#edificios');await c.click(`[data-act=enter-floor][data-id="${P1.id}"]`);await sleep(1500);await c.click(`#space-strip .chip[data-id="${big.id}"]`);await sleep(600);
 ok('movil_sin_scroll_horizontal_panel',await noHScroll());await c.click('[data-act=edit-space]');await c.waitFor("!!document.querySelector('#ws-prev')");ok('movil_sin_scroll_horizontal_dialogo',await noHScroll());await c.shot('e8-movil-editar-espacio');await c.ev("document.querySelector('[data-close]').click()");
 await c.click('[data-act=view-floor-all]');await sleep(500);await c.click(`[data-act=ctour-floor][data-id="${P1.id}"]`);await sleep(800);ok('movil_sin_scroll_horizontal_tarjetas',await noHScroll());await c.shot('e9-movil-tarjetas');
 R.fin=true;
}catch(e){console.log('ERROR',e.message);R.error=e.message;await c.shot('zz-error4').catch(()=>{});}
await (await import('node:fs/promises')).writeFile(path.join(out,'resultado4.json'),JSON.stringify(R,null,1));
await c.close();
// ---------- sin WebGL: el recorrido por tarjetas sigue funcionando
try{
 c=await launch({out,port:9371,flags:['--disable-3d-apis']});
 await c.nav(base+'/empresarial?r='+Date.now()+'#demo&sec=edificios&floor=2&level=floor');await c.waitFor("!!document.querySelector('#stage-wrap')",30000);await sleep(2500);
 R.sin_webgl_aviso=await c.ev("document.querySelector('#stage-status').textContent.slice(0,120)");
 await c.click('[data-act=ctour-floor]');await c.waitFor("!!document.querySelector('#ctour .ctour')");await c.click('[data-act=ctour-next]');await sleep(300);
 R.sin_webgl_tarjetas=await c.ev("document.querySelector('#ctour h2').textContent+' | '+document.querySelector('#ctour .ctour-body strong').textContent");console.log('sin_webgl_aviso',R.sin_webgl_aviso);console.log('sin_webgl_tarjetas',R.sin_webgl_tarjetas);await c.shot('e10-sin-webgl-tarjetas');
}catch(e){console.log('ERROR sin webgl',e.message);R.error_sin_webgl=e.message;}
await (await import('node:fs/promises')).writeFile(path.join(out,'resultado4.json'),JSON.stringify(R,null,1));
await c.close();setTimeout(()=>process.exit(0),300);
