// Central artistic controls. Memory is session-local; R restores the seeded form.
export const CONFIG = {
  seed: 73421,
  particleCount: 100000,
  mobileParticleCount: 55000,
  filamentCount: 180,
  filamentSegments: 150,
  pixelRatioCap: 1.7,
  motionSpeed: 0.24,
  sensitivity: 1.0,
  audioSensitivity: 2.2, // microphone gain for low / mid / high frequency envelopes
  audioMotion: 1.05, // strength of sound-driven folding
  interactionRadius: 0.95,
  memoryResolution: 48,
  memoryHalfLife: 180, // seconds; permanent residue is stored separately
  memoryResidue: 0.23,
  memoryStrength: 0.78,
  recoveryDelay: 5,
  stillnessDelay: 15,
};
export function seededRandom(seed) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
