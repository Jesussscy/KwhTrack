/* Visor 3D ligero (Canvas 2D, proyección propia). Sin WebGL ni librerías externas.
   Escena = lista de cajas {id,x,y,z,w,d,h,color,alpha,windows,hatch,label,labelAt,icon,badge}.
   Al cambiar de escena, las cajas con el mismo id se interpolan (animación funcional corta). */
const Enterprise3D=(()=>{
 const reduced=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 const KEYS=['x','y','z','w','d','h','alpha'];
 const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
 const FACES=[{n:[0,0,1],v:[[0,0,1],[1,0,1],[1,1,1],[0,1,1]],k:'top'},{n:[0,-1,0],v:[[0,0,0],[1,0,0],[1,0,1],[0,0,1]],k:'side'},{n:[1,0,0],v:[[1,0,0],[1,1,0],[1,1,1],[1,0,1]],k:'side'},{n:[0,1,0],v:[[1,1,0],[0,1,0],[0,1,1],[1,1,1]],k:'side'},{n:[-1,0,0],v:[[0,1,0],[0,0,0],[0,0,1],[0,1,1]],k:'side'}];
 const LIGHT=(()=>{const l=[-.35,-.55,.75],m=Math.hypot(...l);return l.map(x=>x/m);})();
 function create(canvas,{onSelect,onHover,onFail}={}){
  let ctx;try{ctx=canvas.getContext('2d');}catch{}
  if(!ctx){onFail&&onFail();return null;}
  let boxes=new Map(),from=new Map(),to=new Map(),startAt=0,dur=0,raf=0,hits=[],selected=null,hovered=null,dpr=1,W=0,H=0;
  const cam={yaw:-.75,pitch:.62,zoom:1},camFrom={...cam},camTo={...cam};
  const hatchPattern=(()=>{const c=document.createElement('canvas');c.width=c.height=8;const g=c.getContext('2d');g.fillStyle='#e6e9ee';g.fillRect(0,0,8,8);g.strokeStyle='#8b95a5';g.lineWidth=1.5;g.beginPath();g.moveTo(0,8);g.lineTo(8,0);g.stroke();return ctx.createPattern(c,'repeat');})();
  function resize(){const r=canvas.getBoundingClientRect();dpr=Math.min(window.devicePixelRatio||1,2);W=Math.max(1,r.width);H=Math.max(1,r.height);canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);schedule();}
  const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;ro&&ro.observe(canvas);
  function setScene(list,{camera,animate=true}={}){
   from=new Map();for(const [id,b] of boxes)from.set(id,{...b});
   to=new Map(list.map(b=>[b.id,{alpha:1,windows:false,hatch:false,...b}]));
   // Cajas nuevas parten transparentes; las que desaparecen se desvanecen.
   const next=new Map();
   for(const [id,t] of to){const f=from.get(id);next.set(id,{...t,...(f?{}:{alpha:0})});if(!f)from.set(id,{...t,alpha:0,z:t.z-(animate&&!reduced()?.8:0)});}
   for(const [id,f] of from)if(!to.has(id)){to.set(id,{...f,alpha:0,gone:true});next.set(id,{...f});}
   boxes=next;
   if(camera)Object.assign(camTo,camera);
   Object.assign(camFrom,cam);
   dur=animate&&!reduced()?460:0;startAt=performance.now();schedule();
  }
  let framing=null;
  function bounds(list){let mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];for(const b of list){if(b.gone||b.alpha===0&&!b.id)continue;mn=[Math.min(mn[0],b.x),Math.min(mn[1],b.y),Math.min(mn[2],b.z)];mx=[Math.max(mx[0],b.x+b.w),Math.max(mx[1],b.y+b.d),Math.max(mx[2],b.z+b.h)];}return {mn,mx};}
  function project(p,yaw,pitch){const c=Math.cos(yaw),s=Math.sin(yaw);const xr=p[0]*c-p[1]*s,yr=p[0]*s+p[1]*c;return {x:xr,y:yr*Math.sin(pitch)-p[2]*Math.cos(pitch),depth:yr*Math.cos(pitch)+p[2]*Math.sin(pitch)};}
  function frame(yaw,pitch){const live=[...to.values()].filter(b=>!b.gone);if(!live.length)return {scale:1,ox:0,oy:0};const {mn,mx}=bounds(live);let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const X of [mn[0],mx[0]])for(const Y of [mn[1],mx[1]])for(const Z of [mn[2],mx[2]]){const p=project([X,Y,Z],yaw,pitch);x0=Math.min(x0,p.x);x1=Math.max(x1,p.x);y0=Math.min(y0,p.y);y1=Math.max(y1,p.y);}
   const pad=.82,scale=Math.min(W*pad/Math.max(x1-x0,.01),H*pad/Math.max(y1-y0,.01));return {scale,ox:-(x0+x1)/2,oy:-(y0+y1)/2};}
  function schedule(){if(!raf)raf=requestAnimationFrame(tick);}
  function tick(now){
   raf=0;const t=dur?Math.min(1,(now-startAt)/dur):1,e=ease(t);
   for(const [id,b] of boxes){const a=from.get(id),z=to.get(id);if(!a||!z)continue;for(const k of KEYS)b[k]=a[k]+(z[k]-a[k])*e;Object.assign(b,{color:z.color,label:z.label,labelAt:z.labelAt,icon:z.icon,badge:z.badge,hatch:z.hatch,windows:z.windows,tone:z.tone,sub:z.sub});}
   for(const k of ['yaw','pitch','zoom'])cam[k]=camFrom[k]+(camTo[k]-camFrom[k])*e;
   if(t>=1){for(const [id,b] of [...boxes])if(to.get(id)?.gone)boxes.delete(id);}
   draw();if(t<1)schedule();
  }
  function shade(c,f){return `rgb(${Math.round(Math.min(255,c[0]*f))},${Math.round(Math.min(255,c[1]*f))},${Math.round(Math.min(255,c[2]*f))})`;}
  function draw(){
   ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);hits=[];
   const fr=frame(cam.yaw,cam.pitch),S=fr.scale*cam.zoom,cx=W/2,cy=H/2;
   const sp=p=>{const q=project(p,cam.yaw,cam.pitch);return {x:cx+(q.x+fr.ox)*S,y:cy+(q.y+fr.oy)*S,depth:q.depth};};
   const list=[...boxes.values()].filter(b=>b.alpha>.01&&b.w>0).map(b=>({b,depth:project([b.x+b.w/2,b.y+b.d/2,b.z+b.h/2],cam.yaw,cam.pitch).depth})).sort((a,b)=>a.depth-b.depth);
   const cyaw=Math.cos(cam.yaw),syaw=Math.sin(cam.yaw);
   for(const {b} of list){
    const col=b.color||[150,160,175],isSel=b.id===selected,isHov=b.id===hovered;
    ctx.globalAlpha=b.alpha;
    for(const f of FACES){
     const nr=[f.n[0]*cyaw-f.n[1]*syaw,f.n[0]*syaw+f.n[1]*cyaw,f.n[2]];
     if(nr[1]*Math.cos(cam.pitch)+nr[2]*Math.sin(cam.pitch)<=0)continue;
     const pts=f.v.map(v=>sp([b.x+v[0]*b.w,b.y+v[1]*b.d,b.z+v[2]*b.h]));
     const l=Math.max(0,f.n[0]*LIGHT[0]+f.n[1]*LIGHT[1]+f.n[2]*LIGHT[2]);
     ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();
     ctx.fillStyle=b.hatch&&f.k==='top'?hatchPattern:shade(col,.62+.4*l+(isHov?.08:0));ctx.fill();
     ctx.lineWidth=isSel?3:1;ctx.strokeStyle=isSel?'#0b3d91':'rgba(20,30,50,.35)';ctx.stroke();
     if(b.windows&&f.k==='side'&&b.h>.3){const cols=Math.max(2,Math.round((f.n[0]?b.d:b.w)*1.3));ctx.fillStyle='rgba(210,232,250,.85)';for(let i=0;i<cols;i++){const u=(i+.22)/cols,u2=(i+.78)/cols;const q=[[u,.3],[u2,.3],[u2,.72],[u,.72]].map(([a,h])=>{const v=f.v;const px=v[0][0]+(v[1][0]-v[0][0])*a+(v[3][0]-v[0][0])*h,py=v[0][1]+(v[1][1]-v[0][1])*a+(v[3][1]-v[0][1])*h,pz=v[0][2]+(v[1][2]-v[0][2])*a+(v[3][2]-v[0][2])*h;return sp([b.x+px*b.w,b.y+py*b.d,b.z+pz*b.h]);});ctx.beginPath();q.forEach((p,k)=>k?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();}}
     if(b.selectable!==false&&b.id!=null)hits.push({id:b.id,pts,order:hits.length});
    }
    ctx.globalAlpha=1;
   }
   // Etiquetas e iconos por encima, sin depender del orden de profundidad.
   ctx.font='600 12px system-ui,Segoe UI,sans-serif';ctx.textBaseline='middle';
   for(const {b} of list){
    if(b.alpha<.5)continue;
    if(b.icon&&window.EnterpriseModels){const p=sp([b.x+b.w/2,b.y+b.d/2,b.z+b.h]);window.EnterpriseModels.draw(ctx,b.icon,p.x,p.y-10,Math.max(14,Math.min(34,S*.5)));}
    if(b.label){const at=b.labelAt==='right'?sp([b.x+b.w,b.y+b.d,b.z+b.h/2]):sp([b.x+b.w/2,b.y+b.d/2,b.z+b.h]);const lines=[b.label,b.sub,b.badge].filter(Boolean);const tw=Math.max(...lines.map(s=>ctx.measureText(s).width))+12,th=lines.length*15+6;const x=b.labelAt==='right'?at.x+10:at.x-tw/2,y=b.labelAt==='right'?at.y-th/2:at.y-th/2-(b.icon?14:0);
     ctx.fillStyle='rgba(255,255,255,.93)';ctx.strokeStyle=b.id===selected?'#0b3d91':'rgba(20,30,50,.3)';ctx.lineWidth=b.id===selected?2:1;ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,tw,th,6):ctx.rect(x,y,tw,th);ctx.fill();ctx.stroke();
     ctx.fillStyle='#14213d';ctx.textAlign='left';lines.forEach((s,i)=>{ctx.font=(i?'500 11px':'700 12px')+' system-ui,Segoe UI,sans-serif';ctx.fillText(s,x+6,y+11+i*15);});}
   }
  }
  const inside=(p,pts)=>{let c=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){if((pts[i].y>p.y)!==(pts[j].y>p.y)&&p.x<(pts[j].x-pts[i].x)*(p.y-pts[i].y)/(pts[j].y-pts[i].y)+pts[i].x)c=!c;}return c;};
  function pick(ev){const r=canvas.getBoundingClientRect(),p={x:ev.clientX-r.left,y:ev.clientY-r.top};for(let i=hits.length-1;i>=0;i--)if(inside(p,hits[i].pts))return hits[i].id;return null;}
  let drag=null;
  canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,yaw:camTo.yaw,pitch:camTo.pitch,moved:false,id:e.pointerId};canvas.setPointerCapture?.(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{
   if(drag&&drag.id===e.pointerId){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>5)drag.moved=true;if(drag.moved){camTo.yaw=cam.yaw=camFrom.yaw=drag.yaw+dx*.008;if(e.pointerType!=='touch')camTo.pitch=cam.pitch=camFrom.pitch=Math.max(.2,Math.min(1.35,drag.pitch+dy*.006));dur=0;draw();}return;}
   const id=pick(e);if(id!==hovered){hovered=id;draw();onHover&&onHover(id,e);}else if(id&&onHover)onHover(id,e);
  });
  canvas.addEventListener('pointerleave',()=>{if(hovered!==null){hovered=null;draw();onHover&&onHover(null);}});
  canvas.addEventListener('pointerup',e=>{const was=drag;drag=null;if(was&&!was.moved){const id=pick(e);if(id!=null)onSelect&&onSelect(id);}});
  canvas.addEventListener('wheel',e=>{if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();api.zoom(e.deltaY<0?1.12:1/1.12);},{passive:false});
  canvas.addEventListener('keydown',e=>{const m={ArrowLeft:()=>api.rotate(-.2),ArrowRight:()=>api.rotate(.2),ArrowUp:()=>api.tilt(.08),ArrowDown:()=>api.tilt(-.08),'+':()=>api.zoom(1.15),'=':()=>api.zoom(1.15),'-':()=>api.zoom(1/1.15),'0':()=>api.reset()}[e.key];if(m){e.preventDefault();m();}});
  const api={
   setScene,select(id){selected=id;draw();},
   rotate(d){camFrom.yaw=cam.yaw;camTo.yaw=cam.yaw+d;go();},
   tilt(d){camFrom.pitch=cam.pitch;camTo.pitch=Math.max(.2,Math.min(1.35,cam.pitch+d));go();},
   zoom(f){camFrom.zoom=cam.zoom;camTo.zoom=Math.max(.5,Math.min(4,cam.zoom*f));go();},
   reset(){Object.assign(camFrom,cam);Object.assign(camTo,{yaw:-.75,pitch:.62,zoom:1});go();},
   destroy(){ro&&ro.disconnect();cancelAnimationFrame(raf);}
  };
  function go(){for(const [id,b] of boxes)from.set(id,{...b});dur=reduced()?0:260;startAt=performance.now();schedule();}
  resize();return api;
 }
 return {create};
})();
window.Enterprise3D=Enterprise3D;
