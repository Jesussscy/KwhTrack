/* Ayudas de edición: no guardan ni reemplazan registros por sí mismas. */
let billEditingId=null;
function focusBillRow(id){const button=[...document.querySelectorAll('[data-edit-bill]')].find(item=>item.dataset.editBill===id);button?.focus();const row=button?.closest('tr');if(row){row.classList.remove('bill-row-return');void row.offsetWidth;row.classList.add('bill-row-return');}}
function billFormSummary(form){
 const value=name=>form.elements[name].value===''?null:Number(form.elements[name].value);
 const metrics=KwhInsights.billMetrics({start:form.elements.start.value,end:form.elements.end.value,kwh:value('kwh'),amount:value('amount')});
 const output=form.querySelector('.bill-form-preview');
 if(metrics.days===null){output.textContent='Completa un periodo válido para ver su duración y los promedios.';return;}
 output.textContent=`Periodo: ${countLabel(metrics.days,'día','días')}.${metrics.daily===null?'':` Consumo promedio: ${number(metrics.daily)} kWh/día.`}${metrics.paidDaily===null?'':` Total pagado por día del periodo: ${money(metrics.paidDaily)}.`}`;
}
function updateBillContext(){
 const form=$('#bill-form');if(!form)return;billEditingId=form.elements.id.value||null;const bill=state.bills.find(item=>item.id===billEditingId);
 form.closest('section').querySelector('h2').textContent=bill?'Editar factura':'Registrar factura';
 form.querySelector('.bill-edit-context').textContent=bill?`Editando la factura del ${formatDate(bill.start)} al ${formatDate(bill.end)}. Los cambios se guardan cuando pulsas Actualizar factura.`:'Añade el periodo, el consumo y el total que aparecen en tu factura.';
 billFormSummary(form);
}
function billExperienceEnhancements(){
 if(page!=='lecturas')return;const form=$('#bill-form');
 form.insertAdjacentHTML('afterbegin','<p class="field-hint bill-edit-context" role="status"></p>');
 form.querySelector('.form-grid').insertAdjacentHTML('afterend','<div class="inline-result bill-form-preview" role="status" aria-live="polite" aria-atomic="true"></div><p class="field-hint">Promedios del periodo completo, no mediciones de cada día. El total pagado puede incluir otros cargos; no se utiliza como precio por kWh.</p>');
 let timer;form.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>{if(form.isConnected)billFormSummary(form);},180);});
 form.addEventListener('submit',()=>{const id=form.elements.id.value;queueMicrotask(()=>{if(id&&!form.isConnected)focusBillRow(id);});});
 updateBillContext();
 document.querySelectorAll('[data-edit-bill]').forEach(button=>{const bill=state.bills.find(item=>item.id===button.dataset.editBill);if(bill)button.setAttribute('aria-label',`Editar factura del ${formatDate(bill.start)} al ${formatDate(bill.end)}`);});
}
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-edit-bill],#cancel-bill-edit');if(!button)return;
 const previous=billEditingId;updateBillContext();if(button.id==='cancel-bill-edit'&&previous)focusBillRow(previous);
});
