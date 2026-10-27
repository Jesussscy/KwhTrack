export function calculateDevice(input) {
  if(!input||typeof input!=='object')throw new Error('Equipo inválido');
  if(input.mode!==undefined&&!['power','monthly'].includes(input.mode))throw new Error('Método inválido');
  if(input.mode==='monthly'){
    if(typeof input.monthlyKwh!=='number'||!Number.isFinite(input.monthlyKwh)||input.monthlyKwh<0||input.monthlyKwh>1000000)throw new Error('Consumo mensual inválido');
    if(!Number.isInteger(input.quantity)||input.quantity<1||input.quantity>100)throw new Error('Cantidad inválida');
    return input.monthlyKwh*input.quantity;
  }
  const limits={watts:[1,100000],quantity:[1,100],hours:[0,24],days:[1,31],factor:[0,1]};
  const data={};
  for(const [key,[min,max]] of Object.entries(limits)) {
    const value=input[key];
    if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max)throw new Error(`Valor inválido: ${key}`);
    if(['quantity','days'].includes(key)&&!Number.isInteger(value))throw new Error(`Se requiere un entero: ${key}`);
    data[key]=value;
  }
  return data.watts/1000*data.quantity*data.hours*data.days*data.factor;
}
