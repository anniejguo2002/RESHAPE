// Shared deformation keeps luminous grains and contour filaments on one surface.
export const deformation = /* glsl */`
uniform float uTime, uDisturbance, uStillness, uPresence, uMemoryStrength, uRadius;
uniform vec3 uPointer;
uniform vec3 uAudio;
uniform sampler2D uMemory;
attribute vec3 aParam;
float field(vec2 p) { return texture2D(uMemory, clamp(p / 12.0 + .5, .001, .999)).r; }
vec3 deform(vec3 base, vec3 param) {
  float t = uTime;
  vec3 p = base;
  // Breathing is spatially coherent: the folds have their own slow autonomy.
  p.x += .13*sin(p.y*1.3+t*.7) + .065*cos(p.z*2.0+t);
  p.y += .12*sin(p.x*1.2-t*.6);
  p.z += .23*sin(p.x*.9+p.y*.7+t*.8);
  float m = field(base.xy);
  vec2 grad = vec2(field(base.xy+vec2(.22,0.))-field(base.xy-vec2(.22,0.)), field(base.xy+vec2(0.,.22))-field(base.xy-vec2(0.,.22)));
  // Memory dents, shears, and opens local folds even with no pointer present.
  p.xy += (grad*1.7 + vec2(.21*sin(base.y*2.), -.25))*m*uMemoryStrength;
  p.z += m*uMemoryStrength*(.8+.5*sin(base.x*2.1+base.y));
  vec2 delta = p.xy-uPointer.xy;
  float d = length(delta);
  float near = exp(-d*d/(uRadius*uRadius));
  float resistance = smoothstep(.16,.72,uDisturbance);
  vec2 direction = delta / max(d,.08);
  p.xy += mix(-delta*.44, direction*(.7+param.z*.8),resistance)*near*uPresence;
  p.z += near*uPresence*(.35 + resistance*sin(param.x*39.+t*4.)*.5);
  // Agitation separates neighboring threads into ragged, independently moving bands.
  float fracture = uDisturbance*uDisturbance;
  p += fracture*vec3(sin(param.y*61.+t*2.8),cos(param.y*43.-t*2.),sin(param.x*35.+t*3.))* (.13+.29*param.z);
  // A patient observer sees the folds unfurl into a quiet, coherent pleated veil.
  p.x += uStillness*.24*sin(param.x*6.283+param.y*3.);
  p.y += uStillness*.47*sin(param.x*3.14159);
  p.z = mix(p.z, p.z*.4 + .52*sin(param.x*6.283+param.y*7.),uStillness*.75);
  // Bass opens the folds, mids send waves along their length, highs tremble at the lips.
  // Sound twists entire folds as well as displacing individual grains.
  float twist = uAudio.y*.16*sin(param.x*6.283+t*2.) + uAudio.x*.08;
  p.xy = mat2(cos(twist),-sin(twist),sin(twist),cos(twist))*p.xy;
  p.xy *= 1.0 + uAudio.x*.14;
  p.z += uAudio.x*.5*sin(param.x*6.283+param.y*2.);
  p.y += uAudio.y*.3*sin(param.x*18.85-t*5.+param.y*3.);
  p.z += uAudio.y*.28*cos(param.x*12.56+t*4.);
  p += uAudio.z*.035*vec3(sin(param.x*110.+t*12.),cos(param.y*51.-t*9.),sin(param.x*87.+param.y*13.+t*10.));
  return p;
}
`;
export const vertex = /* glsl */`
${deformation}
uniform float uPixelRatio;
attribute float aSize;
varying float vLight;
void main(){
 vec3 p = deform(position,aParam);
 vec4 mv = modelViewMatrix*vec4(p,1.);
 gl_Position = projectionMatrix*mv;
 gl_PointSize = clamp(aSize*uPixelRatio*(8.0/-mv.z),.7,4.0);
 vLight = (.32+.68*aParam.z)*(1.0+uStillness*.45+uAudio.x*.25+uAudio.z*.2)*clamp(1.1+p.z*.18,.3,1.4);
}`;
export const fragment = /* glsl */`
varying float vLight;
void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;float a=exp(-r*r*15.)*smoothstep(.5,.32,r);gl_FragColor=vec4(vec3(.88,.92,.96),a*vLight*1.1);}`;
export const lineVertex = /* glsl */`
${deformation}
varying float vAlpha;
void main(){vec3 p=deform(position,aParam);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);vAlpha=(.055+.095*aParam.z)*(1.+uStillness*1.4)*(1.-uDisturbance*.45);}`;
export const lineFragment = `varying float vAlpha;void main(){gl_FragColor=vec4(.83,.88,.94,vAlpha);}`;
