import {createRequire} from 'node:module';
import {HttpError} from './errors.js';
const E=createRequire(import.meta.url)('../../frontend/enterprise-energy.js');
const provider=createRequire(import.meta.url)('../../frontend/server/solar-provider.cjs');
export {E};
export function validateEnergy(data,floorIds){try{return E.validate(data,floorIds);}catch(e){throw new HttpError(400,e.message);}}
export async function solarProfile(input){try{return await provider.solarProfile(input);}catch(e){throw new HttpError(e.status||502,e.message);}}
