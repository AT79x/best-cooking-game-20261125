// Warung Nasi Goreng — tiny synthesised sounds. Everything is an oscillator or
// a short noise buffer through WebAudio, so the game ships no sound files and
// makes no network request. Silent until the first user gesture.
export class Sfx {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.sizzleNodes = null;
  }

  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      return;
    }
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.ctx = new AudioContext();
    } catch {
      this.ctx = null;
    }
  }

  tone(freq, seconds, type = 'sine', gain = 0.08) {
    if (!this.ctx || this.muted) return;
    try {
      const osc = this.ctx.createOscillator();
      const amp = this.ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      amp.gain.setValueAtTime(gain, this.ctx.currentTime);
      amp.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + seconds);
      osc.connect(amp);
      amp.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + seconds);
    } catch {
      // Sound is garnish: a failure here never stops the game.
    }
  }

  noise(seconds, gain = 0.05) {
    if (!this.ctx || this.muted) return null;
    try {
      const length = Math.floor(this.ctx.sampleRate * seconds);
      const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      const amp = this.ctx.createGain();
      amp.gain.value = gain;
      source.connect(amp);
      amp.connect(this.ctx.destination);
      source.start();
      return source;
    } catch {
      return null;
    }
  }

  play(name) {
    this.ensure();
    if (!this.ctx) return;
    if (name === 'pick') this.tone(520, 0.08, 'triangle', 0.06);
    else if (name === 'ding') {
      this.tone(880, 0.12, 'sine', 0.08);
      setTimeout(() => this.tone(1318, 0.18, 'sine', 0.06), 90);
    } else if (name === 'buzz') this.tone(140, 0.2, 'sawtooth', 0.05);
    else if (name === 'sizzle') this.noise(0.5, 0.05);
    else if (name === 'leave') this.tone(220, 0.25, 'sawtooth', 0.05);
  }
}
