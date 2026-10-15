import test from 'node:test';
import assert from 'node:assert/strict';
import { SoundInput } from '../src/audio.js';
test('bass energy drives bass envelope without activating other bands',()=>{
 const sound=new SoundInput();sound.active=true;sound.context={sampleRate:48000};sound.bins=new Uint8Array(1024);
 sound.analyser={fftSize:2048,getByteFrequencyData(bins){bins.fill(0);for(let i=3;i<=9;i++)bins[i]=220;}};
 sound.update(1/60,1.8);assert.ok(sound.levels[0]<.05, "a beat must not cause an abrupt jump");
 for(let i=0;i<60;i++)sound.update(1/60,1.8);
 assert.ok(sound.levels[0]>.8);assert.equal(sound.levels[1],0);assert.equal(sound.levels[2],0);
 sound.active=false;for(let i=0;i<360;i++)sound.update(1/60,1.8);
 assert.ok(sound.levels[0]<.001);
});
test('stopping releases microphone tracks and audio graph',()=>{
 const sound=new SoundInput();let stopped=0,disconnected=0,closed=0;
 sound.active=true;sound.stream={getTracks:()=>[{stop(){stopped++;}}]};sound.source={disconnect(){disconnected++;}};sound.context={close(){closed++;return Promise.resolve();}};
 sound.stop();assert.equal(stopped,1);assert.equal(disconnected,1);assert.equal(closed,1);assert.equal(sound.active,false);sound.stop();
});
