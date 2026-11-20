/* Registro de representaciones por categoría de equipo.
   Hoy: iconos pseudo-3D dibujados en Canvas (esquemáticos, no fotorrealistas).
   Para sustituirlos por tus propios modelos:
     EnterpriseModels.register('Computador', {image:'/modelos/computador.png'})   // sprite prerenderizado
     EnterpriseModels.register('Computador', {draw:(ctx,x,y,s)=>{...}})           // dibujo propio
   Nota: el visor no usa WebGL, así que archivos .glb/.gltf requieren primero un visor WebGL (p. ej. three.js)
   o convertirlos a sprites. Las categorías sin registro usan el icono genérico. */
const EnterpriseModels=(()=>{
 const reg=new Map(),images=new Map();
 const C={body:'#dfe6ee',dark:'#31405a',accent:'#f2b705',edge:'#14213d'};
 const box=(g,x,y,w,h,d,fill)=>{g.fillStyle=fill;g.strokeStyle=C.edge;g.lineWidth=1;g.fillRect(x,y,w,h);g.strokeRect(x,y,w,h);g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.moveTo(x+w,y);g.lineTo(x+w+d,y-d);g.lineTo(x+w+d,y+h-d);g.lineTo(x+w,y+h);g.closePath();g.fill();g.stroke();g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.moveTo(x,y);g.lineTo(x+d,y-d);g.lineTo(x+w+d,y-d);g.lineTo(x+w,y);g.closePath();g.fill();g.stroke();};
 const icons={
  'Aire acondicionado':(g,s)=>{box(g,-s*.5,-s*.2,s,s*.4,s*.12,C.body);g.fillStyle=C.dark;g.fillRect(-s*.4,s*.05,s*.8,s*.06);},
  'Iluminación':(g,s)=>{g.fillStyle=C.accent;g.strokeStyle=C.edge;g.beginPath();g.arc(0,-s*.1,s*.25,0,7);g.fill();g.stroke();g.fillStyle=C.dark;g.fillRect(-s*.1,s*.12,s*.2,s*.14);},
  'Computador':(g,s)=>{box(g,-s*.4,-s*.35,s*.8,s*.55,s*.08,C.dark);g.fillStyle='#8fd3ff';g.fillRect(-s*.34,-s*.29,s*.68,s*.43);box(g,-s*.2,s*.2,s*.4,s*.08,s*.05,C.body);},
  'Impresora':(g,s)=>{box(g,-s*.45,-s*.1,s*.9,s*.35,s*.12,C.body);g.fillStyle='#fff';g.fillRect(-s*.25,-s*.28,s*.5,s*.18);g.strokeRect(-s*.25,-s*.28,s*.5,s*.18);},
  'Proyector':(g,s)=>{box(g,-s*.4,-s*.12,s*.8,s*.3,s*.1,C.body);g.fillStyle=C.dark;g.beginPath();g.arc(-s*.15,s*.03,s*.1,0,7);g.fill();},
  'Refrigeración':(g,s)=>{box(g,-s*.25,-s*.45,s*.5,s*.9,s*.1,C.body);g.fillStyle=C.dark;g.fillRect(-s*.2,-s*.05,s*.4,s*.03);},
  _:(g,s)=>{box(g,-s*.35,-s*.25,s*.7,s*.5,s*.1,C.body);g.fillStyle=C.accent;g.fillRect(-s*.1,-s*.1,s*.2,s*.2);}
 };
 const alias={'Aire acondicionado':'Aire acondicionado','Aire':'Aire acondicionado','Luz':'Iluminación','Iluminación':'Iluminación','Luminaria':'Iluminación','Computador':'Computador','Computadora':'Computador','Impresora':'Impresora','Proyector':'Proyector','Refrigerador':'Refrigeración','Nevera':'Refrigeración','Refrigeración':'Refrigeración'};
 function draw(ctx,category,x,y,size){
  const r=reg.get(category);
  if(r&&r.image){let img=images.get(r.image);if(!img){img=new Image();img.src=r.image;images.set(r.image,img);}if(img.complete&&img.naturalWidth){ctx.drawImage(img,x-size/2,y-size/2,size,size);return;}}
  ctx.save();ctx.translate(x,y);
  if(r&&r.draw)r.draw(ctx,0,0,size);else(icons[alias[category]]||icons._)(ctx,size);
  ctx.restore();
 }
 return {draw,register:(category,def)=>reg.set(category,def),categories:()=>Object.keys(icons).filter(k=>k!=='_')};
})();
window.EnterpriseModels=EnterpriseModels;
