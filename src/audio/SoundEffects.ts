/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true; // Default muted per specification
  private masterGain: GainNode | null = null;

  constructor() {
    try {
      const saved = localStorage.getItem('jelly_jungle_muted');
      if (saved !== null) {
        this.isMuted = saved === 'true';
      } else {
        this.isMuted = true;
      }
    } catch {
      this.isMuted = true;
    }
  }

  private initCtx() {
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtxClass) {
          this.ctx = new AudioCtxClass();
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.value = this.isMuted ? 0 : 0.35;
          this.masterGain.connect(this.ctx.destination);
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {}
  }

  public setMuted(muted: boolean) {
    try {
      this.isMuted = muted;
      localStorage.setItem('jelly_jungle_muted', muted ? 'true' : 'false');
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(muted ? 0 : 0.35, this.ctx.currentTime);
      }
    } catch {}
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    if (!this.isMuted) {
      this.playJump(1);
    }
    return this.isMuted;
  }

  public playJump(jumpIndex: number) {
    try {
      if (this.isMuted) return;
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = jumpIndex === 1 ? 320 : jumpIndex === 2 ? 440 : 580;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.linearRampToValueAtTime(baseFreq * 1.8, t + 0.12);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.linearRampToValueAtTime(0.0001, t + 0.16);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.18);
    } catch {}
  }


  public playSpringBounce() {
    try {
      if (this.isMuted) return;
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, t);
      osc.frequency.linearRampToValueAtTime(740, t + 0.22);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(520, t);
      osc2.frequency.linearRampToValueAtTime(1480, t + 0.22);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.linearRampToValueAtTime(0.0001, t + 0.34);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc2.start(t);
      osc.stop(t + 0.35);
      osc2.stop(t + 0.35);
    } catch {}
  }

  // Crystal / coin sparkle collect with 100% safe try-catch & linear ramps
  public playCrystalCollect() {
    try {
      if (this.isMuted) return;
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const t = this.ctx.currentTime;
      const notes = [659.25, 830.61, 987.77, 1318.51]; // E5, G#5, B5, E6
      notes.forEach((freq, i) => {
        try {
          if (!this.ctx || !this.masterGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t + i * 0.04);

          gain.gain.setValueAtTime(0.18, t + i * 0.04);
          gain.gain.linearRampToValueAtTime(0.0001, t + i * 0.04 + 0.16);

          osc.connect(gain);
          gain.connect(this.masterGain);

          osc.start(t + i * 0.04);
          osc.stop(t + i * 0.04 + 0.18);
        } catch {}
      });
    } catch {}
  }

  public playCheckpoint() {
    try {
      if (this.isMuted) return;
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const t = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, i) => {
        try {
          if (!this.ctx || !this.masterGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t + i * 0.07);

          gain.gain.setValueAtTime(0.22, t + i * 0.07);
          gain.gain.linearRampToValueAtTime(0.0001, t + i * 0.07 + 0.3);

          osc.connect(gain);
          gain.connect(this.masterGain);

          osc.start(t + i * 0.07);
          osc.stop(t + i * 0.07 + 0.32);
        } catch {}
      });
    } catch {}
  }

  public playBonk() {
    try {
      if (this.isMuted) return;
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.linearRampToValueAtTime(80, t + 0.15);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.linearRampToValueAtTime(0.0001, t + 0.18);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.2);
    } catch {}
  }

  public playLand() {
    try {
      if (this.isMuted) return;
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.linearRampToValueAtTime(60, t + 0.09);

      gain.gain.setValueAtTime(0.16, t);
      gain.gain.linearRampToValueAtTime(0.0001, t + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.12);
    } catch {}
  }

  public playVictory() {
    try {
      if (this.isMuted) return;
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const t = this.ctx.currentTime;
      const chord = [523.25, 659.25, 783.99, 1046.50];
      chord.forEach((freq, idx) => {
        try {
          if (!this.ctx || !this.masterGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t + idx * 0.1);
          osc.frequency.linearRampToValueAtTime(freq * 1.05, t + idx * 0.1 + 0.6);

          gain.gain.setValueAtTime(0.22, t + idx * 0.1);
          gain.gain.linearRampToValueAtTime(0.0001, t + idx * 0.1 + 0.75);

          osc.connect(gain);
          gain.connect(this.masterGain);

          osc.start(t + idx * 0.1);
          osc.stop(t + idx * 0.1 + 0.8);
        } catch {}
      });
    } catch {}
  }
}

export const sounds = new SoundManager();
