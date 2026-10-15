// A low-resolution world-space field. Transient deformation fades, but a bounded
// sediment remains for the entire visit. No positions are accumulated/drifted.
export class MemoryField {
  constructor(size, halfLife, residue) {
    this.size = size; this.halfLife = halfLife; this.residue = residue;
    this.transient = new Float32Array(size * size);
    this.sediment = new Float32Array(size * size);
    this.data = new Uint8Array(size * size * 4);
  }
  deposit(x, y, amount) {
    const n = this.size, gx = (x / 12 + .5) * (n - 1), gy = (y / 12 + .5) * (n - 1);
    for (let j = Math.max(0, Math.floor(gy - 4)); j <= Math.min(n - 1, Math.ceil(gy + 4)); j++) {
      for (let i = Math.max(0, Math.floor(gx - 4)); i <= Math.min(n - 1, Math.ceil(gx + 4)); i++) {
        const k = j * n + i, w = Math.exp(-((i-gx)**2 + (j-gy)**2) / 4) * amount;
        this.transient[k] = Math.min(1, this.transient[k] + w);
        this.sediment[k] = Math.min(.6, this.sediment[k] + w * this.residue);
      }
    }
  }
  update(dt) {
    const decay = Math.pow(.5, dt / this.halfLife);
    for (let i = 0; i < this.transient.length; i++) {
      this.transient[i] *= decay;
      const v = Math.min(1, this.transient[i] + this.sediment[i]);
      this.data[i*4] = Math.round(v * 255); this.data[i*4+3] = 255;
    }
  }
  reset() { this.transient.fill(0); this.sediment.fill(0); this.data.fill(0); }
}
