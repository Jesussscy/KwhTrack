/* Compara hogares ya validados. No mezcla ni modifica sus registros. */
const KwhComparison=(()=>{
 const groups=[['devices','Electrodomésticos'],['readings','Lecturas'],['bills','Facturas'],['draftPlan','Plan de ahorro']];
 function fields(before,after){return [...new Set([...Object.keys(before),...Object.keys(after)])].filter(key=>key!=='id'&&before[key]!==after[key]).map(key=>({key,before:before[key],after:after[key]}));}
 function compare(before,after){
  const settings=fields(before.settings,after.settings);
  if(before.example!==after.example)settings.push({key:'example',before:before.example,after:after.example});
  const collections=groups.map(([key,title])=>{
   const old=new Map((before[key]||[]).map(row=>[row.id,row])),next=new Map((after[key]||[]).map(row=>[row.id,row]));
   const added=[...next.values()].filter(row=>!old.has(row.id)),removed=[...old.values()].filter(row=>!next.has(row.id)),changed=[];
   for(const row of next.values()){const previous=old.get(row.id);if(previous){const changes=fields(previous,row);if(changes.length)changed.push({before:previous,after:row,fields:changes});}}
   return {key,title,added,removed,changed};
  });
  return {settings,collections,identical:settings.length===0&&collections.every(group=>!group.added.length&&!group.removed.length&&!group.changed.length)};
 }
 return {compare};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=KwhComparison;
