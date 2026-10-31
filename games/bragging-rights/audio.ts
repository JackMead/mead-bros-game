/** A handful of synthesised sounds. No files. The game must play fine with these muted. */

export type SoundName = 'step' | 'hit' | 'hurt' | 'pickup' | 'page' | 'stairs' | 'lose';

export class Sound {
  muted = false;
  private ctx: AudioContext | null = null;

  /** Browsers only allow audio after a user gesture, so call this from one. */
  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctor) this.ctx = new Ctor();
  }

  play(name: SoundName): void {
    if (this.muted || !this.ctx) return;
    switch (name) {
      case 'step':
        this.tone(180, 0.05, 'triangle', 0.05, 140);
        break;
      case 'hit':
        this.noise(0.08, 1800, 0.18);
        this.tone(140, 0.08, 'square', 0.06, 70);
        break;
      case 'hurt':
        this.tone(220, 0.25, 'sawtooth', 0.12, 60);
        this.noise(0.15, 600, 0.2);
        break;
      case 'pickup':
        this.tone(880, 0.08, 'sine', 0.1);
        this.tone(1320, 0.12, 'sine', 0.08, undefined, 0.07);
        break;
      case 'page':
        this.noise(0.3, 3000, 0.12, 400);
        this.tone(520, 0.25, 'sine', 0.06, 1040);
        break;
      case 'stairs':
        [392, 494, 587, 784].forEach((f, i) => this.tone(f, 0.16, 'triangle', 0.08, undefined, i * 0.08));
        break;
      case 'lose':
        [392, 330, 262, 196].forEach((f, i) => this.tone(f, 0.25, 'triangle', 0.09, undefined, i * 0.14));
        break;
    }
  }

  private tone(freq: number, dur: number, type: OscillatorType, gain: number, slideTo?: number, delay = 0): void {
    const ctx = this.ctx!;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  private noise(dur: number, cutoff: number, gain: number, sweepTo?: number): void {
    const ctx = this.ctx!;
    const t0 = ctx.currentTime;
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let n = 12345;
    for (let i = 0; i < data.length; i++) {
      n = (n * 1103515245 + 12345) & 0x7fffffff;
      data[i] = (n / 0x7fffffff) * 2 - 1;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, t0);
    if (sweepTo) filter.frequency.exponentialRampToValueAtTime(sweepTo, t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter).connect(g).connect(ctx.destination);
    src.start(t0);
  }
}
