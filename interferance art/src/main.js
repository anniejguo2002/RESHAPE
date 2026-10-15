import * as THREE from 'three';
import './style.css';
import { CONFIG } from './config.js';
import { MemoryField } from './memory.js';
import { SoundInput } from './audio.js';
import { createSculpture } from './sculpture.js';

const host=document.querySelector('#artwork');
try { init(); } catch(error) { console.error(error); const el=document.querySelector('#error');el.hidden=false;el.textContent='This sculpture needs WebGL. Please enable hardware acceleration or open it in a WebGL-capable browser.'; }
function init(){
 const renderer=new THREE.WebGLRenderer({antialias:false,alpha:false,powerPreference:'high-performance'});
 renderer.setClearColor(0x050505);host.appendChild(renderer.domElement);
 const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(38,1,.1,50);camera.position.z=10;
 const memory=new MemoryField(CONFIG.memoryResolution,CONFIG.memoryHalfLife,CONFIG.memoryResidue);
 const texture=new THREE.DataTexture(memory.data,memory.size,memory.size,THREE.RGBAFormat);texture.minFilter=texture.magFilter=THREE.LinearFilter;texture.needsUpdate=true;
 const sound = new SoundInput();
 const soundButton = document.querySelector('#sound'), soundStatus = document.querySelector('#sound-status');
 soundButton.onclick = async () => {
  if(sound.active){sound.stop();soundButton.textContent="Enable sound";soundButton.setAttribute("aria-pressed","false");soundStatus.textContent="";return;}
  soundButton.disabled=true;soundStatus.textContent="Allow microphone access to let the sculpture listen.";
  try {await sound.start();soundButton.textContent="Sound on";soundButton.setAttribute("aria-pressed","true");soundStatus.textContent="Listening · audio stays on your device";}
  catch(error){soundStatus.textContent=error.name==="NotAllowedError"?"Microphone access was declined. Enable it in browser settings to try again.":"Microphone unavailable. Check your input device and try again.";}
  finally{soundButton.disabled=false;}
 };
 window.addEventListener("pagehide",()=>sound.stop());
 const uniforms={uAudio:{value:new THREE.Vector3()},uTime:{value:0},uDisturbance:{value:0},uStillness:{value:0},uPresence:{value:0},uPointer:{value:new THREE.Vector3(99,99,0)},uMemory:{value:texture},uMemoryStrength:{value:CONFIG.memoryStrength},uRadius:{value:CONFIG.interactionRadius},uPixelRatio:{value:1}};
 const sculpture=createSculpture(uniforms,matchMedia('(max-width: 700px)').matches);scene.add(sculpture);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let lastInteraction=performance.now()/1000, previous=lastInteraction, disturbance=0, speed=0, lastPointerTime=0, hasPointer=false, pendingDeposit=0, elapsed=0, exhibition=false;
 const pointer=new THREE.Vector2(), oldPointer=new THREE.Vector2(), ray=new THREE.Raycaster(), plane=new THREE.Plane(new THREE.Vector3(0,0,1),0), hit=new THREE.Vector3();
 function resize(){const w=innerWidth,h=innerHeight;renderer.setPixelRatio(Math.min(devicePixelRatio,CONFIG.pixelRatioCap));renderer.setSize(w,h);camera.aspect=w/h;camera.position.z=Math.max(10,8.2/(2*Math.tan(19*Math.PI/180)*(w/h)));camera.updateProjectionMatrix();uniforms.uPixelRatio.value=renderer.getPixelRatio();sculpture.position.x=w/h>1.2?.6:0;}
 window.addEventListener('resize',resize);resize();
 function interact(event){
  const now=performance.now()/1000;pointer.set(event.clientX/innerWidth*2-1,1-event.clientY/innerHeight*2);
  ray.setFromCamera(pointer,camera);ray.ray.intersectPlane(plane,hit);sculpture.updateMatrixWorld();sculpture.worldToLocal(hit);uniforms.uPointer.value.copy(hit);
  const dt=now-lastPointerTime;
  const velocity=hasPointer&&dt<.25?pointer.distanceTo(oldPointer)/Math.max(.008,dt):0;
  speed=Math.min(6,velocity);disturbance=Math.min(1,disturbance+Math.max(0,speed-.85)*Math.min(dt,.05)*.65*CONFIG.sensitivity);
  pendingDeposit+=Math.min(.05,dt)*(.08+speed*.14)*CONFIG.sensitivity;
  hasPointer=true;oldPointer.copy(pointer);lastPointerTime=now;lastInteraction=now;
 }
 host.addEventListener('pointermove',interact);host.addEventListener('pointerdown',e=>{hasPointer=false;interact(e);if(e.pointerType==='touch')host.setPointerCapture(e.pointerId);});
 host.addEventListener('pointerleave',()=>{hasPointer=false;});host.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')hasPointer=false;});host.addEventListener('pointercancel',()=>{hasPointer=false;});
 const intro=document.querySelector('#intro');let hintTimer=setTimeout(()=>intro.classList.add('faded'),11000);
 document.querySelector('#guide').onclick=()=>{intro.classList.remove('faded');clearTimeout(hintTimer);hintTimer=setTimeout(()=>intro.classList.add('faded'),8000);};
 function reset(){memory.reset();texture.needsUpdate=true;disturbance=0;pendingDeposit=0;hasPointer=false;speed=0;elapsed=0;uniforms.uPresence.value=0;uniforms.uStillness.value=0;lastInteraction=performance.now()/1000;}
 function toggleText(){exhibition=!exhibition;document.body.classList.toggle('exhibition',exhibition);document.querySelector('#exhibition').setAttribute('aria-pressed',String(exhibition));}
 document.querySelector('#reset').onclick=reset;document.querySelector('#exhibition').onclick=toggleText;
 window.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;if(e.key.toLowerCase()==='r')reset();if(e.key.toLowerCase()==='h'||(e.key==='Escape'&&exhibition))toggleText();});
 // Double-tap a quiet corner to restore text on touch-only exhibition displays.
 let lastTap=0;host.addEventListener('pointerdown',e=>{if(exhibition&&e.clientX>innerWidth-90&&e.clientY>innerHeight-90){const now=performance.now();if(now-lastTap<400)toggleText();lastTap=now;}});
 let running=true;
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();running=false;const el=document.querySelector('#error');el.hidden=false;el.textContent='The graphics context was interrupted. Reload to resume the sculpture.';});
 document.addEventListener('visibilitychange',()=>{previous=performance.now()/1000;hasPointer=false;});
 function frame(nowMs){requestAnimationFrame(frame);if(document.hidden||!running)return;const now=nowMs/1000,dt=Math.min(.05,Math.max(0,now-previous));previous=now;elapsed+=dt*CONFIG.motionSpeed*(reduced?.25:1);
  const levels=sound.update(dt,CONFIG.audioSensitivity);
  uniforms.uAudio.value.fromArray(levels).multiplyScalar(CONFIG.audioMotion*(reduced?.35:1));
  if(!sound.active&&soundButton.getAttribute("aria-pressed")==="true"){soundButton.textContent="Enable sound";soundButton.setAttribute("aria-pressed","false");soundStatus.textContent="Microphone disconnected.";}
  const idle=now-lastInteraction;
  // Resistance holds briefly, then softens; the field's sediment never resets itself.
  disturbance=Math.max(0,disturbance-dt*(idle>CONFIG.recoveryDelay?.095:.012));
  uniforms.uDisturbance.value=disturbance;
  const presence=hasPointer?Math.exp(-Math.max(0,now-lastPointerTime-.15)*1.4):0;
  uniforms.uPresence.value+=(presence-uniforms.uPresence.value)*(1-Math.exp(-dt*4));
  if(pendingDeposit>0){memory.deposit(hit.x,hit.y,Math.min(.15,pendingDeposit));pendingDeposit=0;}
  memory.update(dt);texture.needsUpdate=true;
  // One fleeting emergence after 15 seconds, then only once every 48 quiet seconds.
  const phase=(idle-CONFIG.stillnessDelay)%48;
  const still=idle>CONFIG.stillnessDelay&&phase<9?Math.sin(Math.PI*phase/9)**2:0;
  uniforms.uStillness.value=still;uniforms.uTime.value=elapsed;
  sculpture.rotation.y=-.2+Math.sin(elapsed*.22)*.16;sculpture.rotation.x=.18+Math.sin(elapsed*.31)*.06;
  renderer.render(scene,camera);
 }
 requestAnimationFrame(frame);
}
