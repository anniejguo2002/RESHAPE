import * as THREE from 'three';
import { CONFIG, seededRandom } from './config.js';
import { vertex, fragment, lineVertex, lineFragment } from './shaders.js';

// An open, lopsided folded manifold, not a spherical distribution.
// Curled lips and saddle-shaped negative space make its silhouette legible.
export function surface(u, v, fuzz = 0) {
  const a = u * Math.PI * 2;
  const width = .66 + .2 * Math.sin(a * 2 + .7);
  const r = 1.5 + v * width + .22 * Math.cos(3*a + v);
  return [
    r * Math.cos(a) * 1.34 + .38*Math.sin(2*a) + .3*v*v,
    r * Math.sin(a) * .93 + .38*Math.cos(a*2+.8) + v*.26,
    .62*Math.sin(a*2-.5) + v*.9*Math.sin(a*1.5+.8) + .25*Math.cos(v*3+a) + fuzz,
  ];
}
export function createSculpture(uniforms, mobile) {
  const random = seededRandom(CONFIG.seed);
  const count = mobile ? CONFIG.mobileParticleCount : CONFIG.particleCount;
  const positions = [], params = [], sizes = [];
  for (let i=0;i<count;i++) {
    const u=random(), raw=random()*2-1;
    // More grains in the lips, thin translucent membranes between them.
    const v = i%3 === 0 ? Math.sign(raw)*Math.pow(Math.abs(raw),.35) : raw;
    const fuzz=(random()-.5)*.065 + (i%17===0 ? (random()-.5)*.3 : 0);
    positions.push(...surface(u,v,fuzz));params.push(u,v,random());sizes.push(.65+Math.pow(random(),3)*1.25);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('aParam',new THREE.Float32BufferAttribute(params,3));
  geometry.setAttribute('aSize',new THREE.Float32BufferAttribute(sizes,1));
  const settings={uniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending};
  const points = new THREE.Points(geometry,new THREE.ShaderMaterial({...settings,vertexShader:vertex,fragmentShader:fragment}));
  const lp=[], la=[];
  for(let j=0;j<CONFIG.filamentCount;j++) {
    const v=(j/(CONFIG.filamentCount-1))*2-1;
    const start=random()*.13, end=.78+random()*.22;
    for(let k=0;k<CONFIG.filamentSegments;k++) {
      for(const u of [start+(end-start)*k/CONFIG.filamentSegments,start+(end-start)*(k+1)/CONFIG.filamentSegments]) {
        lp.push(...surface(u,v));la.push(u,v,.3+.7*Math.abs(v));
      }
    }
  }
  const lines=new THREE.BufferGeometry();lines.setAttribute('position',new THREE.Float32BufferAttribute(lp,3));lines.setAttribute('aParam',new THREE.Float32BufferAttribute(la,3));
  const group=new THREE.Group();group.add(points,new THREE.LineSegments(lines,new THREE.ShaderMaterial({...settings,vertexShader:lineVertex,fragmentShader:lineFragment})));
  group.rotation.set(.18,-.2,-.27);
  return group;
}
