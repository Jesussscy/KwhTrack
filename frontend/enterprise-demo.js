/* Escenario de demostración compartido (cliente y servidor). Datos de ejemplo: NO son mediciones. */
const EnterpriseDemo=(()=>{
 const E=(name,category,quantity,watts,hours,days)=>({name,category,quantity,watts,hours,days});
 const office=[E('Aire acondicionado','Aire acondicionado',4,1200,8,22),E('Luminaria','Iluminación',3,18,10,22),E('Computador','Computador',2,150,8,22),E('Impresora','Impresora',1,500,1,22)];
 const meeting=[E('Aire acondicionado','Aire acondicionado',1,1200,6,22),E('Luminaria','Iluminación',8,18,6,22),E('Proyector','Proyector',1,250,3,22),E('Computador','Computador',10,150,6,22)];
 const S=(name,kind,eq=[],extra={})=>({name,kind,eq,...extra});
 const definition={name:'Edificio de demostración',floors:[
  {name:'Piso 1',spaces:[S('Espacio A','Oficina',office),S('Espacio B','Sala de reuniones',meeting),S('Recepción','Recepción',[E('Luminaria','Iluminación',2,18,10,22),E('Computador','Computador',1,150,9,22)]),S('Zona de descanso','Cafetería',[E('Nevera','Refrigeración',1,150,24,30)])]},
  {name:'Piso 2',spaces:[S('Oficina 2A','Oficina',[E('Computador','Computador',3,150,8,22),E('Luminaria','Iluminación',6,18,10,22)],{workstations:4,occupied:3,deskMode:'open',areaM2:24}),S('Oficina 2B','Oficina',[E('Computador','Computador',4,150,8,22)],{workstations:4,occupied:2,deskMode:'cubicle'}),S('Cubículo 3B','Cubículo'),S('Sala Caribe','Sala de reuniones',[E('Proyector','Proyector',1,250,2,12)]),S('Bodega','Bodega'),S('Zona de servidores','Otro',[E('Servidor','Servidor',2,400,24,30)])]},
  {name:'Piso 3',spaces:[S('Gerencia','Oficina',[E('Aire acondicionado','Aire acondicionado',2,1200,8,22)]),S('Sala 3B','Sala de reuniones'),S('Habitación 3C','Habitación'),S('Pasillo','Pasillo')]}
 ]};
 function create({nextId,asOf=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Bogota',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()),variant='complete'}={}){
  const Calc=typeof module!=='undefined'&&module.exports?require('./enterprise-calc-client.js'):EnterpriseCalc,Layout=typeof module!=='undefined'&&module.exports?require('./enterprise-layout.js'):EnterpriseLayout;
  let number=0;const id=nextId||(()=>++number),raw={id:1,name:definition.name,city:'Cartagena',isDemo:true,demoVersion:2,demoVariant:variant,revision:0,records:[],budget:{monthlyBudget:4500000,tariffRate:1000,tariffSource:'Dato de ejemplo · tarifa ficticia para demostrar cálculos',tariffDate:asOf},energy:{version:1,solar:null,corridors:[],observations:[],rules:[],noOwnSpaces:[]},common:[{id:id(),name:'Ascensor · dato de ejemplo',category:'Otro',mode:'power',quantity:1,watts:3000,hours:1,days:30,factor:1,active:true,essential:true}],floors:[]};
  for(const [fi,source]of definition.floors.entries()){
   const floor={id:id(),name:source.name,order:fi,config:null,spaces:[]};
   for(const [si,sourceSpace]of source.spaces.entries()){
    let name=sourceSpace.name,kind=sourceSpace.kind;if(kind==='Pasillo'){name='Oficina 3D';kind='Oficina';}
    const defaults=kind==='Bodega'?[E('Luces LED','Iluminación',2,12,6,26)]:[E('Computadores','Computador',2,120,8,22),E('Luces LED','Iluminación',2,12,8,22)];
    const eq=sourceSpace.eq.length?sourceSpace.eq:defaults;
    floor.spaces.push({id:id(),name,kind,slot:null,plan:null,workstations:sourceSpace.workstations??null,occupied:sourceSpace.occupied??null,deskMode:sourceSpace.deskMode??null,areaM2:sourceSpace.areaM2??null,equipment:eq.map(e=>({id:id(),...e,mode:'power',factor:1,monthlyKwh:null,active:true,essential:e.category==='Servidor'||e.category==='Refrigeración',source:'Dato de ejemplo'}))});
   }
   const generated=Layout.generate(floor.spaces.map(sp=>({ref:String(sp.id),kind:sp.kind,size:'standard'})),{corridor:true,variant:fi%3,decor:true});
   if(!generated.ok)throw Error('No se pudo generar la planta de ejemplo: '+generated.error);
   floor.config={version:generated.version,corridor:true,corridorRect:generated.corridor,variant:fi%3,decor:true};
   for(const sp of floor.spaces){const r=generated.rects.find(r=>r.ref===String(sp.id));sp.plan={x:r.x,y:r.y,w:r.w,d:r.d};if(sp.workstations&&!Layout.workstations(sp.plan,sp.workstations,sp.deskMode||'open',Layout.doorSide(sp.plan,generated.corridor)).ok)sp.deskMode='open';}
   raw.floors.push(floor);raw.energy.corridors.push({id:'demo-corridor-'+floor.id,floorId:floor.id,name:'Pasillo de '+floor.name,equipment:[{id:'demo-light-'+floor.id,name:'Luminarias LED del pasillo',category:'Iluminación',quantity:8,mode:'power',watts:12,hours:10,days:30,factor:1,active:true,essential:false}]});
  }
  const complete=Calc.computeBuilding(raw),daily=complete.totals.buildingKwh/30,reference=new Date(asOf+'T00:00:00Z'),weights=[.96,.99,1.02,1.04,.98,1.01,1.03,1];
  raw.records=weights.map((weight,i)=>{const start=new Date(Date.UTC(reference.getUTCFullYear(),reference.getUTCMonth()-8+i,1)),end=new Date(Date.UTC(start.getUTCFullYear(),start.getUTCMonth()+1,0)),days=end.getUTCDate();return {id:id(),start:start.toISOString().slice(0,10),end:end.toISOString().slice(0,10),kwh:Math.round(daily*days*weight*100)/100,origin:'bill',source:'Dato de ejemplo · periodo sintético'};});
  const now=Date.now(),zone=raw.energy.corridors[0].name;raw.energy.observations=[{id:'example-presence',zone,type:'occupancy',value:true,at:new Date(now).toISOString(),source:'Dato de ejemplo · sensor de presencia simulado',origin:'manual'},{id:'example-power',zone,type:'power',value:96,at:new Date(now).toISOString(),source:'Dato de ejemplo · medidor simulado',origin:'manual'},{id:'example-temperature',zone,type:'temperature',value:28,at:new Date(now).toISOString(),source:'Dato de ejemplo · temperatura declarada',origin:'manual'}];
  raw.energy.rules=[{id:'example-rule',name:'Pasillo sin uso · ejemplo',zone,target:'Luces no esenciales del pasillo',timeout:15,maxAge:5,essential:false,override:false,enabled:true,kind:'lighting',mode:'observe',startHour:8,endHour:18,utcOffset:-5}];
  if(variant==='incomplete'){raw.name+=' · caso con pendientes';raw.floors[0].spaces[0].equipment[0].hours=null;raw.floors[2].spaces[0].equipment[0].watts=null;raw.floors[2].spaces[2].equipment=[];}
  return Calc.computeBuilding(raw);
 }
 return {...definition,create};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=EnterpriseDemo;
