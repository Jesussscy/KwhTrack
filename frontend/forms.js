/* Protección de edición y errores accesibles sin cambiar los procesos de datos. */
const formBaselines=new WeakMap();
let discardAction=null;
let committedRoute=location.hash||'#resumen';
const routeHistoryId=history.state?.kwhHistoryId||crypto.randomUUID();
let committedRouteIndex=Number.isInteger(history.state?.kwhRouteIndex)?history.state.kwhRouteIndex:0;
let pendingHistoryRestore=null;
history.replaceState({...history.state,kwhHistoryId:routeHistoryId,kwhRouteIndex:committedRouteIndex},'',location.href);
function formSnapshot(form){return JSON.stringify([...form.elements].filter(e=>e.name).map(e=>[e.name,e.value,e.disabled]));}
function trackForm(form){if(!form)return;formBaselines.set(form,formSnapshot(form));clearFormErrors(form);updateDirtyHint(form);}
function isFormDirty(form){return formBaselines.has(form)&&formBaselines.get(form)!==formSnapshot(form);}
function dirtyForms(){return [...document.querySelectorAll('#equipment-form,#settings-form,#reading-form,#bill-form,#account-form')].filter(form=>{const dialog=form.closest('dialog');return (!dialog||dialog.open)&&isFormDirty(form);});}
function updateDirtyHint(form){const hint=form.querySelector('.unsaved-hint');if(hint)hint.hidden=!isFormDirty(form);}
function clearFormErrors(form){form.querySelectorAll('input,select').forEach(input=>{input.setCustomValidity('');input.removeAttribute('aria-invalid');const error=input.closest('label')?.querySelector('.field-error');if(error)error.remove();const described=input.getAttribute('aria-describedby')?.split(/\s+/).filter(id=>!id.startsWith('field-error-'));if(described?.length)input.setAttribute('aria-describedby',described.join(' '));else if(described)input.removeAttribute('aria-describedby');});}
let fieldErrorSequence=0;
function showFieldError(input,message){const label=input.closest('label');if(!input.hasAttribute('aria-label')&&label){const name=[...label.childNodes].filter(node=>node.nodeType===3).map(node=>node.textContent).join(' ').trim();if(name)input.setAttribute('aria-label',name);}input.setCustomValidity(message);input.setAttribute('aria-invalid','true');let node=label?.querySelector('.field-error');if(!node){node=document.createElement('span');node.className='field-error';node.id='field-error-'+(++fieldErrorSequence);label.append(node);}node.textContent=message;const ids=new Set((input.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean));ids.add(node.id);input.setAttribute('aria-describedby',[...ids].join(' '));input.focus();return false;}
function validationText(input){const v=input.validity;if(v.valueMissing)return 'Completa este dato para continuar.';if(v.rangeUnderflow)return `El valor mínimo es ${input.min}.`;if(v.rangeOverflow)return `El valor máximo es ${input.max}.`;if(v.stepMismatch)return `Usa un valor compatible con pasos de ${input.step||1}.`;if(v.badInput)return 'Introduce un número válido.';return input.validationMessage||'Revisa este dato.';}
function requestDiscard(action){discardAction=action;if(!$('#discard-dialog').open)$('#discard-dialog').showModal();}
function handleRouteChange(){
 const requested=location.hash||'#resumen';
 const known=history.state?.kwhHistoryId===routeHistoryId&&Number.isInteger(history.state.kwhRouteIndex);
 const requestedIndex=known?history.state.kwhRouteIndex:committedRouteIndex+1;
 if(!known)history.replaceState({...history.state,kwhHistoryId:routeHistoryId,kwhRouteIndex:requestedIndex},'',location.href);
 if(pendingHistoryRestore&&requestedIndex===committedRouteIndex){const target=pendingHistoryRestore;pendingHistoryRestore=null;requestDiscard(()=>{for(const form of dirtyForms()){form.reset();trackForm(form);}history.go(target.index-committedRouteIndex);});return;}
 if(requested===committedRoute){committedRouteIndex=requestedIndex;return;}
 if(dirtyForms().length){pendingHistoryRestore={route:requested,index:requestedIndex};history.go(committedRouteIndex-requestedIndex);return;}
 committedRoute=requested;committedRouteIndex=requestedIndex;document.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());render();window.scrollTo({top:0});$('#main-content').focus({preventScroll:true});
}
function formEnhancements(){
 document.querySelectorAll('#equipment-form,#settings-form,#reading-form,#bill-form,#account-form').forEach(form=>{
  if(!form.querySelector('.unsaved-hint')){const hint=document.createElement('p');hint.className='unsaved-hint';hint.textContent='Tienes cambios sin guardar.';hint.hidden=true;hint.setAttribute('role','status');form.append(hint);}
  if(form.dataset.editionHelp)return;form.dataset.editionHelp='true';
  form.addEventListener('input',()=>{clearFormErrors(form);updateDirtyHint(form);});form.addEventListener('change',()=>{clearFormErrors(form);updateDirtyHint(form);});
  form.addEventListener('invalid',event=>{event.preventDefault();const input=event.target;if(form.querySelector(':invalid')===input)showFieldError(input,validationText(input));},true);
  trackForm(form);
 });
}
document.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('#equipment-dialog,#settings-dialog').forEach(dialog=>{
  dialog.addEventListener('cancel',event=>{const form=dialog.querySelector('form');if(isFormDirty(form)){event.preventDefault();requestDiscard(()=>{form.reset();trackForm(form);dialog.close();});}});
  dialog.addEventListener('close',()=>{const form=dialog.querySelector('form');formBaselines.delete(form);});
 });
 $('#discard-confirm').onclick=()=>{const action=discardAction;discardAction=null;$('#discard-dialog').close();action?.();};
 $('#discard-dialog').addEventListener('close',()=>{discardAction=null;});
});
document.addEventListener('click',event=>{
 const remove=event.target.closest('[data-delete],[data-delete-reading],[data-delete-bill],[data-action="clear-example"]');
 if(remove&&dirtyForms().length){event.preventDefault();event.stopImmediatePropagation();requestDiscard(()=>{for(const form of dirtyForms()){form.reset();trackForm(form);}remove.click();});return;}
 const cancel=event.target.closest('#cancel-reading-edit,#cancel-bill-edit');
 if(cancel){const form=cancel.closest('form');if(isFormDirty(form)){event.preventDefault();event.stopImmediatePropagation();requestDiscard(()=>{form.reset();trackForm(form);cancel.click();});return;}}
 const edit=event.target.closest('[data-edit-reading],[data-edit-bill]');
 if(edit){const form=edit.dataset.editReading?$('#reading-form'):$('#bill-form');if(form&&isFormDirty(form)){event.preventDefault();event.stopImmediatePropagation();requestDiscard(()=>{form.reset();trackForm(form);edit.click();});return;}}
 const close=event.target.closest('.close-dialog');
 if(close){const dialog=close.closest('dialog'),form=dialog?.querySelector('form');if(form&&isFormDirty(form)){event.preventDefault();event.stopImmediatePropagation();requestDiscard(()=>{form.reset();trackForm(form);dialog.close();});return;}}
 const anchor=event.target.closest('a[href]');
 if(anchor&&anchor.target!=='_blank'){
  const url=new URL(anchor.href,location.href),nextPage=url.hash.slice(1)||'resumen';
  if(url.origin===location.origin&&Object.hasOwn(pageNames,nextPage)&&nextPage!==page&&dirtyForms().length){event.preventDefault();event.stopImmediatePropagation();requestDiscard(()=>{for(const form of dirtyForms()){form.reset();trackForm(form);}location.hash=nextPage;});return;}
 }
},true);
document.addEventListener('click',event=>{
 const b=event.target.closest('button');if(!b)return;
 if(b.dataset.editReading||b.dataset.editBill||b.dataset.duplicateDevice)queueMicrotask(()=>trackForm(b.dataset.editReading?$('#reading-form'):b.dataset.editBill?$('#bill-form'):$('#equipment-form')));
 if(b.id==='use-device-preset')queueMicrotask(()=>updateDirtyHint($('#equipment-form')));
 if(b.id==='cancel-reading-edit'||b.id==='cancel-bill-edit')queueMicrotask(()=>trackForm(b.closest('form')));
});
window.addEventListener('beforeunload',event=>{if(dirtyForms().length){event.preventDefault();event.returnValue='';}});
