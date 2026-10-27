/* Análisis de facturas: nunca modifica el hogar ni sus copias. */
const KwhBillAnalysis = (() => {
  const day = value => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
    const stamp = Date.parse(value + 'T00:00:00Z');
    return Number.isFinite(stamp) && new Date(stamp).toISOString().slice(0, 10) === value ? stamp / 86400000 : NaN;
  };
  function metrics(bill) {
    const days = day(bill.end) - day(bill.start);
    if (!(days > 0) || !Number.isFinite(bill.kwh) || bill.kwh < 0 || !Number.isFinite(bill.amount) || bill.amount < 0) return null;
    return { ...bill, days, daily: bill.kwh / days };
  }
  const ordered = bills => bills.map(metrics).filter(Boolean).sort((a, b) => b.end.localeCompare(a.end) || b.start.localeCompare(a.start));
  const difference = (current, previous) => ({ absolute: current - previous, percent: previous > 0 ? (current - previous) / previous * 100 : null });
  function compare(previous, current) {
    const a = metrics(previous), b = metrics(current);
    if (!a || !b || a.id === b.id || (a.start < b.end && a.end > b.start)) return null;
    return { previous: a, current: b, kwh: difference(b.kwh, a.kwh), amount: difference(b.amount, a.amount), daily: difference(b.daily, a.daily) };
  }
  function alert(bills, threshold = 20) {
    if (!Number.isFinite(threshold) || threshold < 1 || threshold > 200) throw new Error('El umbral debe estar entre 1 y 200 %.');
    const rows = ordered(bills), current = rows[0];
    if (!current) return { status: 'insufficient', available: 0, threshold };
    const history = rows.slice(1).filter(b => b.end <= current.start).slice(0, 3);
    if (history.length < 3) return { status: 'insufficient', current, available: history.length, threshold };
    if (history.some((b, i) => i > 0 && b.end > history[i - 1].start)) return { status: 'overlap', current, threshold };
    const baseline = history.reduce((sum, b) => sum + b.daily, 0) / 3;
    if (baseline === 0) return { status: 'zero', current, history, baseline, threshold };
    const change = (current.daily - baseline) / baseline * 100;
    return { status: change - threshold > 1e-9 ? 'high' : 'normal', current, history, baseline, change, threshold };
  }
  return { metrics, ordered, compare, alert };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = KwhBillAnalysis;

let billAnalysisThreshold = 20;
function billAnalysisAlertMarkup(bills) {
  const result = KwhBillAnalysis.alert(bills, billAnalysisThreshold);
  const titles = { insufficient: 'Tu historial está comenzando', overlap: 'Revisa los periodos de tu historial', zero: 'La referencia tiene consumo cero', high: 'Tu consumo diario aumentó', normal: 'Sin aumento por encima del umbral' };
  let detail;
  if (result.status === 'insufficient') detail = `Necesitas una factura actual y tres anteriores para evaluar el aumento. Tienes ${result.available} de los 3 antecedentes necesarios.`;
  else if (result.status === 'overlap') detail = 'Hay facturas anteriores con periodos superpuestos. Revísalas antes de interpretar una tendencia.';
  else if (result.status === 'zero') detail = 'El promedio de los tres periodos anteriores es cero. No es posible calcular una variación porcentual.';
  else detail = `Última factura: ${formatDate(result.current.start)} al ${formatDate(result.current.end)}. Promedio actual: ${number(result.current.daily)} kWh/día; referencia: ${number(result.baseline)} kWh/día. Variación: ${result.change > 0 ? '+' : ''}${number(result.change)} % frente al promedio de los tres periodos anteriores.`;
  return `<div class="bill-signal ${result.status === 'high' ? 'bill-signal-high' : ''}"><span class="bill-signal-icon" aria-hidden="true">${result.status === 'high' ? '↗' : '◉'}</span><div><h3>${titles[result.status]}</h3><p>${detail}</p></div></div>`;
}
function billAnalysisEnhancements() {
  if (page === 'resumen') {
    const rows = KwhBillAnalysis.ordered(state.bills), latest = rows[0];
    const section = document.createElement('section');
    section.className = 'bill-pulse';
    section.setAttribute('aria-label', 'Tu última factura');
    section.innerHTML = `<div><span class="eyebrow">DE TU FACTURA AL AHORRO</span><h2>${latest ? 'Tu último consumo registrado' : 'Dale contexto real a tus estimaciones'}</h2><p>${latest ? `${formatDate(latest.start)} al ${formatDate(latest.end)} · ${latest.days} días facturados` : 'Añade tu factura y descubre cómo cambia tu consumo entre periodos.'}</p></div>${latest ? `<div class="bill-pulse-value"><strong>${number(latest.kwh)} <small>kWh</small></strong><span>${number(latest.daily)} kWh/día · ${money(latest.amount)} facturados</span></div>` : '<span class="bill-pulse-icon" aria-hidden="true">▤</span>'}<a class="button dark" href="#lecturas">${latest ? 'Analizar mis facturas' : 'Registrar mi primera factura'} <span aria-hidden="true">↗</span></a>`;
    document.querySelector('.stats')?.after(section);
    return;
  }
  if (page !== 'lecturas') return;
  const rows = KwhBillAnalysis.ordered(state.bills);
  const panel = document.createElement('section');
  panel.className = 'panel bill-analysis section-gap';
  const options = rows.map(b => `<option value="${escapeHTML(b.id)}">${formatDate(b.start)} a ${formatDate(b.end)} · ${number(b.kwh)} kWh</option>`).join('');
  panel.innerHTML = `<div class="panel-head"><div><div class="eyebrow">ENTIENDE LO QUE CAMBIÓ</div><h2>Elige tus periodos. Encuentra la diferencia.</h2><p>Consumo y valor facturado, con una referencia diaria para comparar mejor.</p></div><span class="pill">Datos de tus facturas</span></div>${rows.length >= 2 ? `<div class="bill-compare-controls"><label>Periodo de referencia<select id="bill-reference">${options}</select></label><label>Periodo a analizar<select id="bill-current">${options}</select></label></div><div id="bill-comparison-result" role="status" aria-live="polite" aria-atomic="true"></div>` : '<div class="bill-analysis-empty"><span aria-hidden="true">↔</span><h3>Dos facturas abren la comparación</h3><p>Registra dos periodos para ver cuánto cambió tu consumo y cuánto pagaste. Tus estimaciones por equipos se conservan aparte.</p><button type="button" class="button" id="bill-analysis-start">Registrar una factura ↑</button></div>'}<div class="bill-alert-heading"><div><h2>Detecta aumentos inusuales</h2><p>Comparamos el consumo diario de la última factura con los tres periodos anteriores.</p></div><label>Umbral de esta consulta (%)<input id="bill-alert-threshold" type="number" min="1" max="200" step="1" value="${billAnalysisThreshold}" aria-describedby="bill-threshold-help"></label></div><div id="bill-alert-result" role="status" aria-live="polite" aria-atomic="true">${billAnalysisAlertMarkup(state.bills)}</div><p class="field-hint" id="bill-threshold-help">Umbral inicial: 20 %. Puedes probar entre 1 y 200 %; se conserva solo durante esta sesión de la página. Es una alerta orientativa de la aplicación, no una meta oficial ni un cálculo de cobros adicionales.</p><details class="bill-history"><summary>Ver tendencia e historial comparable (${rows.length} facturas)</summary><p class="field-hint">Promedios de cada periodo completo. Las barras no representan mediciones diarias. Se muestran hasta las 12 facturas más recientes.</p><div id="bill-history-chart"></div></details>`;
  const oldComparison = [...document.querySelectorAll('#main-content section')].find(section => section.querySelector('h2')?.textContent === 'Compara tus últimas facturas');
  if (oldComparison) oldComparison.replaceWith(panel);
  else document.querySelector('#bill-form').closest('.split').after(panel);
  const reference = panel.querySelector('#bill-reference'), current = panel.querySelector('#bill-current');
  if (reference) {
    reference.value = rows[1].id;
    current.value = rows[0].id;
    const update = () => {
      const comparison = KwhBillAnalysis.compare(rows.find(b => b.id === reference.value), rows.find(b => b.id === current.value));
      const output = panel.querySelector('#bill-comparison-result');
      if (!comparison) { output.innerHTML = '<p class="bill-selection-note">Selecciona dos periodos distintos y sin superposición para comparar.</p>'; return; }
      const metric = (label, delta, unit, a, b, formatter) => `<article class="bill-delta"><span>${label}</span><strong>${delta.absolute > 0 ? '+' : ''}${formatter(delta.absolute)}${unit}</strong><p>${delta.percent === null ? 'Porcentaje no calculable: referencia en cero.' : `${delta.percent > 0 ? '+' : ''}${number(delta.percent)} % respecto a la referencia`}</p><small>${formatter(a)} → ${formatter(b)}${unit}</small></article>`;
      output.innerHTML = `<div class="bill-deltas">${metric('Consumo del periodo', comparison.kwh, ' kWh', comparison.previous.kwh, comparison.current.kwh, number)}${metric('Consumo promedio diario', comparison.daily, ' kWh/día', comparison.previous.daily, comparison.current.daily, number)}${metric('Valor total facturado', comparison.amount, '', comparison.previous.amount, comparison.current.amount, money)}</div><p class="field-hint">Referencia: ${comparison.previous.days} días. Periodo analizado: ${comparison.current.days} días. Compara kWh/día si cambia la duración. El total facturado puede incluir otros cargos y no equivale al precio de energía por kWh.</p>`;
    };
    reference.addEventListener('change', update);
    current.addEventListener('change', update);
    update();
  }
  panel.querySelector('#bill-analysis-start')?.addEventListener('click', () => {
    document.querySelector('#bill-form').scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    document.querySelector('#bill-form').elements.start.focus({ preventScroll: true });
  });
  panel.querySelector('#bill-alert-threshold').addEventListener('input', event => {
    if (!event.target.checkValidity() || !event.target.value) {
      panel.querySelector('#bill-alert-result').textContent = 'Introduce un porcentaje entero entre 1 y 200 para evaluar la alerta.';
      return;
    }
    billAnalysisThreshold = Number(event.target.value);
    panel.querySelector('#bill-alert-result').innerHTML = billAnalysisAlertMarkup(state.bills);
  });
  const history = rows.slice(0, 12).reverse(), max = Math.max(1, ...history.map(b => b.daily));
  panel.querySelector('#bill-history-chart').innerHTML = history.length ? `<div class="bill-trend" aria-hidden="true">${history.map(b => `<div class="bill-trend-row"><span>${formatDate(b.end)}</span><div><i style="width:${b.daily / max * 100}%"></i></div><strong>${number(b.daily)}</strong></div>`).join('')}</div><div class="table-wrap"><table><caption>Consumo y valor por periodo, del más antiguo al más reciente</caption><thead><tr><th scope="col">Periodo</th><th scope="col">Días</th><th scope="col">kWh</th><th scope="col">kWh/día</th><th scope="col">Total COP</th></tr></thead><tbody>${history.map(b => `<tr><td>${formatDate(b.start)} a ${formatDate(b.end)}</td><td>${b.days}</td><td>${number(b.kwh)}</td><td>${number(b.daily)}</td><td>${money(b.amount)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="field-hint">El historial aparecerá al registrar tu primera factura.</p>';
}
