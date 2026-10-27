import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {action,label}=createRequire(import.meta.url)('../../frontend/session-recovery.js');
test('sesión vencida lleva al acceso y no repite el guardado',()=>{assert.equal(action({status:401,code:'SESSION_REQUIRED'}),'signin');assert.equal(label('signin'),'Volver a iniciar sesión');});
test('cambio de cuenta y CSRF requieren actualizar antes de revisar',()=>{assert.equal(action({status:409,code:'ACCOUNT_CHANGED'}),'refresh');assert.equal(action({status:403,code:'CSRF_MISMATCH'}),'refresh');});
test('un conflicto de revisión y una respuesta incierta no se confunden con acceso vencido',()=>{for(const error of [{status:409},{status:403},{status:503},new Error('Sin respuesta')])assert.equal(action(error),'review');});
