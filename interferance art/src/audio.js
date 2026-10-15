// Microphone samples stay in memory on this device. No recording or playback.
export class SoundInput {
  constructor() { this.levels = [0, 0, 0]; this.active = false; }
  async start() {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Microphone requires localhost or HTTPS.');
    try {
      this.context = new AudioContext();
      await this.context.resume();
      this.stream = await navigator.mediaDevices.getUserMedia({audio: {echoCancellation: false, noiseSuppression: false, autoGainControl: false}});
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = .88;
      this.source = this.context.createMediaStreamSource(this.stream);
      this.source.connect(this.analyser); // Never connect microphone to speakers.
      this.bins = new Uint8Array(this.analyser.frequencyBinCount);
      this.active = true;
      this.stream.getAudioTracks()[0].onended = () => this.stop();
    } catch (error) { this.stop(); throw error; }
  }
  stop() {
    this.active = false;
    this.stream?.getTracks().forEach(track => { track.onended = null; track.stop(); });
    this.source?.disconnect();
    this.context?.close().catch(() => {});
    this.stream = this.source = this.context = this.analyser = null;
  }
  update(dt, sensitivity) {
    const targets = [0, 0, 0];
    if (this.active) {
      this.analyser.getByteFrequencyData(this.bins);
      const hzPerBin = this.context.sampleRate / this.analyser.fftSize;
      [[50,250],[250,2000],[2000,9000]].forEach(([low, high], band) => {
        const first = Math.max(1, Math.floor(low/hzPerBin));
        const last = Math.min(this.bins.length-1, Math.ceil(high/hzPerBin));
        let energy = 0;
        for (let i=first;i<=last;i++) energy += (this.bins[i]/255)**2;
        targets[band] = Math.min(1, Math.max(0, Math.sqrt(energy/Math.max(1,last-first+1))-.07)*sensitivity);
      });
    }
    // Slow attack and a lingering release turn individual beats into gentle swells.
    this.levels.forEach((level,i) => {
      this.levels[i] += (targets[i]-level)*(1-Math.exp(-dt*(targets[i]>level?2.4:1.5)));
    });
    return this.levels;
  }
}
