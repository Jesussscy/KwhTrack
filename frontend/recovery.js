let storageReviewRaw=null;
function renderStorageStatus(){
 const banner=$('#storage-status');if(!banner)return;
 const latest=storageSession.peek(),conflict=latest.status!=='unavailable'&&latest.raw!==storageSession.baseline;
 const damaged=storageSession.status==='damaged'&&!conflict,unavailable=latest.status==='unavailable';
 banner.hidden=!damaged&&!unavailable&&!conflict;
 if(banner.hidden)return;
 banner.innerHTML=`<div><strong>${damaged?'Tus datos guardados necesitan recuperación':unavailable?'No se puede acceder al almacenamiento':'Hay otra versión guardada de tu hogar'}</strong><p>${damaged?'El contenido original se conserva. El hogar visible es un ejemplo temporal y no puede sustituirlo con un guardado normal.':unavailable?'Puedes revisar esta vista, pero los cambios no se guardarán. Descarga una copia de lo que tengas antes de cerrar.':'Otra pestaña o ventana cambió los datos. Revisa y carga esa versión antes de guardar para evitar sobrescribirla.'}</p></div><div class="storage-actions">${damaged?'<button class="button small" data-storage-original>Descargar original ↓</button><button class="button small" data-action="backup-import">Restaurar una copia ↥</button>':conflict?'<button class="button small" id="review-storage">Revisar versión guardada ↗</button>':'<button class="button small" data-action="backup-export">Descargar copia ↓</button>'}</div>`;
 if($('#review-storage'))$('#review-storage').onclick=openStorageReview;
 banner.querySelector('[data-storage-original]')?.addEventListener('click',downloadStorageOriginal);
 if(conflict&&latest.status==='damaged'){
  banner.querySelector('strong').textContent='La versión guardada cambió y no se puede leer';
  banner.querySelector('p').textContent='Tu vista actual se conserva. Descarga una copia de esta vista y reabre la recuperación para revisar el contenido que ahora está guardado.';
  banner.querySelector('.storage-actions').innerHTML='<button class="button small" data-action="backup-export">Descargar mi vista ↓</button><button class="button small" id="reload-storage">Reabrir recuperación ↗</button>';
  $('#reload-storage').onclick=()=>{const reload=()=>{for(const form of dirtyForms()){form.reset();trackForm(form);}location.reload();};if(dirtyForms().length)requestDiscard(reload);else reload();};
 }
}
function downloadStorageOriginal(){const original=storageSession.original();if(original===null)return toast('No hay un contenido original disponible.');const blob=new Blob([original],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`kwhTrack-original-${localDate()}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Original descargado sin modificar.');}
function openStorageReview(){
 if(dirtyForms().length){requestDiscard(()=>{for(const form of dirtyForms()){form.reset();trackForm(form);}openStorageReview();});return;}
 const latest=storageSession.peek();if(!['ready','empty'].includes(latest.status)){renderStorageStatus();return toast('No se pudo cargar esa versión. Conservamos tu vista actual.');}
 storageReviewRaw=latest.raw;const data=latest.data;
 $('#storage-review-summary').textContent=latest.status==='empty'?'El almacenamiento se vació desde otra vista. No hay un hogar guardado. Cargar este estado mostrará un hogar de ejemplo; descarga antes una copia de tu vista actual si quieres conservarla.':`Versión guardada: ${data.settings.name}, ${countLabel(data.devices.length,'equipo','equipos')}, ${countLabel(data.readings.length,'lectura','lecturas')}, ${countLabel(data.bills.length,'factura','facturas')} y ${countLabel(data.draftPlan?.length||0,'cambio','cambios')} en el plan. Cargarla sustituirá esta vista por la versión que ya está guardada.`;$('#load-storage-version').textContent=latest.status==='empty'?'Cargar espacio vacío':'Cargar versión guardada';$('#storage-review-dialog').showModal();
}
function recoveryEnhancements(){
 renderStorageStatus();
 if(storageSession.quarantined&&page==='presupuesto'){
  const section=document.createElement('section');section.className='panel section-gap recovery-original';section.innerHTML='<div><h2>Conservamos el original recuperado</h2><p class="compact-note">Antes de restaurar la copia, guardamos el contenido que no se podía leer. Puedes descargarlo sin alterar tu hogar actual.</p></div><button class="button" id="download-recovery-original">Descargar original ↓</button>';$('#main-content').append(section);$('#download-recovery-original').onclick=downloadStorageOriginal;
 }
}
document.addEventListener('DOMContentLoaded',()=>{$('#load-storage-version').onclick=()=>{const loaded=storageSession.adopt(storageReviewRaw);if(!loaded.ok){toast(loaded.message);return;}state=loaded.data;lastSavedState=structuredClone(state);clearUndoOffer();$('#storage-review-dialog').close();render();toast('Versión guardada cargada. Ya puedes continuar.');};});
window.addEventListener('storage',event=>{if(event.key===storageSession.key||event.key===null)renderStorageStatus();});
