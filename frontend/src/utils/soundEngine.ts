export class StationerySoundEngine {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = false;
  private lastScribbleTime: number = 0;

  constructor() {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.isEnabled = localStorage.getItem('chores_sound_enabled') === 'true';
    }
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('chores_sound_enabled', enabled ? 'true' : 'false');
    }
    if (enabled && !this.ctx) {
      this.initContext();
    }
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx && !this.ctx) {
      try {
        this.ctx = new AudioCtx();
      } catch {
        this.ctx = null;
      }
    }
    return this.ctx;
  }

  private getContext(): AudioContext | null {
    if (!this.isEnabled) return null;
    const ctx = this.ctx || this.initContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  public triggerHaptic(pattern: number | number[]): void {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Gracefully ignore vibration errors
      }
    }
  }

  /**
   * Resonant Rubber Stamp Impact Synthesis.
   * Produces a ~65Hz sub-bass desk thud and ~1.6kHz rubber snap with ±5% procedural pitch jitter.
   */
  public playStampSound(velocity: number = 1.0): void {
    // Haptic trigger for stamps
    this.triggerHaptic([20, 40, 30]);

    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const safeVelocity = Math.min(1.8, Math.max(0.4, velocity));

      // 65Hz Sub-bass thud (desk resonance)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(65, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.09);

      const targetGain = 0.45 * safeVelocity;
      oscGain.gain.setValueAtTime(targetGain, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);

      // Rubber snap click with ±5% procedural pitch jitter
      const bufferSize = Math.floor(ctx.sampleRate * 0.03);
      if (bufferSize > 0) {
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        // 1.6kHz center with ±5% procedural jitter
        const jitter = 1 + (Math.random() * 0.1 - 0.05);
        filter.frequency.value = 1600 * jitter;

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.3 * safeVelocity, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        noise.start(now);
      }
    } catch {
      // Gracefully ignore audio synthesis errors
    }
  }

  /**
   * 3D Page Turn Paper Rustle Synthesis.
   * Sweeps bandpass filter from 900Hz to 2200Hz.
   */
  public playPageFlipSound(): void {
    this.triggerHaptic([10, 15, 10]);

    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 0.15;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      if (bufferSize <= 0) return;

      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.linearRampToValueAtTime(2200, now + duration);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
    } catch {
      // Gracefully ignore audio synthesis errors
    }
  }

  /**
   * Pencil Scribble Scratch Synthesis.
   * Modulates highpass filter cutoff and attack decay on rapid repetitions.
   */
  public playPencilScribbleSound(velocity: number = 1.0): void {
    this.triggerHaptic([12]);

    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const nowMs = Date.now();
      const isRapid = nowMs - this.lastScribbleTime < 400;
      this.lastScribbleTime = nowMs;

      const pulseDuration = isRapid ? 0.035 : 0.04;
      const pulseCount = 3;
      const safeVelocity = Math.min(1.8, Math.max(0.4, velocity));

      for (let p = 0; p < pulseCount; p++) {
        const startTime = now + p * (isRapid ? 0.038 : 0.045);
        const bufferSize = Math.floor(ctx.sampleRate * pulseDuration);
        if (bufferSize <= 0) continue;

        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        const variation = isRapid ? 300 : 0;
        filter.frequency.value = 3200 + p * 200 + variation;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15 * safeVelocity, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + pulseDuration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start(startTime);
        noise.stop(startTime + pulseDuration);
      }
    } catch {
      // Gracefully ignore audio synthesis errors
    }
  }

  /**
   * Washi Tape Peel Sound Synthesis.
   * Sweeps bandpass filter from 1800Hz to 3600Hz.
   */
  public playTapePeelSound(): void {
    this.triggerHaptic([12]);

    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 0.12;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      if (bufferSize <= 0) return;

      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.frequency.linearRampToValueAtTime(3600, now + duration);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
    } catch {
      // Gracefully ignore audio synthesis errors
    }
  }

  /**
   * Soft Eraser Rubber Friction Synthesis.
   * Synthesizes tactile soft eraser rubber friction on paper using the Web Audio API.
   */
  public playEraserSound(velocity: number = 1.0): void {
    this.triggerHaptic([8, 12]);

    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 0.09;
      const safeVelocity = Math.min(1.8, Math.max(0.4, velocity));
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      if (bufferSize <= 0) return;

      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const env = Math.sin((i / bufferSize) * Math.PI);
        data[i] = (Math.random() * 2 - 1) * env;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(850, now);
      filter.frequency.linearRampToValueAtTime(1400, now + duration);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.18 * safeVelocity, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + duration);
    } catch {
      // Gracefully ignore audio synthesis errors
    }
  }
}

export const soundEngine = new StationerySoundEngine();
export default soundEngine;
