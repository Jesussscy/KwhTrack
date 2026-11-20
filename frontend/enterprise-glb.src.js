// Visor WebGL del edificio empresarial. Fuente: se empaqueta con `npm run build:glb` (backend/) en enterprise-glb.js.
// - Un módulo de piso (KWH-Empresarial.glb, 4 salas) se instancia por cada piso con ≤4 espacios con slot persistente.
// - Pisos con más espacios usan un módulo esquemático procedural con el mismo tamaño.
// - El mobiliario/equipos del GLB se ocultan: lo que se dibuja como equipo sale del inventario real.
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import Layout from './enterprise-layout.js';

const WALL_H=1.4,H=3.4,MW=17,MD=13,YMIN=-1.55,YMAX=1.55,GAP=2.2,UNIT_CAP=12;
const FRAMES={closed:1,open:85,end:200}; // manifest.json del activo
const CAT={
 'Aire acondicionado':{c:'#4aa3df',kind:'wall',s:[.95,.3,.28]},'Iluminación':{c:'#e0b400',kind:'ceil',s:[.55,.06,.22]},
 'Computador':{c:'#6b7a99',kind:'floor',s:[.5,.45,.4]},'Impresora':{c:'#9aa5b8',kind:'floor',s:[.55,.3,.45]},
 'Proyector':{c:'#a35bd6',kind:'ceil',s:[.4,.18,.35]},'Refrigeración':{c:'#37b79b',kind:'floor',s:[.7,1.7,.7]},
 'Servidor':{c:'#e8743b',kind:'floor',s:[.6,1.9,.9]},_:{c:'#a0a8b8',kind:'floor',s:[.5,.5,.5]}
};
const reduced=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const damp=(v,t,dt,k=9)=>v+(t-v)*(1-Math.exp(-dt*k));

function create(container,{url,onSelect,onFail,onReady,onCamera,onInteract}){
 let renderer;
 try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch(e){onFail&&onFail(e);return null;}
 if(!renderer.getContext()){onFail&&onFail();return null;}
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
 const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('role','img');
 canvas.setAttribute('aria-label','Vista 3D del edificio. Las flechas rotan, Ctrl y la rueda acercan. Todo lo que muestra está también en la lista de estructura y en el panel.');
 canvas.style.cssText='width:100%;height:100%;display:block;touch-action:pan-y';
 container.appendChild(canvas);
 const overlay=document.createElement('div');overlay.className='glb-overlay';overlay.style.cssText='position:absolute;inset:0;pointer-events:none;overflow:hidden';container.appendChild(overlay);
 const leaders=document.createElementNS('http://www.w3.org/2000/svg','svg');leaders.classList.add('glb-leaders');leaders.setAttribute('aria-hidden','true');overlay.appendChild(leaders);
 const scene=new THREE.Scene();
 scene.add(new THREE.HemisphereLight(0xfff9e8,0x7f9290,2.2));
 const sun=new THREE.DirectionalLight(0xffffff,2.2);sun.position.set(8,28,16);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-24,right:24,top:24,bottom:-24,far:180});sun.shadow.bias=-.0002;sun.shadow.normalBias=.035;scene.add(sun);
 const base=new THREE.Mesh(new THREE.CylinderGeometry(15.5,15.8,.3,64),new THREE.MeshStandardMaterial({color:'#e5e7df',roughness:.9}));base.position.y=-.3;base.receiveShadow=true;scene.add(base);
 const ring=new THREE.Mesh(new THREE.RingGeometry(17,17.025,96),new THREE.MeshBasicMaterial({color:'#d5d8cc',side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=-.46;scene.add(ring);
 const camera=new THREE.PerspectiveCamera(36,1,.1,400);camera.position.set(20,20,24);
 const controls=new OrbitControls(camera,canvas);
 controls.enablePan=false;controls.maxPolarAngle=Math.PI*.49;controls.minDistance=3;controls.maxDistance=140;controls.enableDamping=false;controls.listenToKeyEvents(canvas);
 canvas.addEventListener('wheel',e=>{if(!(e.ctrlKey||e.metaKey))e.stopImmediatePropagation();},{capture:true,passive:true});

 const frameMs=[],furnSets=[];let userMoved=false,tmpl=null,clips=[],t0=0,t1=1,regions=[],data=null,view={level:'building',floorId:null,spaceId:null,equipId:null,isolate:false,explode:false,layer:false,particles:false,quality:'balanced',preset:'iso'},sig='';
 let floors=[],floorById=new Map(),disposed=false,raf=0,last=0,follow=true,camGoal=null,viewKey='',labels=new Map(),pendingView=null;
 const need=()=>{if(!raf&&!disposed)raf=requestAnimationFrame(tick);};
 controls.addEventListener('change',need);
 let moving=false;controls.addEventListener('start',()=>{follow=false;userMoved=true;moving=true;onInteract?.();});controls.addEventListener('end',()=>{moving=false;});
 controls.addEventListener('change',()=>{if(moving&&onCamera){const o=camera.position.clone().sub(controls.target);onCamera(o.clone().normalize().toArray());}});
 const motion=matchMedia('(prefers-reduced-motion: reduce)');const onMotion=()=>{if(reduced()){for(const F of floors){F.y=F.yT;F.open=F.openT;if(F.solarMesh){F.solarAnimating=false;F.solarFrom=F.solarPanels;F.solarMesh.count=Math.min(30,F.solarPanels);animateSolar(F,performance.now());}}if(camGoal){camera.position.copy(camGoal.pos);controls.target.copy(camGoal.target);}follow=false;}need();};motion.addEventListener('change',onMotion);
 let inViewport=true;const io=new IntersectionObserver(entries=>{inViewport=entries[0].isIntersecting;if(inViewport)need();});io.observe(container);const onVisibility=()=>{last=0;if(!document.hidden)need();};document.addEventListener('visibilitychange',onVisibility);
 const ro=new ResizeObserver(()=>{const w=container.clientWidth||300,h=container.clientHeight||300;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();if(floors.length&&!userMoved){camGoal=cameraGoal();cameraLimits(camGoal);if(reduced()){camera.position.copy(camGoal.pos);controls.target.copy(camGoal.target);}else follow=true;}need();});ro.observe(container);

 /* ---------- Construcción ---------- */
 const mat=(c,o={})=>{const m=new THREE.MeshStandardMaterial({color:c,roughness:.7,metalness:.05,...o});m.userData.floorOwned=true;return m;};
 const clipTime=amt=>{const a=t0+(FRAMES.closed-1)/(FRAMES.end-1)*(t1-t0),b=t0+(FRAMES.open-1)/(FRAMES.end-1)*(t1-t0);return a+(b-a)*amt;};
 function find(root,pred){let r;root.traverse(o=>{if(!r&&pred(o))r=o;});return r;}
 function glbModule(F){
  const mod=tmpl.clone(true);mod.traverse(o=>{if(o.geometry)o.userData.shared=true;if(/Roof.*solar/i.test(o.name))o.visible=false;if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}if(o.userData&&o.userData.entity_type==='equipment_group')o.visible=false;});
  F.roof=find(mod,o=>o.name==='roof_removable');F.facade=find(mod,o=>o.name==='facade_removable');
  F.slab=find(mod,o=>o.name==='floor_01_slab');if(F.slab&&F.slab.material){F.slab.material=F.slab.material.clone();}
  F.roomNodes=[];mod.traverse(o=>{if(o.userData.entity_type==='space')F.roomNodes.push(o);});
  F.mixer=new THREE.AnimationMixer(mod);F.actions=clips.map(c=>{const a=F.mixer.clipAction(c);a.play();a.paused=true;return a;});
  for(const sp of F.spaces){
   if(sp.slot==null)continue;const key=`space_0${sp.slot+1}`;
   const node=find(mod,o=>o.userData&&o.userData.entity_type==='space'&&o.userData.entity_key===key);
   const surf=find(mod,o=>o.name===key+'_surface');
   if(node){node.userData.spaceId=sp.id;node.children.forEach(ch=>{if(/^(Furniture|Reception|Lounge)[\s_]*\|/.test(ch.name))ch.visible=false;});}
   if(surf){surf.material=surf.material.clone();surf.material.userData.floorOwned=true;sp.orig=surf.material.color.clone();sp.surface=surf;}
   sp.region=regions[sp.slot];sp.node=node;
  }
  // Salas del módulo sin espacio asignado: se atenúan y no son seleccionables.
  const used=new Set(F.spaces.map(s=>s.slot));
  for(let k=0;k<4;k++)if(!used.has(k)){const surf=find(mod,o=>o.name===`space_0${k+1}_surface`);if(surf){surf.material=surf.material.clone();surf.material.color.set('#d9dde3');}}
  return mod;
 }
 function procModule(F){
  const mod=new THREE.Group(),n=F.spaces.length;
  const custom=F.spaces.every(sp=>sp.data&&sp.data.plan),rects=custom?F.spaces.map(sp=>sp.data.plan):Layout.auto(n);
  const slab=new THREE.Mesh(box(MW,.3,MD),mat('#dedfd4'));slab.position.y=YMIN+.15;mod.add(slab);F.slab=slab;
  const trim=new THREE.Mesh(box(MW+.2,.055,MD+.2),mat('#d0b76d'));trim.position.y=YMIN+.3;mod.add(trim);
  const wallMat=mat('#f4f1e6');
  {const cr=F.data&&F.data.config&&F.data.config.corridorRect;if(cr){const m=new THREE.Mesh(box(cr.w,.06,cr.d),mat('#efe6bd'));m.position.set(-MW/2+cr.x+cr.w/2,YMIN+.33,-MD/2+cr.y+cr.d/2);m.userData.circulation=true;mod.add(m);F.corridor={x:-MW/2+cr.x+cr.w/2,z:-MD/2+cr.y+cr.d/2};}}
  F.spaces.forEach((sp,i)=>{
   const r=rects[i],cx=-MW/2+r.x+r.w/2,cz=-MD/2+r.y+r.d/2,g=new THREE.Group();g.userData.spaceId=sp.id;
   const plate=new THREE.Mesh(box(r.w-.1,.25,r.d-.1),mat('#e4e1d5'));plate.position.set(cx,YMIN+.3+.125,cz);g.add(plate);
   const edges=new THREE.LineSegments(edgeBox(r.w-.1,2.4,r.d-.1),new THREE.LineBasicMaterial({color:'#20251e',transparent:true,opacity:.35}));edges.position.set(cx,YMIN+.3+1.2,cz);
   // Particiones bajas (corte arquitectónico) con una puerta de 1,1 m en el lado frontal.
   const x0=cx-(r.w-.1)/2,x1=cx+(r.w-.1)/2,z0=cz-(r.d-.1)/2,z1=cz+(r.d-.1)/2,wy=YMIN+.3+WALL_H/2,door=Math.min(1.1,(x1-x0)*.5);
   const seg=(ax,az,bx,bz)=>{const len=Math.hypot(bx-ax,bz-az);if(len<.05)return;const m=new THREE.Mesh(box(Math.abs(bx-ax)||.1,WALL_H,Math.abs(bz-az)||.1),wallMat);m.position.set((ax+bx)/2,wy,(az+bz)/2);g.add(m);};
   const cr=F.data&&F.data.config&&F.data.config.corridorRect,corrZ=cr?-MD/2+cr.y+cr.d/2:null,doorOnNorth=corrZ!=null&&cz>corrZ; // la puerta mira al corredor
   seg(x0,z0,x0,z1);seg(x1,z0,x1,z1);
   if(doorOnNorth){seg(x0,z1,x1,z1);seg(x0,z0,cx-door/2,z0);seg(cx+door/2,z0,x1,z0);}else{seg(x0,z0,x1,z0);seg(x0,z1,cx-door/2,z1);seg(cx+door/2,z1,x1,z1);}
   sp.rect=r;
   {// Puerta visual con pivote en la bisagra; se abre hacia fuera y su ángulo máximo respeta el espacio libre (no atraviesa muebles ni paredes). No es una simulación física.
    const leafW=door-.06,clear=Math.max(.15,corrZ!=null?(doorOnNorth?z0-corrZ:corrZ-z1):(doorOnNorth?z0+MD/2:MD/2-z1)),zWall=doorOnNorth?z0:z1;
    const piv=new THREE.Group();piv.position.set(cx-door/2+.03,wy,zWall);const leaf=new THREE.Mesh(doorGeo(leafW),doorMat());leaf.position.set(leafW/2,0,0);leaf.userData.noPick=true;piv.add(leaf);g.add(piv);
    (F.doors||(F.doors=[])).push({sp,piv,angle:0,target:0,max:Math.min(1.75,Math.asin(Math.min(1,clear/leafW))),sign:doorOnNorth?1:-1});}
   mod.add(g);sp.node=g;sp.surface=plate;sp.orig=plate.material.color.clone();
   sp.region={minx:cx-(r.w-.1)/2,maxx:cx+(r.w-.1)/2,minz:cz-(r.d-.1)/2,maxz:cz+(r.d-.1)/2,top:YMIN+.425};
  });
  F.facade=new THREE.Group();
  const put=(w,h,d,x,y,z,c)=>{const m=new THREE.Mesh(box(w,h,d),mat(c));m.position.set(x,y,z);F.facade.add(m);return m;};
  for(const z of [-MD/2,MD/2]){
   put(MW,.45,.13,0,YMIN+.58,z,'#e8e9df');put(MW,.14,.18,0,YMAX-.12,z,'#3b5657');
   for(let x=-MW/2+.85;x<MW/2;x+=1.7){put(1.58,2,.065,x,.1,z,'#537879');put(.055,2.65,.14,x-.82,0,z,'#aebbb6');}
  }
  for(const x of [-MW/2,MW/2]){put(.14,YMAX-YMIN,MD,x,0,0,'#e9e9df');}
  mod.add(F.facade);
  F.roof=new THREE.Group();const plate=new THREE.Mesh(box(MW+.3,.22,MD+.3),mat('#43575a'));F.roof.add(plate);F.roof.position.y=YMAX+.1;
  mod.add(F.roof);
  F.procOpen=true;return mod;
 }
 function addSolar(F){
  const cfg=data.solar;if(!F.roof||F.index!==data.floors.length-1)return;
  if(!F.solarMesh){F.roof.updateWorldMatrix(true,true);F.solarBounds=new THREE.Box3().setFromObject(F.roof).applyMatrix4(F.roof.matrixWorld.clone().invert());
   const texCanvas=document.createElement('canvas');texCanvas.width=128;texCanvas.height=192;const ctx=texCanvas.getContext('2d');ctx.fillStyle='#194969';ctx.fillRect(0,0,128,192);ctx.strokeStyle='#6095ad';ctx.lineWidth=1;for(let x=0;x<=128;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,192);ctx.stroke();}for(let y=0;y<=192;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(128,y);ctx.stroke();}ctx.strokeStyle='#ced6d7';ctx.lineWidth=5;ctx.strokeRect(1,1,126,190);const map=new THREE.CanvasTexture(texCanvas);map.userData.solarOwned=true;map.colorSpace=THREE.SRGBColorSpace;
   F.solarMesh=new THREE.InstancedMesh(box(1,.07,1),mat('#ffffff',{map,metalness:.25,roughness:.48}),10000);F.solarMesh.count=0;F.solarMesh.userData.noPick=true;F.solarMesh.castShadow=true;F.solarMesh.frustumCulled=false;F.roof.add(F.solarMesh);F.solarFrom=0;F.solarPanels=0;
  }
  const next=cfg?.panels||0,previous=F.solarPanels;F.solarSymbols=Math.min(30,next);F.solarConfig=cfg;
  F.solarFrom=previous;F.solarPanels=next;F.solarStart=performance.now();F.solarAnimating=next!==previous&&!reduced()&&Math.max(next,previous)<=200;
  F.solarMesh.count=Math.min(30,F.solarAnimating?Math.max(previous,next):next);animateSolar(F,F.solarStart);need();
 }
 function animateSolar(F,now){
  if(!F.solarMesh)return false;const count=F.solarMesh.count,bounds=F.solarBounds,size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3()),n=Math.max(1,F.solarPanels,F.solarFrom),cols=6,rows=5,w=Math.max(.01,(size.x-.8)/cols*.86),d=Math.max(.01,(size.z-.8)/rows*.82),obj=new THREE.Object3D();let more=false;
  for(let i=0;i<count;i++){const changed=F.solarAnimating&&i>=Math.min(F.solarFrom,F.solarPanels),t=changed?THREE.MathUtils.clamp((now-F.solarStart-Math.min(160,(i-Math.min(F.solarFrom,F.solarPanels))*24))/320,0,1):1,amount=changed?(F.solarPanels>F.solarFrom?t:1-t):1;more ||= changed&&t<1;
   obj.position.set(center.x-size.x/2+.4+(i%cols+.5)*(size.x-.8)/cols,bounds.max.y+.15+(1-amount)*.6,center.z-size.z/2+.4+(Math.floor(i/cols)+.5)*(size.z-.8)/rows);obj.rotation.set(-Math.min(.4,(F.solarConfig?.tilt||0)*Math.PI/180),0,0);obj.scale.set(w*amount,Math.max(.001,amount),d*amount);obj.updateMatrix();F.solarMesh.setMatrixAt(i,obj.matrix);
  }F.solarMesh.instanceMatrix.needsUpdate=true;if(!more){F.solarAnimating=false;F.solarMesh.count=Math.min(30,F.solarPanels);F.solarFrom=F.solarPanels;}return more;
 }
 function addCorridorLights(F){
  const z=F.data.circulation,r=F.data.config?.corridorRect;if(!z||!r)return;
  let offset=0;const total=z.equipment.filter(e=>e.category==='Iluminación').reduce((a,e)=>a+e.quantity,0),cols=Math.max(1,Math.ceil(Math.sqrt(total*r.w/r.d))),rows=Math.max(1,Math.ceil(total/cols));
  for(const e of z.equipment){if(e.category!=='Iluminación')continue;const geo=new THREE.CylinderGeometry(.16,.12,.10,10),mt=mat(e.active===false?'#999e91':'#fff3ab',{emissive:e.active===false?'#000000':'#d7ad38',emissiveIntensity:.45}),mesh=new THREE.InstancedMesh(geo,mt,e.quantity),obj=new THREE.Object3D();
   for(let i=0;i<e.quantity;i++){const k=offset+i;obj.position.set(-MW/2+r.x+(k%cols+.5)*r.w/cols,YMIN+2.7,-MD/2+r.y+(Math.floor(k/cols)+.5)*r.d/rows);obj.updateMatrix();mesh.setMatrixAt(i,obj.matrix);}offset+=e.quantity;mesh.userData.noPick=true;mesh.userData.corridorLight=true;mesh.userData.equipmentActive=e.active!==false;F.proxy.add(mesh);
  }F.corridorLights=total;
  const person=new THREE.Group(),body=new THREE.Mesh(new THREE.CylinderGeometry(.17,.20,.65,12),mat('#477aa1')),head=new THREE.Mesh(new THREE.SphereGeometry(.16,12,8),mat('#e3ba91'));body.position.y=YMIN+.95;head.position.y=YMIN+1.46;person.add(body,head);person.userData.noPick=true;person.traverse(o=>o.userData.noPick=true);person.visible=false;F.proxy.add(person);F.corridorPerson=person;

 }
 function dispose(){const disposedMats=new Set();for(const F of floors){scene.remove(F.group);F.mixer?.stopAllAction();F.group.traverse(o=>{if(o.isInstancedMesh)o.dispose?.();if(o.geometry&&!o.userData.shared&&!o.geometry.userData.shared)o.geometry.dispose();for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){if(!disposedMats.has(m)&&!m.userData.cacheShared&&(o.userData.highlightMaterial||m.userData.floorOwned)){if(m.map?.userData.solarOwned)m.map.dispose();m.dispose();disposedMats.add(m);}}});}floors=[];floorById.clear();for(const l of labels.values()){l.el.remove();l.line?.remove();}labels.clear();}
 function rebuild(){
  dispose();
  energyKey='';
  renderer.shadowMap.needsUpdate=true;
  const list=[...data.floors].sort((a,b)=>a.order-b.order);
  list.forEach((fd,i)=>{
   const F={id:fd.id,index:i,data:fd,spaces:fd.spaces.map(s=>({id:s.id,slot:s.slot,data:s})),group:new THREE.Group(),y:0,yT:0,open:0,openT:0,hidden:false,hideT:false,built:false};
   F.group.userData.floorId=fd.id;
   const custom=F.spaces.length>0&&F.spaces.every(s=>s.data&&s.data.plan);const glb=tmpl&&!custom&&F.spaces.length<=4&&F.spaces.every(s=>s.slot!=null&&s.slot<4)&&!F.spaces.some(s=>s.data&&s.data.workstations>0);F.kind=glb?'glb':'proc';F.custom=custom;
   F.mod=glb?glbModule(F):procModule(F);addSolar(F);F.mod.userData.floorId=fd.id;F.group.add(F.mod);
   // El GLB exportado conserva el suelo Blender en y≈0; el módulo procedural usa un origen centrado.
   if(glb)F.mod.position.y=YMIN;
   // Fachada completa de presentación; el activo Blender es una maqueta de corte.
   F.envelope=new THREE.Group();const shellBatches=new Map(),addShell=(w,h,d,x,y,z,color)=>{const list=shellBatches.get(color)||[];list.push({w,h,d,x,y,z});shellBatches.set(color,list);};
   for(const z of [-MD/2-.08,MD/2+.08]){
    addShell(MW+.2,.32,.12,0,YMIN+.45,z,'#d9dfd7');addShell(MW+.2,.18,.16,0,YMAX-.05,z,'#e6e9df');
    for(let x=-MW/2+.85;x<MW/2;x+=1.7){addShell(1.57,2.35,.055,x,0,z,'#41676b');addShell(.055,2.7,.12,x-.82,0,z,'#adbcb5');}
   }
   for(const x of [-MW/2-.08,MW/2+.08]){
    addShell(.12,.32,MD+.2,x,YMIN+.45,0,'#d9dfd7');addShell(.16,.18,MD+.2,x,YMAX-.05,0,'#e6e9df');
    for(let z=-MD/2+.81;z<MD/2;z+=1.625){addShell(.055,2.35,1.5,x,0,z,'#597b7c');addShell(.12,2.7,.055,x,0,z-.77,'#b9c6bf');}
   }
   for(const [color,list]of shellBatches){const mesh=new THREE.InstancedMesh(box(1,1,1),cm(color),list.length),object=new THREE.Object3D();for(const [index,item]of list.entries()){object.position.set(item.x,item.y,item.z);object.scale.set(item.w,item.h,item.d);object.updateMatrix();mesh.setMatrixAt(index,object.matrix);}mesh.castShadow=true;mesh.receiveShadow=true;F.envelope.add(mesh);}
   F.group.add(F.envelope);
   F.mod.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});if(F.roof)F.roof.visible=i===list.length-1;
   scene.add(F.group);floors.push(F);floorById.set(fd.id,F);
  });
  placeFloors(true);
 }
 function ensureInterior(F){
  if(F.built)return;F.built=true;F.proxy=new THREE.Group();F.mod.add(F.proxy);F.lines=new Map();addCorridorLights(F);
  if(!(F.data&&F.data.config&&F.data.config.decor===false))furnish(F);
  for(const sp of F.spaces){
   const eq=(data.equipment[sp.id]||[]);const byKind={wall:[],ceil:[],floor:[]};
   for(const e of eq){const c=CAT[e.category]||CAT._,n=Math.min(e.quantity,UNIT_CAP);for(let u=0;u<n;u++)byKind[c.kind].push({e,c});}
   const R=sp.region;if(!R)continue;const w=R.maxx-R.minx,d=R.maxz-R.minz;
   // Usa superficies decorativas como apoyo visual, sin declarar puestos ni ocupación.
   if(!sp.desks){sp.desks=[];sp.dt=0;F.mod.updateWorldMatrix(true,true);const inv=F.mod.matrixWorld.clone().invert();F.mod.traverse(o=>{if(o.isMesh&&o.visible&&/(Furniture.*oak.worktop|Reception.*oak.counter)/i.test(o.name)&&resolve(o).space===sp.id){const b=new THREE.Box3().setFromObject(o).applyMatrix4(inv),c=b.getCenter(new THREE.Vector3());sp.desks.push({x:c.x,z:c.z,top:b.max.y});}});}
   const overflow=new Set();
   for(const kind of ['wall','ceil','floor']){
    const units=byKind[kind],n=units.length;if(!n)continue;
    const cols=Math.max(1,Math.min(n,Math.floor((w-.8)/(kind==='floor'?.9:1.1))||1));
    units.forEach(({e,c},i)=>{
     const col=i%cols,row=Math.floor(i/cols),x0=R.minx+.6+(cols===1?(w-1.2)/2:(w-1.2)*col/(cols-1));
     const dk=(kind==='floor'&&e.category==='Computador'&&sp.desks&&(sp.dt||0)<sp.desks.length)?sp.desks[sp.dt++]:null,x=dk?dk.x:x0;
     const unassigned=e.category==='Computador'&&!dk;if(unassigned&&overflow.has(e.id))return;if(unassigned)overflow.add(e.id);
     let y,z;
     if(dk){y=dk.top+c.s[1]/2;z=dk.z;}
     else if(kind==='wall'){y=R.top+2.0-row*.45;z=R.minz+.3;}
     else if(kind==='ceil'){y=R.top+2.65;z=R.minz+.9+((d-1.8)*(row+.5)/Math.max(1,Math.ceil(n/cols)));}
     else{y=R.top+c.s[1]/2;z=R.maxz-.7-row*.8;}
     if(unassigned){y=R.top+.98;const shelf=new THREE.Mesh(unitGeo([.9,.08,.65]),unitMat('#c7b696'));shelf.position.set(x,R.top+.7,z);shelf.userData.equipId=e.id;shelf.userData.spaceId=sp.id;F.proxy.add(shelf);const support=new THREE.Mesh(unitGeo([.14,.68,.35]),unitMat('#536363'));support.position.set(x,R.top+.34,z);support.userData.equipId=e.id;support.userData.spaceId=sp.id;F.proxy.add(support);}
     const m=new THREE.Mesh(unitGeo(c.s),unitMat(c.c));m.position.set(x,y,z);m.userData.equipId=e.id;m.userData.spaceId=sp.id;m.userData.color=c.c;m.userData.category=e.category;F.proxy.add(m);
     if(e.category==='Computador'){m.geometry=unitGeo([.56,.36,.055]);m.material=unitMat('#35464c');m.position.y=dk?dk.top+.33:R.top+1.07;
      const display=new THREE.Mesh(unitGeo([.49,.28,.008]),unitMat('#6d9da7'));display.position.z=.034;m.add(display);
      const stem=new THREE.Mesh(unitGeo([.06,.16,.06]),unitMat('#35464c'));stem.position.y=-.22;m.add(stem);
      const foot=new THREE.Mesh(unitGeo([.28,.035,.16]),unitMat('#35464c'));foot.position.y=-.30;m.add(foot);
     }
     if(!F.lines.has(e.id))F.lines.set(e.id,{mesh:m,e,spaceId:sp.id,mats:[]});
     if(unassigned)F.lines.get(e.id).unassigned=true;
    });
   }
  }
  applyPlacements(F);
 }
 function applyPlacements(F){
  for(const object of F.proxy?.children||[]){if(object.userData.equipId!=null){if(!object.userData.autoPosition)object.userData.autoPosition=object.position.clone();object.position.copy(object.userData.autoPosition);}}
  for(const sp of F.spaces)for(const e of data.equipment[sp.id]||[]){if(!e.placement||!sp.region)continue;const objects=F.proxy.children.filter(o=>o.userData.equipId===e.id);if(!objects.length)continue;const r=sp.region,cx=(Math.min(...objects.map(o=>o.position.x))+Math.max(...objects.map(o=>o.position.x)))/2,cz=(Math.min(...objects.map(o=>o.position.z))+Math.max(...objects.map(o=>o.position.z)))/2,dx=r.minx+.5+e.placement.u*Math.max(0,r.maxx-r.minx-1)-cx,dz=r.minz+.5+e.placement.v*Math.max(0,r.maxz-r.minz-1)-cz;for(const o of objects){o.position.x=THREE.MathUtils.clamp(o.position.x+dx,r.minx+.3,r.maxx-.3);o.position.z=THREE.MathUtils.clamp(o.position.z+dz,r.minz+.3,r.maxz-.3);}}
 }

const KIND_SLOT={'Oficina':0,'Gerencia':0,'Cubículo':0,'Sala de reuniones':1,'Lobby':2,'Recepción':2,'Cafetería':3,'Cocina':3,'Descanso':3,'Habitación':3,'Otro':3}; // Zona técnica, Archivo, Pasillo y Bodega: sin mobiliario ilustrativo
 /** Reutiliza el mobiliario del activo Blender (por tipo de espacio), escalado para caber en el espacio guardado. */
 function furnish(F){
  for(const sp of F.spaces){
   if(sp.data&&sp.data.workstations>0){buildDesks(F,sp);continue;}
   const slot=KIND_SLOT[sp.data&&sp.data.kind],set=slot==null?null:furnSets[slot],R=sp.region,src=slot==null?null:regions[slot];
   if(!set||!R||!src)continue;
   const s=Math.min(1,(R.maxx-R.minx-.7)/(src.maxx-src.minx),(R.maxz-R.minz-.7)/(src.maxz-src.minz));if(s<.45)continue; // demasiado pequeño: sin mobiliario
   const outer=new THREE.Group(),inner=new THREE.Group();outer.position.set((R.minx+R.maxx)/2,R.top,(R.minz+R.maxz)/2);outer.scale.setScalar(s);
   inner.position.set(-(src.minx+src.maxx)/2,0,-(src.minz+src.maxz)/2);outer.add(inner);
   for(const {obj,rel} of set){const c=obj.clone(true);c.matrixAutoUpdate=true;rel.decompose(c.position,c.quaternion,c.scale);inner.add(c);}
   outer.traverse(o=>{o.userData.spaceId=sp.id;});F.proxy.add(outer);
  }
 }
 const geoCache=new Map(),matCache=new Map();
 const doorGeo=w=>{const k='door'+w;if(!geoCache.has(k)){const g=new THREE.BoxGeometry(w,WALL_H-.06,.05);g.userData.shared=true;geoCache.set(k,g);}return geoCache.get(k);};
 const doorMat=()=>{if(!matCache.has('doormat'))matCache.set('doormat',mat('#b98a5a'));return matCache.get('doormat');};
 const box=(w,h,d)=>{const k='b'+[w,h,d].join();if(!geoCache.has(k)){const g=new THREE.BoxGeometry(w,h,d);g.userData.shared=true;geoCache.set(k,g);}return geoCache.get(k);};
 const edgeBox=(w,h,d)=>{const key='edges'+[w,h,d].join();if(!geoCache.has(key)){const g=new THREE.EdgesGeometry(box(w,h,d));g.userData.shared=true;geoCache.set(key,g);}return geoCache.get(key);};
 const cm=c=>{if(!matCache.has(c)){const m=mat(c);m.userData.cacheShared=true;matCache.set(c,m);}return matCache.get(c);};
 /** Escritorios (y cubículos) de un espacio con puestos. Los ocupados llevan una silueta ilustrativa; no se asume ningún equipo. */
 function buildDesks(F,sp){
  const r=sp.rect;if(!r)return;const mode=sp.data.deskMode==='cubicle'?'cubicle':'open',cr=F.data&&F.data.config&&F.data.config.corridorRect;
  const res=Layout.workstations(r,sp.data.workstations,mode,Layout.doorSide(r,cr));if(!res.ok){sp.wsError=res.error;return;}
  const top=sp.region.top,occ=sp.data.occupied,grp=new THREE.Group(),dir=res.faceSouth?1:-1;sp.desks=[];sp.dt=0;
  res.positions.forEach((pt,i)=>{
   const wx=-MW/2+pt.x,wz=-MD/2+pt.y,isOcc=occ!=null&&i<occ,add=(geo,mt,x,y,z)=>{const m=new THREE.Mesh(geo,mt);m.position.set(wx+x,top+y,wz+z);grp.add(m);return m;};
   add(box(1.2,.05,.6),cm('#b98a5a'),0,.72,-dir*.2);add(box(.05,.7,.55),cm('#4a4f5a'),-.55,.35,-dir*.2);add(box(.05,.7,.55),cm('#4a4f5a'),.55,.35,-dir*.2);
   add(box(.45,.06,.45),cm(isOcc?'#2f7f7f':'#d8c9a8'),0,.45,dir*.35);add(box(.45,.5,.06),cm(isOcc?'#2f7f7f':'#d8c9a8'),0,.72,dir*.35+dir*.2);add(box(.06,.4,.06),cm('#4a4f5a'),0,.22,dir*.35);
   if(isOcc){const g=new THREE.CapsuleGeometry(.13,.3,4,8);g.userData.shared=true;if(!geoCache.has('cap'))geoCache.set('cap',g);add(geoCache.get('cap'),cm('#6b7a99'),0,.95,dir*.3);}
   if(mode==='cubicle'){const px=res.pitch[0],pz=res.pitch[1];add(box(px-.12,1.25,.05),cm('#e6e0cf'),0,.625,-dir*(pz/2-.1));add(box(.05,1.25,pz-.15),cm('#e6e0cf'),-px/2+.06,.625,0);
    if(i%res.cols===res.cols-1||i===res.positions.length-1)add(box(.05,1.25,pz-.15),cm('#e6e0cf'),px/2-.06,.625,0);}
   sp.desks.push({x:wx,z:wz-dir*.2,top:top+.745,occupied:isOcc});
  });
  grp.traverse(o=>{o.userData.spaceId=sp.id;});F.proxy.add(grp);
 }
 const unitGeo=s=>{const k=s.join();if(!geoCache.has(k)){const g=new THREE.BoxGeometry(...s);g.userData.shared=true;geoCache.set(k,g);}return geoCache.get(k);};
 const unitMat=c=>cm(c);

 /* ---------- Vista, estado y animación ---------- */
 function offsetY(i){return i*(H+(view.explode?GAP:0));}
 function placeFloors(snap){
  const active=view.floorId!=null?floorById.get(view.floorId):null,inside=!view.roofMode&&view.level!=='building'&&active;
  for(const F of floors){
   let yT=offsetY(F.index),hide=false;
   if(inside){if(F.index>active.index){yT+=9;hide=true;}else if(view.isolate&&F!==active){yT-=5;hide=true;}}
   else if(!view.roofMode&&view.isolate&&active&&F!==active){yT+=F.index>active.index?9:-5;hide=true;}
   F.yT=yT;F.hideT=hide;F.openT=inside&&F===active?1:0;
   if(snap||reduced()){F.y=yT;F.open=F.openT;F.group.visible=!hide;F.hidden=hide;applyOpen(F);}
   else if(!hide){F.group.visible=true;F.hidden=false;}
   F.group.position.y=F.y+(YMAX);
   if(inside&&F===active)ensureInterior(F);
  }
  need();
 }
 function applyOpen(F){
  F.compact=data.floors.length>12&&view.level==='building'&&!view.roofMode&&F.open<.1&&F.index!==floors.length-1;F.mod.visible=!F.compact;
  if(F.envelope)F.envelope.visible=F.open<.18;
  for(const node of F.roomNodes||F.spaces.map(sp=>sp.node).filter(Boolean))node.visible=F.open>.1;
  if(F.proxy)F.proxy.visible=F.open>.1;
  if(F.kind==='glb'){const t=clipTime(F.open);F.actions.forEach(a=>{a.time=t;});F.mixer.update(0);const closed=F.open<.18;if(F.roof)F.roof.visible=closed&&F.index===floors.length-1;if(F.facade)F.facade.visible=closed;}
  else{F.facade.position.y=F.open*5;F.roof.position.y=YMAX+.1+F.open*6;const closed=F.open<.18;F.facade.visible=closed;F.roof.visible=closed&&F.index===floors.length-1;}
 }
 function cameraGoal(){
  const n=floors.length||1,span=n*(H+(view.explode?GAP:0)),active=view.floorId!=null?floorById.get(view.floorId):null;
  const dir=(x,y,z)=>view.preset==='top'?new THREE.Vector3(.001,1,.001):view.preset==='front'?new THREE.Vector3(.001,view.level==='building'&&!view.roofMode ? .28 : .6,1).normalize():new THREE.Vector3(x,y,z).normalize();
  const tanV=Math.tan(THREE.MathUtils.degToRad(camera.fov/2)),fit=R=>R*1.05/(tanV*Math.min(1,camera.aspect));
  if(view.roofMode){const top=floors.at(-1),tgt=new THREE.Vector3(0,(top?.y||0)+YMAX*2+.3,0);return {target:tgt,pos:tgt.clone().add(dir(.35,1,.55).multiplyScalar(fit(Math.hypot(MW/2,MD/2)*.87)))};}
  if(view.level==='building'||!active){const R=Math.hypot(MW/2,MD/2,span/2),tgt=new THREE.Vector3(0,span/2,0);return {target:tgt,pos:tgt.clone().add(dir(.75,.62,.95).multiplyScalar(fit(R)))};}
  const base=offsetY(active.index)+YMAX;
  if(view.level==='space'&&view.equipId!=null&&active.lines?.has(view.equipId)){
   const line=active.lines.get(view.equipId),target=line.mesh.getWorldPosition(new THREE.Vector3());target.y+=base-active.group.position.y+.4;
   return {target,pos:target.clone().add(dir(.65,1,.9).multiplyScalar(Math.max(6,fit(2.6))))};
  }
  if((view.level==='space'||view.focus)&&view.spaceId!=null){const sp=active.spaces.find(s=>s.id===view.spaceId);if(sp&&sp.region){const R=sp.region,tgt=new THREE.Vector3((R.minx+R.maxx)/2,base+active.mod.position.y+R.top+.6,(R.minz+R.maxz)/2);return {target:tgt,pos:tgt.clone().add(dir(.3,1,.75).multiplyScalar(fit(Math.max(R.maxx-R.minx,R.maxz-R.minz)*.5+.9)))};}}
  const tgt=new THREE.Vector3(0,base-.9,0);return {target:tgt,pos:tgt.clone().add(dir(.65,.95,.9).multiplyScalar(fit(Math.hypot(MW/2,MD/2)*.85)))};
 }
 function cameraLimits(goal){const distance=goal.pos.distanceTo(goal.target);controls.minDistance=view.roofMode?10:view.level==='space'?6:view.level==='floor'?10:Math.max(16,distance*.42);controls.maxPolarAngle=view.level==='building'&&!view.roofMode?Math.PI*.49:Math.PI*.37;controls.maxDistance=Math.max(140,distance*1.8);camera.far=Math.max(400,controls.maxDistance*2);camera.updateProjectionMatrix();}
 function setView(v){
  const prevKey=viewKey;view={...view,...v};
  if(!floors.length){pendingView=v;return;}
  const key=[view.level,view.floorId,view.spaceId,view.equipId,view.isolate,view.explode,view.focus?1:0,view.roofMode?1:0,view.preset].join('|');
  paintAppearance();placeFloors(false);applyHighlights();updateDoors();updateEnergy();renderer.shadowMap.needsUpdate=true;renderer.shadowMap.enabled=view.quality!=='basic';renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,view.quality==='high'?2:view.quality==='basic'?1:1.6));
  if(key!==prevKey||v.recenter){viewKey=key;follow=true;userMoved=false;camGoal=cameraGoal();cameraLimits(camGoal);if(reduced()){camera.position.copy(camGoal.pos);controls.target.copy(camGoal.target);controls.update();}}
  syncLabels();need();
 }
 function updateDoors(){for(const F of floors)for(const d of F.doors||[]){d.target=(view.doors||(view.focus&&view.spaceId===d.sp.id))?1:0;if(reduced()){d.angle=d.target;d.piv.rotation.y=d.sign*d.max*d.angle;}}need();}
 function applyHighlights(){
  for(const F of floors){
   if(F.corridorPerson){const r=F.data.config?.corridorRect;F.corridorPerson.visible=view.floorId===F.id&&view.corridorPresence===true;if(r)F.corridorPerson.userData.target=new THREE.Vector3(-MW/2+r.x+r.w*(.15+.7*(view.corridorProgress||0)),0,-MD/2+r.y+r.d/2);if(reduced()&&F.corridorPerson.userData.target)F.corridorPerson.position.copy(F.corridorPerson.userData.target);}
   if(F.proxy)F.proxy.traverse(o=>{if(!o.userData.corridorLight)return;const on=o.userData.equipmentActive&&(typeof view.corridorLampOn==='boolean'?view.corridorLampOn:true);o.material.color.set(on?'#fff3ab':'#86918e');o.material.emissive.set(on?'#d7ad38':'#000000');o.material.emissiveIntensity=on?.7:0;});
   if(F.slab&&F.slab.material&&'emissive' in F.slab.material){const on=view.level==='building'&&view.floorId===F.id;F.slab.material.emissive.set(on?'#ffd535':'#000000');F.slab.material.emissiveIntensity=on?.7:0;}
   for(const sp of F.spaces){if(!sp.surface)continue;const m=sp.surface.material,on=view.spaceId===sp.id&&view.level!=='building';
    if('emissive' in m){m.emissive.set(on?'#ffd535':'#000000');m.emissiveIntensity=on?.6:0;}}
   if(F.proxy)F.proxy.traverse(m=>{if(!m.isMesh||m.userData.equipId==null||!m.material)return;const on=(view.equipId!=null&&m.userData.equipId===view.equipId)||(view.equipCat&&m.userData.category===view.equipCat);if(!m.userData.highlightMaterial){m.material=m.material.clone();m.material.userData.cacheShared=false;m.userData.highlightMaterial=true;}m.material.emissive.set(on?'#bd8a18':'#000000');m.material.emissiveIntensity=on?.55:0;m.material.transparent=!!view.equipCat&&m.userData.category!==view.equipCat;m.material.opacity=m.material.transparent?.25:1;});
  }
 }
 let missingTexture=null;
 function missingPattern(){if(missingTexture)return missingTexture;const tile=document.createElement('canvas');tile.width=tile.height=32;const ctx=tile.getContext('2d');ctx.fillStyle='#eef0ec';ctx.fillRect(0,0,32,32);ctx.strokeStyle='#9ba89f';ctx.lineWidth=3;for(let d=-32;d<64;d+=12){ctx.beginPath();ctx.moveTo(d,0);ctx.lineTo(d+32,32);ctx.stroke();}missingTexture=new THREE.CanvasTexture(tile);missingTexture.colorSpace=THREE.SRGBColorSpace;missingTexture.wrapS=missingTexture.wrapT=THREE.RepeatWrapping;missingTexture.repeat.set(4,4);return missingTexture;}
 function paintAppearance(){
  for(const F of floors){const fd=data.floors.find(f=>f.id===F.id);F.data=fd;
   for(const sp of F.spaces){const sd=fd.spaces.find(s=>s.id===sp.id);sp.data=sd;if(!sp.surface||!sd)continue;
    const material=sp.surface.material;if(!sp.originalMapSaved){sp.originalMap=material.map||null;sp.originalMapSaved=true;}const pattern=view.layer&&sd.hatch===true,nextMap=pattern?missingPattern():sp.originalMap;if(material.map!==nextMap){material.map=nextMap;material.needsUpdate=true;}const c=view.layer?(pattern?'#ffffff':sd.color||'#c9ced6'):null;if(c)material.color.set(c);else material.color.copy(sp.orig);}}
 }
 function setData(d){
  const nsig=JSON.stringify(d.floors.map(f=>[f.id,f.order,f.config||null,f.circulation||null,f.spaces.map(s=>[s.id,s.slot,s.plan||null,s.workstations||0,s.occupied??null,s.deskMode||null])]))+JSON.stringify(Object.entries(d.equipment).map(([k,v])=>[k,v.map(e=>[e.id,e.quantity,e.category])]));
  const solarChanged=JSON.stringify(data?.solar||null)!==JSON.stringify(d.solar||null),positionKey=value=>JSON.stringify(Object.entries(value?.equipment||{}).map(([id,items])=>[id,items.map(e=>[e.id,e.placement||null])])),positionsChanged=positionKey(data)!==positionKey(d);data=d;
  if(!tmpl&&!viewer.failed){viewer.queued=true;return;}
  if(nsig!==sig){sig=nsig;rebuild();if(pendingView){view={...view,...pendingView};pendingView=null;}viewKey='';}else{if(solarChanged)for(const F of floors)addSolar(F);if(positionsChanged)for(const F of floors)if(F.built)applyPlacements(F);}
  paintAppearance();setView({});
 }

 /* ---------- Etiquetas DOM ---------- */
 function label(key,text,cls,pos){let l=labels.get(key);if(!l){const el=document.createElement('button');el.type='button';el.className='glb-label';el.addEventListener('click',()=>onSelect&&onSelect(key));overlay.appendChild(el);const line=document.createElementNS('http://www.w3.org/2000/svg','line');leaders.appendChild(line);l={el,line};labels.set(key,l);}l.seen=true;l.el.textContent=text;l.el.className='glb-label '+(cls||'');l.pos=pos;}
 function syncLabels(){
  for(const l of labels.values())l.seen=false;
  const active=view.floorId!=null?floorById.get(view.floorId):null;
  if(view.level==='building'||!active){for(const F of floors){if(F.hideT)continue;label('f'+F.id,F.data.label||F.data.name,view.floorId===F.id?'sel':'',()=>new THREE.Vector3(MW/2+.3,F.y+YMAX+.15,MD/2));}}
  else{
   if(active.corridor&&view.level==='floor')label('corr'+active.id,active.data.circulation?(active.data.circulation.name+' · '+(active.data.circulation.equipment.reduce((a,e)=>a+e.quantity,0))+' unidades · '+(active.data.circulation.totals?.knownItems?active.data.circulation.totals.kwh.toFixed(1)+' kWh/mes':'sin datos')):'Circulación · registrar iluminación','eq',()=>new THREE.Vector3(active.corridor.x,active.y+YMAX-1.1,active.corridor.z));
   for(const sp of active.spaces){if(!sp.region)continue;const R=sp.region;if(view.level==='space')continue;label('s'+sp.id,sp.data.text||sp.data.name,view.spaceId===sp.id?'sel':'',()=>new THREE.Vector3((R.minx+R.maxx)/2,active.y+YMAX+active.mod.position.y+R.top+.25,(R.minz+R.maxz)/2));}
   if(view.level==='space'&&active.lines)for(const l of active.lines.values()){if(l.spaceId!==view.spaceId||(view.equipCat&&l.e.category!==view.equipCat))continue;label('e'+l.e.id,`${l.e.name} ×${l.e.quantity}${l.unassigned?" · ubicación agrupada":""}`+(l.e.quantity>UNIT_CAP?` (se dibujan ${UNIT_CAP})`:''),view.equipId===l.e.id?'sel':'eq',()=>l.mesh.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,.5,0)));}
  }
  const top=floors.at(-1);if(data.solar?.panels>0&&top&&!top.hideT&&view.level==='building')label('pv',`${data.solar.panels} paneles${data.solar.panels>30?' propuestos · vista agrupada':''} · ${(data.solar.panels*data.solar.wp/1000).toFixed(1)} kWp`,'eq',()=>new THREE.Vector3(0,top.y+YMAX+.5,0));
  for(const [k,l] of labels)if(!l.seen){l.el.remove();l.line.remove();labels.delete(k);}
 }
 function placeLabels(){
  const w=canvas.clientWidth,h=canvas.clientHeight,p=new THREE.Vector3(),occupied=[];
  const ordered=[...labels.values()].sort((a,b)=>Number(b.el.classList.contains('sel'))-Number(a.el.classList.contains('sel')));
  for(const l of ordered){p.copy(l.pos()).project(camera);l.line.style.display='none';l.el.style.display='block';const lw=Math.min(l.el.offsetWidth||100,w-20),lh=l.el.offsetHeight||28;
   if(p.z>1||p.z< -1||Math.abs(p.x)>1.12||Math.abs(p.y)>1.12){l.el.style.display='none';continue;}
   const x=THREE.MathUtils.clamp((p.x*.5+.5)*w,lw/2+8,w-lw/2-8);let y=THREE.MathUtils.clamp((-p.y*.5+.5)*h,lh+8,h-10);
   let attempts=0;while(occupied.some(r=>Math.abs(r.x-x)<(r.w+lw)/2+5&&Math.abs(r.y-y)<lh+5)&&attempts++<5)y-=lh+7;
   if(y<lh+5){l.el.style.display='none';continue;}occupied.push({x,y,w:lw});l.el.style.transform=`translate(-50%,-100%) translate(${x}px,${y}px)`;
   const ax=(p.x*.5+.5)*w,ay=(-p.y*.5+.5)*h;if(Math.hypot(ax-x,ay-y)>10){l.line.setAttribute('x1',ax);l.line.setAttribute('y1',ay);l.line.setAttribute('x2',x);l.line.setAttribute('y2',y);l.line.style.display='';}
  }
 }

 /* Partículas ilustrativas de kWh/mes: un único buffer, presupuesto acotado y escala fija del edificio. */
 const capacity=560,positions=new Float32Array(capacity*3),colors=new Float32Array(capacity*3),energyGeo=new THREE.BufferGeometry();
 energyGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));energyGeo.setAttribute('color',new THREE.BufferAttribute(colors,3));energyGeo.setDrawRange(0,0);
 const sprite=document.createElement('canvas');sprite.width=sprite.height=32;const ctx=sprite.getContext('2d'),gradient=ctx.createRadialGradient(16,16,0,16,16,16);gradient.addColorStop(0,'#ffffffff');gradient.addColorStop(.25,'#ffffffe0');gradient.addColorStop(1,'#ffffff00');ctx.fillStyle=gradient;ctx.fillRect(0,0,32,32);
 const spriteMap=new THREE.CanvasTexture(sprite),energyMat=new THREE.PointsMaterial({size:.38,map:spriteMap,vertexColors:true,transparent:true,opacity:.85,depthWrite:false,sizeAttenuation:true,toneMapped:false});
 const energy=new THREE.Points(energyGeo,energyMat);energy.frustumCulled=false;energy.raycast=()=>{};scene.add(energy);let emitters=[],energyKey='',particleCount=0;
 function updateEnergy(){
  if(!data)return;const key=JSON.stringify([view.level,view.floorId,view.spaceId,view.quality,view.isolate,view.explode,data.floors.map(f=>[f.id,f.kwh,f.spaces.map(s=>s.kwh)])]);if(key===energyKey)return;energyKey=key;emitters=[];
  const max=Math.max(1,...data.floors.map(f=>f.kwh||0),...data.floors.flatMap(f=>f.spaces.map(s=>s.kwh||0)));
  for(const F of floors){if(F.hideT)continue;if(view.level==='building'){if(F.data.kwh>0)emitters.push({F,region:null,value:F.data.kwh});}else if(F.id===view.floorId){for(const sp of F.spaces)if(sp.region&&sp.data.kwh>0&&(view.level!=='space'||sp.id===view.spaceId))emitters.push({F,region:sp.region,value:sp.data.kwh});}}
  particleCount=0;for(const e of emitters){e.start=particleCount;e.count=Math.min(60,Math.max(8,Math.round(60*Math.sqrt(e.value/max))));e.count=Math.min(e.count,capacity-particleCount);particleCount+=e.count;}energyGeo.setDrawRange(0,particleCount);
 }
 function animateEnergy(now){
  energy.visible=!!view.particles&&!reduced()&&view.quality!=='basic'&&inViewport&&!document.hidden;
  if(!energy.visible||!particleCount)return false;const t=now*.0003;
  for(const e of emitters){if(!e.F.group.visible)continue;for(let j=0;j<e.count;j++){const i=e.start+j,r=e.region,seed=(j*.61803398875)%1,u=(j*.381966)%1,phase=(t+seed)%1;
    positions[i*3]=r?r.minx+.35+u*Math.max(.1,r.maxx-r.minx-.7):MW/2+.28;
    positions[i*3+1]=e.F.y+YMAX+(r?e.F.mod.position.y:0)+(r?r.top+.3+phase*1.6:YMIN+.45+phase*2.15);
    positions[i*3+2]=r?r.minz+.3+seed*Math.max(.1,r.maxz-r.minz-.6):-MD/2+.6+u*(MD-1.2);
    colors[i*3]=1;colors[i*3+1]=.65+phase*.15;colors[i*3+2]=.12;}}
  energyGeo.attributes.position.needsUpdate=true;energyGeo.attributes.color.needsUpdate=true;return true;
 }

 /* ---------- Bucle ---------- */
 function tick(now){
  raf=0;if(document.hidden||!inViewport){last=0;return;}const dt=Math.min(.25,(now-(last||now))/1000);last=now;let more=false,geometryMoved=false;
  for(const F of floors){
   if(F.corridorPerson?.visible&&F.corridorPerson.userData.target){const person=F.corridorPerson,target=person.userData.target;if(person.position.distanceTo(target)>.01){person.position.lerp(target,reduced()?1:1-Math.exp(-dt*5));more=true;geometryMoved=true;}}
   if(Math.abs(F.y-F.yT)>.01){F.y=damp(F.y,F.yT,dt,7);more=true;geometryMoved=true;}else F.y=F.yT;
   if(Math.abs(F.open-F.openT)>.002){F.open=damp(F.open,F.openT,dt,3.2);more=true;geometryMoved=true;}else F.open=F.openT;
   F.group.position.y=F.y+YMAX;applyOpen(F);
   for(const d of F.doors||[]){if(Math.abs(d.angle-d.target)>.002){d.angle=damp(d.angle,d.target,dt,5);more=true;geometryMoved=true;}else d.angle=d.target;d.piv.rotation.y=d.sign*d.max*d.angle;}
   if(F.hideT&&Math.abs(F.y-F.yT)<.15){F.group.visible=false;F.hidden=true;}
  }
  for(const F of floors)if(F.solarAnimating&&animateSolar(F,now)){more=true;geometryMoved=true;}
  if(follow&&camGoal){const k=1-Math.exp(-dt*6);camera.position.lerp(camGoal.pos,k);controls.target.lerp(camGoal.target,k);if(camera.position.distanceTo(camGoal.pos)>.02||controls.target.distanceTo(camGoal.target)>.02)more=true;else follow=false;}
  if(controls.update())more=true;
  if(geometryMoved)renderer.shadowMap.needsUpdate=true;
  if(animateEnergy(now))more=true;const tr=performance.now();renderer.render(scene,camera);syncLabelsPositionsOnly();frameMs.push(performance.now()-tr);if(frameMs.length>90)frameMs.shift();
  if(more)need();
 }
 function syncLabelsPositionsOnly(){placeLabels();}

 /* ---------- Selección ---------- */
 const ray=new THREE.Raycaster(),ptr=new THREE.Vector2();
 function resolve(o){const r={};for(;o;o=o.parent){const u=o.userData||{};if(u.equipId!=null&&r.equip==null)r.equip=u.equipId;if(u.spaceId!=null&&r.space==null)r.space=u.spaceId;if(u.floorId!=null&&r.floor==null)r.floor=u.floorId;}return r;}
 canvas.addEventListener('pointerdown',e=>{canvas._d={x:e.clientX,y:e.clientY};});
 canvas.addEventListener('pointerup',e=>{
  const d=canvas._d;canvas._d=null;if(!d||Math.abs(e.clientX-d.x)+Math.abs(e.clientY-d.y)>5)return;
  const r=canvas.getBoundingClientRect();ptr.set(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(ptr,camera);
  const roots=floors.filter(f=>f.group.visible).map(f=>f.group);
  const hits=ray.intersectObjects(roots,true).filter(h=>{let o=h.object;while(o){if(!o.visible||o.userData.noPick)return false;o=o.parent;}return true;});
  for(const h of hits){const x=resolve(h.object);
   if(view.level==='building'&&x.floor!=null){onSelect&&onSelect('f'+x.floor);return;}
   if(view.level!=='building'&&x.floor===view.floorId){if(view.level==='space'&&x.equip!=null){onSelect&&onSelect('e'+x.equip);return;}if(x.space!=null){onSelect&&onSelect('s'+x.space);return;}}}
 });

 /* ---------- Carga ---------- */
 const viewer={failed:false,queued:false};
 new GLTFLoader().load(url,gltf=>{
  if(disposed)return;
  const root=gltf.scene;root.updateMatrixWorld(true);tmpl=find(root,o=>o.name==='floor_01');
  if(!tmpl){viewer.failed=true;onFail&&onFail(new Error('El modelo no contiene floor_01'));return;}
  const inv=tmpl.matrixWorld.clone().invert();
  for(let k=0;k<4;k++){const s=find(tmpl,o=>o.name===`space_0${k+1}_surface`);const b=new THREE.Box3().setFromObject(s).applyMatrix4(inv);regions[k]={minx:b.min.x,maxx:b.max.x,minz:b.min.z,maxz:b.max.z,top:b.max.y};}
  for(let k=0;k<4;k++){const node=find(tmpl,o=>o.userData&&o.userData.entity_type==='space'&&o.userData.entity_key===`space_0${k+1}`);furnSets[k]=[];node.children.forEach(ch=>{if(/^(Furniture|Reception|Lounge)[\s_]*\|/.test(ch.name)){ch.updateWorldMatrix(true,false);furnSets[k].push({obj:ch,rel:inv.clone().multiply(ch.matrixWorld)});}});}
  clips=gltf.animations;t0=Infinity;t1=-Infinity;for(const c of clips)for(const tr of c.tracks){t0=Math.min(t0,tr.times[0]);t1=Math.max(t1,tr.times[tr.times.length-1]);}
  if(!Number.isFinite(t0)||t1<=t0){clips=[];t0=0;t1=1;}
  tmpl.parent&&tmpl.parent.remove(tmpl);
  if(data){const d=data;sig='';setData(d);}onReady&&onReady();
 },undefined,err=>{viewer.failed=true;onFail&&onFail(err);});

 Object.assign(viewer,{
  setData,setView,
  rotate(d){follow=false;userMoved=true;const off=camera.position.clone().sub(controls.target);off.applyAxisAngle(new THREE.Vector3(0,1,0),-d);camera.position.copy(controls.target).add(off);controls.update();need();},
  zoom(f){follow=false;userMoved=true;const off=camera.position.clone().sub(controls.target).multiplyScalar(1/f);off.clampLength(controls.minDistance,controls.maxDistance);camera.position.copy(controls.target).add(off);controls.update();need();},
  reset(){setView({recenter:true});},
  preset(name){setView({preset:['iso','top','front'].includes(name)?name:'iso',recenter:true});},
  /** Sincroniza solo la dirección de la cámara (cada edificio conserva su distancia). */
  setCameraDir(d){if(!floors.length)return;follow=false;const o=camera.position.clone().sub(controls.target),len=o.length();camera.position.copy(controls.target).add(new THREE.Vector3(...d).multiplyScalar(len));controls.update();need();},
  perf(){const a=[...frameMs].sort((x,y)=>x-y);return {frames:a.length,avgMs:a.reduce((x,y)=>x+y,0)/(a.length||1),p95Ms:a[Math.floor(a.length*.95)]||0,calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,floors:floors.length,interiors:floors.filter(f=>f.built).length};},
  debug(){return {particles:{enabled:energy.visible,count:particleCount,reduced:reduced()},cam:camera.position.toArray().map(x=>+x.toFixed(2)),tgt:controls.target.toArray().map(x=>+x.toFixed(2)),goal:camGoal?{p:camGoal.pos.toArray().map(x=>+x.toFixed(2)),t:camGoal.target.toArray().map(x=>+x.toFixed(2))}:null,follow,viewKey,view:{level:view.level,floorId:view.floorId,spaceId:view.spaceId,roofMode:!!view.roofMode,equipCat:view.equipCat||null},floors:floors.map(f=>({id:f.id,index:f.index,kind:f.kind,compact:!!f.compact,solarPanels:f.solarPanels||0,solarDrawn:f.solarMesh?.count||0,solarAnimating:!!f.solarAnimating,missingPattern:f.spaces.filter(sp=>missingTexture&&sp.surface?.material.map===missingTexture).map(sp=>sp.id),corridorLights:f.corridorLights||0,corridorPerson:!!f.corridorPerson?.visible,corridorLampOn:view.corridorLampOn??null,equipmentPositions:f.lines?[...f.lines.values()].map(l=>({id:l.e.id,x:l.mesh.position.x,z:l.mesh.position.z})):[],y:+f.y.toFixed(2),yT:+f.yT.toFixed(2),open:+f.open.toFixed(2),openT:f.openT,visible:f.group.visible,hideT:f.hideT,roof:f.roof?f.roof.visible:null,facade:f.facade?f.facade.visible:null,built:!!f.built,doors:f.doors?f.doors.map(d=>({id:d.sp.id,a:+d.angle.toFixed(2),t:d.target,max:+d.max.toFixed(2)})):null,desks:f.spaces.filter(x=>x.desks).map(x=>[x.id,x.desks.length,x.desks.filter(z=>z.occupied).length]),wsError:f.spaces.filter(x=>x.wsError).map(x=>x.id)}))};},
  stats(){return {floors:floors.length,kinds:floors.map(f=>f.kind),labels:labels.size,interiors:floors.filter(f=>f.built).length};},
  destroy(){disposed=true;missingTexture?.dispose();cancelAnimationFrame(raf);ro.disconnect();io.disconnect();motion.removeEventListener('change',onMotion);document.removeEventListener('visibilitychange',onVisibility);controls.dispose();energyGeo.dispose();energyMat.dispose();spriteMap.dispose();base.geometry.dispose();base.material.dispose();ring.geometry.dispose();ring.material.dispose();tmpl?.traverse(o=>{o.geometry?.dispose();if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose());}});dispose();geoCache.forEach(g=>g.dispose());matCache.forEach(m=>m.dispose());renderer.dispose();canvas.remove();overlay.remove();}
 });
 return viewer;
}
window.KwhGlb={create:(c,o)=>{const v=create(c,o);window.KwhGlb.last=v;return v;}};
