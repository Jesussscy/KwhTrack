/* Reglas compartidas para explicar datos reales y escenarios. */
const KwhInsights = (() => {
  function deviceEnergy(d) {
    if(d.active===false)return 0;
    return d.mode==='monthly'?d.monthlyKwh*d.quantity:d.watts/1000*d.quantity*d.hours*d.days*d.factor;
  }
  const day = value => Date.parse(value + 'T00:00:00Z') / 86400000;
  function intervalDays(start, end) { return day(end) - day(start); }
  function billMetrics({start,end,kwh,amount}){
    const validDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(day(value))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
    const duration=validDate(start)&&validDate(end)?intervalDays(start,end):null,days=duration>0?duration:null;
    const validNumber=value=>typeof value==='number'&&Number.isFinite(value)&&value>=0;
    return {days,daily:days!==null&&validNumber(kwh)?kwh/days:null,paidDaily:days!==null&&validNumber(amount)?amount/days:null};
  }
  function readingIntervals(readings) {
    const rows = [...readings].sort((a,b) => a.date.localeCompare(b.date));
    return rows.slice(1).map((r,i) => {
      const previous = rows[i], days = intervalDays(previous.date,r.date), kwh = r.value-previous.value;
      return { start:previous.date,end:r.date,days,kwh,daily:days>0&&kwh>=0?kwh/days:null };
    });
  }
  function compareBills(bills) {
    const rows=[...bills].sort((a,b)=>b.end.localeCompare(a.end)||b.start.localeCompare(a.start));
    if(rows.length<2)return null;
    const [current,previous]=rows;
    const currentDays=intervalDays(current.start,current.end), previousDays=intervalDays(previous.start,previous.end);
    if(currentDays<=0||previousDays<=0||previous.end>current.start)return null;
    const daily=current.kwh/currentDays,previousDaily=previous.kwh/previousDays;
    return {current,previous,currentDays,previousDays,daily,previousDaily,change:previousDaily>0?(daily-previousDaily)/previousDaily*100:null};
  }
  function overlaps(bill,others) { return others.some(b=>bill.start<b.end&&bill.end>b.start); }
  function groupConsumption(devices) {
    const categories=new Map();
    for(const d of devices)categories.set(d.category,(categories.get(d.category)||0)+deviceEnergy(d));
    const entries=[...categories].map(([name,kwh])=>({name,kwh})).filter(x=>x.kwh>0).sort((a,b)=>b.kwh-a.kwh);
    return entries.length>5?[...entries.slice(0,4),{name:'Otras categorías',kwh:entries.slice(4).reduce((s,x)=>s+x.kwh,0)}]:entries;
  }
  function scenario(totalKwh,before,after,rate,budget) {
    const kwh=Math.max(0,totalKwh-before+after),cost=kwh*rate;
    return {kwh,cost,annual:cost*12,margin:budget-cost,delta:(before-after)*rate};
  }
  function planFingerprint(d){return JSON.stringify([d.mode||'power',d.active!==false,d.watts,d.quantity,d.hours,d.days,d.factor]);}
  function annualBills(bills,year){
    const months=Array.from({length:12},()=>({amount:0,kwh:0,count:0}));
    const selected=bills.filter(b=>Number(b.end.slice(0,4))===Number(year));
    for(const bill of selected){const month=Number(bill.end.slice(5,7))-1;if(month<0||month>11)continue;months[month].amount+=bill.amount;months[month].kwh+=bill.kwh;months[month].count++;}
    return {months,bills:selected,amount:selected.reduce((s,b)=>s+b.amount,0),kwh:selected.reduce((s,b)=>s+b.kwh,0),count:selected.length,coveredMonths:months.filter(m=>m.count>0).length};
  }
  function evaluatePlan(devices,changes,rate,budget){
    const currentKwh=devices.reduce((sum,d)=>sum+deviceEnergy(d),0),rows=[],ids=new Set();
    let nextKwh=currentKwh;
    for(const change of changes){
      if(ids.has(change.id))throw new Error('El plan repite un equipo.');ids.add(change.id);
      const d=devices.find(d=>d.id===change.id);
      const values=Number.isFinite(change.hours)&&change.hours>=0&&change.hours<=24&&Number.isInteger(change.days)&&change.days>=1&&change.days<=31;
      const reason=!d?'removed':d.active===false?'paused':d.mode==='monthly'?'monthly':!values?'invalid-values':change.fingerprint!==planFingerprint(d)?'changed':null;
      const stale=reason!==null;
      const before=d?deviceEnergy(d):0,after=stale?before:deviceEnergy({...d,hours:change.hours,days:change.days});
      if(!stale)nextKwh+=after-before;
      rows.push({id:change.id,name:d?.name||change.name||'Equipo eliminado',stale,reason,before,after,currentHours:d?.hours,currentDays:d?.days,hours:change.hours,days:change.days,delta:before-after});
    }
    const cost=nextKwh*rate,currentCost=currentKwh*rate;
    return {rows,currentKwh,nextKwh,cost,currentCost,saved:currentCost-cost,annualSaved:(currentCost-cost)*12,margin:budget-cost,stale:rows.some(r=>r.stale)};
  }
  // Se proponen horarios, nunca cambios de potencia, factor ni consumo conocido.
  function suggestPlan(devices,percent,{maxReduction=35,excludedIds=[]}={}){
    if(!Number.isFinite(percent)||percent<0||percent>50||!Number.isFinite(maxReduction)||maxReduction<0||maxReduction>50)throw new Error('Meta o límite fuera de rango.');
    const adjustable=new Set(['Aire acondicionado','Ventilador','Televisor','Iluminación','Computador','Lavadora','Consola de videojuegos','Cocina eléctrica','Pequeños aparatos','Herramientas eléctricas']);
    const excluded=new Set(excludedIds),currentKwh=devices.reduce((sum,d)=>sum+deviceEnergy(d),0),targetKwh=currentKwh*percent/100;
    const candidates=devices.filter(d=>d.active!==false&&d.mode!=='monthly'&&adjustable.has(d.category)&&!excluded.has(d.id)&&deviceEnergy(d)>0).sort((a,b)=>deviceEnergy(b)-deviceEnergy(a)||a.id.localeCompare(b.id));
    let savedKwh=0;const changes=[];
    for(const d of candidates){
      if(savedKwh+1e-9>=targetKwh)break;
      const perHour=d.watts/1000*d.quantity*d.days*d.factor;
      const steps=Math.floor((d.hours*maxReduction/100+1e-9)*10);
      const used=Math.min(steps,Math.ceil((targetKwh-savedKwh)/perHour*10-1e-9));
      if(used<=0)continue;
      const hours=Number(Math.max(0,d.hours-used/10).toFixed(6));
      changes.push({id:d.id,name:d.name,hours,days:d.days,fingerprint:planFingerprint(d)});
      savedKwh+=deviceEnergy(d)-deviceEnergy({...d,hours});
    }
    return {changes,currentKwh,targetKwh,savedKwh,achievedPercent:currentKwh?savedKwh/currentKwh*100:0,shortfallKwh:Math.max(0,targetKwh-savedKwh),reached:currentKwh>0&&savedKwh+1e-8>=targetKwh,candidateIds:candidates.map(d=>d.id)};
  }
  return {deviceEnergy,intervalDays,billMetrics,readingIntervals,compareBills,overlaps,groupConsumption,scenario,planFingerprint,evaluatePlan,annualBills,suggestPlan};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=KwhInsights;
