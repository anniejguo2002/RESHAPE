import test from 'node:test';
import assert from 'node:assert/strict';
import { MemoryField } from '../src/memory.js';
import { seededRandom } from '../src/config.js';
test('disturbance remains local and residue survives recovery',()=>{const m=new MemoryField(48,180,.23);m.deposit(0,0,.3);const i=24*48+24;assert.ok(m.transient[i]>0);assert.equal(m.transient[0],0);const residue=m.sediment[i];m.update(360);assert.ok(m.transient[i]<.075);assert.equal(m.sediment[i],residue);assert.ok(m.data[i*4]>0);m.reset();assert.ok(m.data.every(v=>v===0));assert.ok(m.sediment.every(v=>v===0));});
test('decay is independent of frame rate',()=>{const a=new MemoryField(16,180,.23),b=new MemoryField(16,180,.23);a.deposit(0,0,.5);b.deposit(0,0,.5);a.update(10);for(let i=0;i<600;i++)b.update(1/60);assert.ok(Math.abs(a.transient[136]-b.transient[136])<1e-5);});
test('initial randomness repeats exactly',()=>{const a=seededRandom(73421),b=seededRandom(73421);for(let i=0;i<1000;i++)assert.equal(a(),b());});
