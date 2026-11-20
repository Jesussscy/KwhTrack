/* Movimiento nativo del navegador. No cambia datos ni aplaza la navegación. */
const KwhMotion=(()=>{
 const preference=matchMedia('(prefers-reduced-motion: reduce)'),running=new Set();let previousPage=null;
 function cancel(){for(const animation of running)animation.cancel();running.clear();}
 function play(element,frames,options){if(preference.matches||!element?.animate)return;try{const animation=element.animate(frames,options);running.add(animation);const release=()=>running.delete(animation);animation.addEventListener('finish',release,{once:true});animation.addEventListener('cancel',release,{once:true});}catch{/* La interfaz sigue visible cuando no hay animaciones nativas. */}}
 function enter(main,direction=1){
  cancel();if(preference.matches)return;
  play(main,[{transform:`translateX(${direction*12}px)`},{transform:'translateX(0)'}],{duration:360,easing:'cubic-bezier(.2,.75,.25,1)'});
  const heading=main.querySelector('.page-heading');play(heading,[{opacity:.55,transform:'translateY(9px)'},{opacity:1,transform:'translateY(0)'}],{duration:400,easing:'cubic-bezier(.2,.75,.25,1)'});
  const candidates=[...main.querySelectorAll('.hero,.annual-hero,.panel,.stat,.learning-cards>article,.tariff-hero,.journey-strip,.annual-banner')];
  const visible=candidates.filter(element=>element.getBoundingClientRect().top<innerHeight+70&&!element.parentElement.closest('.panel,.hero,.annual-hero'));
  visible.slice(0,10).forEach((element,index)=>play(element,[{opacity:.65,transform:'translateY(13px)'},{opacity:1,transform:'translateY(0)'}],{duration:370,delay:Math.min(index*38,190),fill:'backwards',easing:'cubic-bezier(.2,.75,.25,1)'}));
 }
 function afterRender(main,page){const changed=page!==previousPage,order=Object.keys(pageNames),direction=previousPage&&order.indexOf(page)<order.indexOf(previousPage)?-1:1;previousPage=page;if(changed){enter(main,direction);const active=document.querySelector('nav a[aria-current="page"]');play(active,[{transform:'scale(.96)'},{transform:'scale(1)'}],{duration:320,easing:'ease-out'});}}
 function syncPreference(){if(preference.matches)cancel();const button=document.querySelector('#replay-motion');if(button){button.disabled=preference.matches;button.title=preference.matches?'Tu sistema tiene activado el movimiento reducido':'Repetir animación de esta sección';}}
 document.addEventListener('DOMContentLoaded',()=>{
  document.body.classList.add('motion-ready');syncPreference();document.querySelector('#replay-motion')?.addEventListener('click',()=>enter(document.querySelector('#main-content')));
  const observer=new MutationObserver(records=>{for(const {target} of records)if(target.open)play(target,[{opacity:.55,transform:'translateY(12px) scale(.985)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:230,easing:'cubic-bezier(.2,.75,.25,1)'});});
  document.querySelectorAll('dialog').forEach(dialog=>observer.observe(dialog,{attributes:true,attributeFilter:['open']}));
 });
 preference.addEventListener('change',syncPreference);
 document.addEventListener('click',event=>{
  if(preference.matches)return;const button=event.target.closest('button.button,button.icon-button');if(!button||button.disabled)return;
  button.querySelector('.motion-ink')?.remove();const rect=button.getBoundingClientRect(),ink=document.createElement('span'),size=Math.max(rect.width,rect.height)*2;
  ink.className='motion-ink';ink.setAttribute('aria-hidden','true');ink.style.width=ink.style.height=size+'px';ink.style.left=(event.detail?event.clientX-rect.left:rect.width/2)+'px';ink.style.top=(event.detail?event.clientY-rect.top:rect.height/2)+'px';button.append(ink);ink.addEventListener('animationend',()=>ink.remove(),{once:true});setTimeout(()=>ink.remove(),650);
 },true);
 return {afterRender};
})();
