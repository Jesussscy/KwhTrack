/* Distribución en planta (metros). Compartido por navegador, visor 3D y servidor.
   El piso mide 17 × 13 m (módulo del modelo). Es esquemático: no representa un levantamiento real. */
const EnterpriseLayout=(()=>{
 const W=17,D=13,MIN=1.5,EPS=1e-6;
 const fin=n=>typeof n==='number'&&Number.isFinite(n);
 /** rects: [{id,name?,x,y,w,d}] → lista de errores legibles (vacía si es válido). */
 function validate(rects){
  const errors=[];
  for(const r of rects){const n=r.name||('espacio '+r.id);
   if(![r.x,r.y,r.w,r.d].every(fin)){errors.push(`${n}: posición y tamaño deben ser números.`);continue;}
   if(r.w<MIN||r.d<MIN)errors.push(`${n}: el tamaño mínimo es ${MIN} × ${MIN} m.`);
   if(r.x<-EPS||r.y<-EPS||r.x+r.w>W+EPS||r.y+r.d>D+EPS)errors.push(`${n}: debe quedar dentro del piso (${W} × ${D} m).`);}
  if(errors.length)return errors;
  for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){const a=rects[i],b=rects[j];
   if(a.x<b.x+b.w-EPS&&b.x<a.x+a.w-EPS&&a.y<b.y+b.d-EPS&&b.y<a.y+a.d-EPS)errors.push(`${a.name||a.id} se solapa con ${b.name||b.id}.`);}
  return errors;
 }
 /** Distribución automática en cuadrícula (la misma que usa el visor cuando no hay distribución guardada). */
 function auto(n){
  const rows=n>8?3:2,cols=Math.max(1,Math.ceil(n/rows)),cw=(W-1)/cols,cd=(D-1)/rows,out=[];
  for(let i=0;i<n;i++){const c=i%cols,r=Math.floor(i/cols);out.push({x:.5+cw*c+.15,y:.5+cd*r+.15,w:cw-.3,d:cd-.3});}
  return out;
 }
 /** Primer hueco libre (paso 0,25 m) para un rectángulo w×d entre rects existentes; null si no cabe. */
 function place(rects,w,d){
  for(let y=0;y<=D-d+EPS;y+=.25)for(let x=0;x<=W-w+EPS;x+=.25){const r={x,y,w,d};
   if(!rects.some(b=>r.x<b.x+b.w-EPS&&b.x<r.x+r.w-EPS&&r.y<b.y+b.d-EPS&&b.y<r.y+r.d-EPS))return {x:Math.round(x*100)/100,y:Math.round(y*100)/100};}
  return null;
 }

 /* ---------- Generador de planta (versión 1, determinista) ----------
    Entrada: items [{ref,kind,size:'compact'|'standard'|'wide',dims?:{w,d}}], opciones {corridor,variant}.
    Salida: {ok,rects:[{ref,x,y,w,d,declared,door}],corridor:{x,y,w,d}|null,version} o {ok:false,error}.
    Organiza datos en una distribución esquemática; NO certifica arquitectura, accesibilidad ni evacuación. */
 const GEN_VERSION=1,WEIGHT={compact:.7,standard:1,wide:1.5},LOBBY=/^(lobby|recepci[oó]n)$/i;
 const r2=n=>Math.round(n*100)/100;
 function generate(items,opts={}){
  const n=items.length,variant=((opts.variant|0)%3+3)%3;
  if(!n)return {ok:true,rects:[],corridor:null,version:GEN_VERSION};
  if(n>16)return {ok:false,error:`Un piso admite hasta 16 espacios generados (pediste ${n}). Reduce la cantidad o crea otro piso.`};
  const isLobby=it=>LOBBY.test(it.kind||'');
  const ordered=[...items.filter(isLobby),...items.filter(it=>!isLobby(it))];
  const useCorridor=opts.corridor!==false&&n>=3,CH=1.6,M=.4,GAP=.3;
  let rows;
  if(!useCorridor)rows=[{y:M,d:D-2*M,items:n===1?ordered:ordered}];
  else{const cy=(D-CH)/2,nb=Math.ceil(n/2);const bottom=ordered.slice(0,nb),top=ordered.slice(nb);
   rows=[{y:M,d:cy-M-GAP/2,items:top,door:'s'},{y:cy+CH+GAP/2,d:D-M-(cy+CH+GAP/2),items:bottom,door:'n'}];
   if(variant===2)rows=[{...rows[0],items:bottom},{...rows[1],items:top}];}
  const rects=[];
  for(const row of rows){
   let list=row.items;if(variant===1)list=[...list].reverse();
   const avail=W-2*M-GAP*(list.length-1);
   const fixed=list.reduce((a,it)=>a+(it.dims?it.dims.w:0),0),wsum=list.reduce((a,it)=>a+(it.dims?0:(WEIGHT[it.size]||1)*(isLobby(it)?1.2:1)),0);
   const free=avail-fixed;
   if(free<-1e-9)return {ok:false,error:'Las medidas indicadas no caben en el ancho del piso. Reduce anchos o cantidad.'};
   let x=M;
   for(const it of list){
    const w=it.dims?it.dims.w:(wsum?free*((WEIGHT[it.size]||1)*(isLobby(it)?1.2:1))/wsum:0);
    const d=it.dims?Math.min(it.dims.d,row.d):row.d;
    if(w<MIN-1e-9||d<MIN-1e-9)return {ok:false,error:`Los espacios no caben con el tamaño pedido (mínimo ${MIN} × ${MIN} m cada uno). Reduce cantidad o usa tamaño compacto.`};
    rects.push({ref:it.ref,x:r2(x),y:r2(it.dims&&row.door==='n'?row.y:row.y),w:r2(w),d:r2(d),declared:Boolean(it.dims),door:row.door||'s'});
    x+=w+GAP;}
  }
  const errs=validate(rects.map(r=>({id:r.ref,name:String(r.ref),...r})));
  if(errs.length)return {ok:false,error:'La propuesta no es válida: '+errs[0]};
  return {ok:true,rects,corridor:useCorridor?{x:M,y:r2((D-CH)/2),w:W-2*M,d:CH}:null,version:GEN_VERSION};
 }

 /* ---------- Puestos de trabajo (abiertos o en cubículos) dentro de un espacio ----------
    Reserva una franja de circulación junto a la puerta y deja holgura con las paredes. Esquemático: no certifica densidad ni normativa. */
 const WS={open:{px:1.6,pz:1.5},cubicle:{px:2.1,pz:2.0},inset:.35,aisle:.9};
 function wsCapacity(rect,mode){const m=WS[mode==='cubicle'?'cubicle':'open'];const uw=rect.w-2*WS.inset,ud=rect.d-2*WS.inset-WS.aisle;const cols=Math.max(0,Math.floor(uw/m.px+1e-9)),rows=Math.max(0,Math.floor(ud/m.pz+1e-9));return {cols,rows,max:cols*rows,px:m.px,pz:m.pz};}
 function workstations(rect,n,mode,doorSide){
  mode=mode==='cubicle'?'cubicle':'open';const cap=wsCapacity(rect,mode),other=wsCapacity(rect,mode==='cubicle'?'open':'cubicle');
  if(!n)return {ok:true,max:cap.max,positions:[],mode,pitch:[cap.px,cap.pz]};
  if(n>cap.max)return {ok:false,max:cap.max,maxOpen:mode==='open'?cap.max:other.max,maxCubicle:mode==='cubicle'?cap.max:other.max,
   error:`${n} puestos ${mode==='cubicle'?'en cubículos':'abiertos'} no caben en este espacio (${r2(rect.w)} × ${r2(rect.d)} m): caben como máximo ${cap.max}${mode==='cubicle'?` (abiertos: ${other.max})`:` (en cubículos: ${other.max})`}. Reduce los puestos, cambia la disposición o amplía el espacio.`};
  const usedRows=Math.ceil(n/cap.cols),usedCols=Math.ceil(n/usedRows),uw=rect.w-2*WS.inset; // bloque compacto, no una sola fila larga
  const x0=rect.x+WS.inset+(uw-usedCols*cap.px)/2+cap.px/2,south=doorSide!=='n';const positions=[];
  for(let i=0;i<n;i++){const c=i%usedCols,r=Math.floor(i/usedCols);const y=south?rect.y+WS.inset+cap.pz/2+r*cap.pz:rect.y+rect.d-WS.inset-cap.pz/2-r*cap.pz;positions.push({x:r2(x0+c*cap.px),y:r2(y)});}
  return {ok:true,max:cap.max,cols:usedCols,rows:usedRows,positions,mode,pitch:[cap.px,cap.pz],faceSouth:south};
 }
 /** Lado de la puerta: 'n' si el espacio queda debajo del corredor (puerta hacia arriba), 's' en los demás casos. */
 function doorSide(rect,corridor){return corridor&&rect.y+rect.d/2>corridor.y+corridor.d/2?'n':'s';}
 const round=n=>Math.round(n*100)/100;
 return {W,D,MIN,validate,auto,place,generate,GEN_VERSION,workstations,wsCapacity,doorSide,round};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=EnterpriseLayout;
if(typeof window!=='undefined')window.EnterpriseLayout=EnterpriseLayout;
