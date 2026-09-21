// ============================================================
//  soundManager.ts — Marvel Splendor High-Fidelity Web Audio SFX
// ============================================================
//  Ultra-crisp, zero-latency procedural sound synthesis for all
//  Marvel Splendor game interactions (Stones, Cards, Turns, Clicks).
// ============================================================

import type { CrystalColor } from '@shared/types/game.types';

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted: boolean = false;
  private volume: number = 0.75;
  private listeners: Set<(muted: boolean) => void> = new Set();

  constructor() {
    // Load persisted mute preference
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('splendor_sfx_muted');
      if (savedMute !== null) {
        this.muted = savedMute === 'true';
      }
      const savedVol = localStorage.getItem('splendor_sfx_volume');
      if (savedVol !== null) {
        const parsed = parseFloat(savedVol);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          this.volume = parsed;
        }
      }

      // Auto unlock audio context on first user touch / pointer down
      const unlockAudio = () => {
        this.initContext();
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };

      window.addEventListener('pointerdown', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true });
    }
  }

  private initContext(): boolean {
    if (typeof window === 'undefined') return false;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return false;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return true;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('splendor_sfx_muted', String(this.muted));
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
    }
    this.listeners.forEach((listener) => listener(this.muted));
    if (!this.muted) {
      this.playButtonClick();
    }
    return this.muted;
  }

  public subscribe(callback: (muted: boolean) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (typeof window !== 'undefined') {
      localStorage.setItem('splendor_sfx_volume', String(this.volume));
    }
    if (this.masterGain && this.ctx && !this.muted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  // ────────────────────────────────────────────────────────────
  //  Procedural Sound Generators
  // ────────────────────────────────────────────────────────────

  /**
   * 1. Gem / Infinity Stone Click (Crisp crystalline chime with randomized micro-detune)
   */
  public playGemClick(color?: CrystalColor): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Harmonic frequency table mapped to Infinity Stone colors
    const baseFreqs: Record<string, number> = {
      topaz: 1046.5,     // Mind (Yellow) - High bright bell (C6)
      sapphire: 880.0,    // Space (Blue) - Pure crystalline A5
      obsidian: 698.46,   // Soul (Orange) - Warm F5
      amethyst: 783.99,   // Power (Purple) - Resonant G5
      ruby: 587.33,       // Reality (Red) - Punchy D5
      emerald: 1174.66,   // Time (Green) - Radiant D6
      gold: 932.33,       // S.H.I.E.L.D. - Metallic Bb5
    };

    const freq = (color && baseFreqs[color]) ? baseFreqs[color] : 880;
    // Micro-detune between -15 and +15 cents for organic glass coin clatter
    const detune = (Math.random() - 0.5) * 30;

    // Primary crystal chime oscillator
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);
    osc1.detune.setValueAtTime(detune, now);

    // Subtle 2nd harmonic for glass brilliance
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2.02, now);
    osc2.detune.setValueAtTime(detune, now);

    // Highpass transient for tactile snap
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(400, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.003); // Quick 3ms attack
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16); // 160ms decay

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(filter);
    filter.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.18);
    osc2.stop(now + 0.18);
  }

  /**
   * 2. Gem Deselect / Remove
   */
  public playGemDeselect(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(550, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.09);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * 3. Gem Collection Success (Triumphant 3-note ascending arpeggio chord)
   */
  public playGemCollect(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // C5, E5, G5, C6 arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const noteTime = now + idx * 0.045;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.22, noteTime + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.22);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.24);
    });
  }

  /**
   * 4. Marvel Hero Recruited / Card Purchased (Heroic power chord fanfare)
   */
  public playCardBuy(tier: number = 1): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Cinematic Marvel brassy fanfare chords
    // Tier 1: Bright Eb Major triad (Eb4, G4, Bb4, Eb5)
    // Tier 2: Regal F Major chord with brass filter
    // Tier 3: Epic Cosmic Ab Major chord with sub-bass punch
    const chords: Record<number, number[]> = {
      1: [311.13, 392.00, 466.16, 622.25],
      2: [349.23, 440.00, 523.25, 698.46, 880.00],
      3: [207.65, 311.13, 415.30, 519.12, 622.25, 830.61],
    };

    const notes = chords[tier] || chords[1];
    const duration = tier === 3 ? 0.75 : tier === 2 ? 0.55 : 0.42;

    notes.forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Sawtooth + lowpass gives an authentic cinematic brass/synth horn feel
      osc.type = i === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.015);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(3200, now + 0.12);
      filter.frequency.exponentialRampToValueAtTime(1000, now + duration);

      const noteGain = tier === 3 ? 0.25 : 0.2;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(noteGain, now + 0.02 + i * 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + i * 0.015);
      osc.stop(now + duration + 0.05);
    });

    // Sub-bass impact for Tier 2 and Tier 3
    if (tier >= 2) {
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(tier === 3 ? 90 : 120, now);
      subOsc.frequency.exponentialRampToValueAtTime(40, now + 0.25);

      subGain.gain.setValueAtTime(0.3, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);

      subOsc.start(now);
      subOsc.stop(now + 0.32);
    }
  }

  /**
   * 5. Card Reserve (Sci-fi holographic latch / magnetic lock)
   */
  public playCardReserve(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Fast tech laser sweep
    const sweep = this.ctx.createOscillator();
    const sweepGain = this.ctx.createGain();
    sweep.type = 'sine';
    sweep.frequency.setValueAtTime(950, now);
    sweep.frequency.exponentialRampToValueAtTime(260, now + 0.09);

    sweepGain.gain.setValueAtTime(0.001, now);
    sweepGain.gain.linearRampToValueAtTime(0.25, now + 0.005);
    sweepGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

    sweep.connect(sweepGain);
    sweepGain.connect(this.masterGain);

    sweep.start(now);
    sweep.stop(now + 0.11);

    // Mechanical lock click at the end of the sweep
    const click = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    click.type = 'square';
    click.frequency.setValueAtTime(1400, now + 0.07);

    clickGain.gain.setValueAtTime(0.001, now + 0.07);
    clickGain.gain.linearRampToValueAtTime(0.18, now + 0.075);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);

    click.connect(clickGain);
    clickGain.connect(this.masterGain);

    click.start(now + 0.07);
    click.stop(now + 0.14);
  }

  /**
   * 6. Tactical UI Button Tap (Crisp modern smartphone haptic pop)
   */
  public playButtonClick(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.035);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(600, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * 7. Turn Start Notification ("YOUR TURN" beacon alert chime)
   */
  public playTurnAlert(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Two-tone attention beacon (E5 -> B5)
    const tones = [
      { freq: 659.25, time: now, dur: 0.18 },
      { freq: 987.77, time: now + 0.12, dur: 0.35 },
    ];

    tones.forEach(({ freq, time, dur }) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.28, time + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + dur + 0.02);
    });
  }

  /**
   * 8. Modal Open (Futuristic holographic panel slide open)
   */
  public playModalOpen(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.14);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.linearRampToValueAtTime(2400, now + 0.14);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  /**
   * 9. Modal Close (Holographic panel slide closed)
   */
  public playModalClose(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(680, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.12);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * 10. Gauntlet Stone Socketed (Cosmic resonance lock)
   */
  public playGauntletSocket(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now);
    osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.2);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1318.5, now + 0.05);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now + 0.05);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  }

  /**
   * 11. Victory / Game Over Win (Triumphant cosmic orchestral fanfare)
   */
  public playVictory(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const fanfareNotes = [
      { freq: 440.00, delay: 0.00, dur: 0.18 }, // A4
      { freq: 554.37, delay: 0.12, dur: 0.18 }, // C#5
      { freq: 659.25, delay: 0.24, dur: 0.22 }, // E5
      { freq: 880.00, delay: 0.38, dur: 0.65 }, // A5 (Apex)
      { freq: 1108.73, delay: 0.52, dur: 0.85 }, // C#6 (Glorious resolution)
    ];

    fanfareNotes.forEach(({ freq, delay, dur }) => {
      if (!this.ctx || !this.masterGain) return;
      const noteTime = now + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.3, noteTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + dur);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + dur + 0.05);
    });
  }

  /**
   * 12. Error / Invalid Action (Soft muffled double-thud)
   */
  public playError(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    [now, now + 0.09].forEach((time) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, time);
      osc.frequency.exponentialRampToValueAtTime(90, time + 0.07);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.2, time + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.075);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + 0.08);
    });
  }

  // ────────────────────────────────────────────────────────────
  //  Audio Synthesis DSP Utilities
  // ────────────────────────────────────────────────────────────

  /**
   * Generates a non-linear sigmoid/tanh distortion curve for authentic electric arc saturation
   */
  private makeDistortionCurve(amount: number = 20, samples: number = 1024): Float32Array {
    const curve = new Float32Array(samples);
    const norm = Math.tanh(amount);
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = Math.tanh(amount * x) / (norm || 1);
    }
    return curve;
  }

  /**
   * Generates brown/brownian noise (-6dB/octave) for deep atmospheric thunder and seismic rumbles
   */
  private createBrownNoiseBuffer(durationSeconds: number): AudioBuffer | null {
    if (!this.ctx) return null;
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = Math.floor(sampleRate * durationSeconds);
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5;
    }
    return buffer;
  }

  /**
   * Generates pink noise (-3dB/octave) for high-energy electrical and laser discharge wash
   */
  private createPinkNoiseBuffer(durationSeconds: number): AudioBuffer | null {
    if (!this.ctx) return null;
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = Math.floor(sampleRate * durationSeconds);
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  // ────────────────────────────────────────────────────────────
  //  Hero Signature Sound Effects (Major Characters)
  // ────────────────────────────────────────────────────────────

  /**
   * 13. Thor & Storm — 4-Stage Cinematic Thunderclap & Lightning Strike
   * Stage 1: Pre-discharge ionization / stepped leader spark crackles (0-35ms)
   * Stage 2: Supersonic lightning whip-crack with overdrive saturation (35-180ms)
   * Stage 3: Sub-bass shockwave detonation (35-650ms, 240Hz down to 32Hz)
   * Stage 4: Cavernous rolling thunder tail with multi-stage swells (50ms - 2400ms)
   */
  public playHeroThunder(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const distortionCurve = this.makeDistortionCurve(22);

    // ── STAGE 1: Pre-Discharge Ionization & Stepped Leaders (0ms - 35ms) ──
    const sparkTimes = [now, now + 0.012, now + 0.024];
    sparkTimes.forEach((st, idx) => {
      const sparkOsc = ctx.createOscillator();
      const sparkGain = ctx.createGain();
      const sparkFilter = ctx.createBiquadFilter();

      sparkOsc.type = 'sawtooth';
      sparkOsc.frequency.setValueAtTime(3200 + idx * 700, st);
      sparkOsc.frequency.exponentialRampToValueAtTime(800, st + 0.015);

      sparkFilter.type = 'highpass';
      sparkFilter.frequency.setValueAtTime(2500, st);

      sparkGain.gain.setValueAtTime(0.001, st);
      sparkGain.gain.linearRampToValueAtTime(0.24, st + 0.002);
      sparkGain.gain.exponentialRampToValueAtTime(0.0001, st + 0.018);

      sparkOsc.connect(sparkFilter);
      sparkFilter.connect(sparkGain);
      sparkGain.connect(this.masterGain!);

      sparkOsc.start(st);
      sparkOsc.stop(st + 0.02);
    });

    // ── STAGE 2: Supersonic Lightning Shockwave Crack (35ms - 180ms) ──
    const strikeTime = now + 0.035;

    // A. Overdriven primary lightning bolt transient
    const boltOsc = ctx.createOscillator();
    const boltGain = ctx.createGain();
    const boltFilter = ctx.createBiquadFilter();
    const boltShaper = ctx.createWaveShaper();

    boltShaper.curve = distortionCurve as any;
    boltShaper.oversample = '2x';

    boltOsc.type = 'sawtooth';
    boltOsc.frequency.setValueAtTime(3600, strikeTime);
    boltOsc.frequency.exponentialRampToValueAtTime(65, strikeTime + 0.06);

    boltFilter.type = 'lowpass';
    boltFilter.frequency.setValueAtTime(4500, strikeTime);
    boltFilter.frequency.exponentialRampToValueAtTime(400, strikeTime + 0.12);
    boltFilter.Q.setValueAtTime(3.2, strikeTime);

    boltGain.gain.setValueAtTime(0.001, strikeTime);
    boltGain.gain.linearRampToValueAtTime(0.72, strikeTime + 0.004);
    boltGain.gain.exponentialRampToValueAtTime(0.001, strikeTime + 0.16);

    boltOsc.connect(boltShaper);
    boltShaper.connect(boltFilter);
    boltFilter.connect(boltGain);
    boltGain.connect(this.masterGain);

    boltOsc.start(strikeTime);
    boltOsc.stop(strikeTime + 0.18);

    // B. Explosive white noise whip-crack
    const crackBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.18), ctx.sampleRate);
    const crackData = crackBuffer.getChannelData(0);
    for (let i = 0; i < crackData.length; i++) {
      crackData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (crackData.length * 0.2));
    }
    const crackNoise = ctx.createBufferSource();
    crackNoise.buffer = crackBuffer;

    const crackFilter = ctx.createBiquadFilter();
    crackFilter.type = 'bandpass';
    crackFilter.frequency.setValueAtTime(2400, strikeTime);
    crackFilter.frequency.exponentialRampToValueAtTime(600, strikeTime + 0.14);
    crackFilter.Q.setValueAtTime(2.8, strikeTime);

    const crackGain = ctx.createGain();
    crackGain.gain.setValueAtTime(0.001, strikeTime);
    crackGain.gain.linearRampToValueAtTime(0.55, strikeTime + 0.003);
    crackGain.gain.exponentialRampToValueAtTime(0.0001, strikeTime + 0.17);

    crackNoise.connect(crackFilter);
    crackFilter.connect(crackGain);
    crackGain.connect(this.masterGain);

    crackNoise.start(strikeTime);

    // ── STAGE 3: Sub-Bass Detonation & Chest Punch (35ms - 650ms) ──
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();

    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(240, strikeTime);
    subOsc.frequency.exponentialRampToValueAtTime(34, strikeTime + 0.14);
    subOsc.frequency.linearRampToValueAtTime(28, strikeTime + 0.6);

    subGain.gain.setValueAtTime(0.001, strikeTime);
    subGain.gain.linearRampToValueAtTime(0.8, strikeTime + 0.015);
    subGain.gain.exponentialRampToValueAtTime(0.0001, strikeTime + 0.65);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);

    subOsc.start(strikeTime);
    subOsc.stop(strikeTime + 0.7);

    // ── STAGE 4: Cavernous Rolling Thunder Tail (50ms - 2400ms) ──
    const brownBuffer = this.createBrownNoiseBuffer(2.4);
    if (brownBuffer) {
      const thunderSource = ctx.createBufferSource();
      thunderSource.buffer = brownBuffer;

      const rumbleLowpass = ctx.createBiquadFilter();
      rumbleLowpass.type = 'lowpass';
      rumbleLowpass.frequency.setValueAtTime(140, strikeTime);
      rumbleLowpass.frequency.linearRampToValueAtTime(85, strikeTime + 2.2);
      rumbleLowpass.Q.setValueAtTime(2.5, strikeTime);

      const cloudResonance = ctx.createBiquadFilter();
      cloudResonance.type = 'bandpass';
      cloudResonance.frequency.setValueAtTime(180, strikeTime);
      cloudResonance.frequency.exponentialRampToValueAtTime(90, strikeTime + 1.2);
      cloudResonance.frequency.linearRampToValueAtTime(55, strikeTime + 2.2);
      cloudResonance.Q.setValueAtTime(3.0, strikeTime);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(5.5, strikeTime);
      lfoGain.gain.setValueAtTime(0.15, strikeTime);

      const thunderGain = ctx.createGain();
      thunderGain.gain.setValueAtTime(0.001, strikeTime);
      thunderGain.gain.linearRampToValueAtTime(0.65, strikeTime + 0.08);
      thunderGain.gain.exponentialRampToValueAtTime(0.42, strikeTime + 0.45);
      thunderGain.gain.linearRampToValueAtTime(0.38, strikeTime + 0.85);
      thunderGain.gain.exponentialRampToValueAtTime(0.18, strikeTime + 1.45);
      thunderGain.gain.exponentialRampToValueAtTime(0.0001, strikeTime + 2.35);

      lfo.connect(thunderGain.gain);
      thunderSource.connect(rumbleLowpass);
      rumbleLowpass.connect(cloudResonance);
      cloudResonance.connect(thunderGain);
      thunderGain.connect(this.masterGain);

      lfo.start(strikeTime);
      thunderSource.start(strikeTime);
      lfo.stop(strikeTime + 2.4);
      thunderSource.stop(strikeTime + 2.4);
    }
  }

  /**
   * 14. Iron Man — Tech Repulsor Arc Reactor Charge & Plasma Blast
   */
  public playHeroRepulsor(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const distortion = this.makeDistortionCurve(16);

    // 1. High-pitched Arc Reactor capacitor charging whine
    const chargeOsc = ctx.createOscillator();
    const chargeGain = ctx.createGain();
    const chargeVibrato = ctx.createOscillator();
    const chargeVibratoGain = ctx.createGain();

    chargeVibrato.frequency.setValueAtTime(18, now);
    chargeVibratoGain.gain.setValueAtTime(45, now);
    chargeVibrato.connect(chargeOsc.frequency);

    chargeOsc.type = 'sine';
    chargeOsc.frequency.setValueAtTime(420, now);
    chargeOsc.frequency.exponentialRampToValueAtTime(3600, now + 0.18);

    chargeGain.gain.setValueAtTime(0.001, now);
    chargeGain.gain.linearRampToValueAtTime(0.32, now + 0.16);
    chargeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);

    chargeOsc.connect(chargeGain);
    chargeGain.connect(this.masterGain);

    chargeVibrato.start(now);
    chargeOsc.start(now);
    chargeVibrato.stop(now + 0.2);
    chargeOsc.stop(now + 0.2);

    // 2. Concussive plasma blast discharge
    const blastTime = now + 0.18;
    const blastOsc = ctx.createOscillator();
    const blastGain = ctx.createGain();
    const blastFilter = ctx.createBiquadFilter();
    const blastShaper = ctx.createWaveShaper();

    blastShaper.curve = distortion as any;
    blastOsc.type = 'sawtooth';
    blastOsc.frequency.setValueAtTime(2600, blastTime);
    blastOsc.frequency.exponentialRampToValueAtTime(80, blastTime + 0.25);

    blastFilter.type = 'lowpass';
    blastFilter.frequency.setValueAtTime(4200, blastTime);
    blastFilter.frequency.exponentialRampToValueAtTime(280, blastTime + 0.28);

    blastGain.gain.setValueAtTime(0.001, blastTime);
    blastGain.gain.linearRampToValueAtTime(0.65, blastTime + 0.008);
    blastGain.gain.exponentialRampToValueAtTime(0.0001, blastTime + 0.38);

    blastOsc.connect(blastShaper);
    blastShaper.connect(blastFilter);
    blastFilter.connect(blastGain);
    blastGain.connect(this.masterGain);

    blastOsc.start(blastTime);
    blastOsc.stop(blastTime + 0.4);

    // 3. Sub-bass kinetic kick
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(200, blastTime);
    subOsc.frequency.exponentialRampToValueAtTime(36, blastTime + 0.22);

    subGain.gain.setValueAtTime(0.001, blastTime);
    subGain.gain.linearRampToValueAtTime(0.55, blastTime + 0.012);
    subGain.gain.exponentialRampToValueAtTime(0.0001, blastTime + 0.3);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(blastTime);
    subOsc.stop(blastTime + 0.32);

    // 4. Robotic mechanical lock / servo click
    const clickTime = blastTime + 0.26;
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'square';
    clickOsc.frequency.setValueAtTime(1600, clickTime);
    clickOsc.frequency.exponentialRampToValueAtTime(900, clickTime + 0.035);

    clickGain.gain.setValueAtTime(0.001, clickTime);
    clickGain.gain.linearRampToValueAtTime(0.2, clickTime + 0.002);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, clickTime + 0.04);

    clickOsc.connect(clickGain);
    clickGain.connect(this.masterGain);
    clickOsc.start(clickTime);
    clickOsc.stop(clickTime + 0.05);
  }

  /**
   * 15. Captain America — Vibranium Shield Ricochet & Crystalline Bell Ring
   */
  public playHeroShieldClang(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // 1. Heavy blunt kinetic impact thud
    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.type = 'triangle';
    thud.frequency.setValueAtTime(260, now);
    thud.frequency.exponentialRampToValueAtTime(45, now + 0.1);

    thudGain.gain.setValueAtTime(0.001, now);
    thudGain.gain.linearRampToValueAtTime(0.5, now + 0.004);
    thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    thud.connect(thudGain);
    thudGain.connect(this.masterGain);
    thud.start(now);
    thud.stop(now + 0.13);

    // 2. Pure Vibranium inharmonic metallic partials
    const partials = [
      { freq: 1180, dur: 1.6, gain: 0.35, type: 'sine' as OscillatorType },
      { freq: 1780, dur: 1.3, gain: 0.28, type: 'triangle' as OscillatorType },
      { freq: 2360, dur: 1.0, gain: 0.22, type: 'sine' as OscillatorType },
      { freq: 3550, dur: 0.8, gain: 0.16, type: 'sine' as OscillatorType },
      { freq: 5320, dur: 0.5, gain: 0.10, type: 'sine' as OscillatorType },
    ];

    partials.forEach((p) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = p.type;
      osc.frequency.setValueAtTime(p.freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(p.gain, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + p.dur);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + p.dur + 0.05);
    });
  }

  /**
   * 16. Hulk & She-Hulk — Gamma Ground Smash & Earthquake Shockwave
   */
  public playHeroSmash(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const distortion = this.makeDistortionCurve(25);

    // 1. Concussive seismic sub-bass drop
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    const subShaper = ctx.createWaveShaper();
    subShaper.curve = distortion as any;

    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(300, now);
    subOsc.frequency.exponentialRampToValueAtTime(26, now + 0.5);

    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.linearRampToValueAtTime(0.85, now + 0.015);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

    subOsc.connect(subShaper);
    subShaper.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(now);
    subOsc.stop(now + 0.75);

    // 2. Concrete/earth crunch noise impact
    const crunchBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.35), ctx.sampleRate);
    const crunchData = crunchBuffer.getChannelData(0);
    for (let i = 0; i < crunchData.length; i++) {
      crunchData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (crunchData.length * 0.15));
    }
    const crunchNoise = ctx.createBufferSource();
    crunchNoise.buffer = crunchBuffer;

    const crunchFilter = ctx.createBiquadFilter();
    crunchFilter.type = 'lowpass';
    crunchFilter.frequency.setValueAtTime(650, now);
    crunchFilter.frequency.exponentialRampToValueAtTime(100, now + 0.3);

    const crunchGain = ctx.createGain();
    crunchGain.gain.setValueAtTime(0.001, now);
    crunchGain.gain.linearRampToValueAtTime(0.65, now + 0.005);
    crunchGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

    crunchNoise.connect(crunchFilter);
    crunchFilter.connect(crunchGain);
    crunchGain.connect(this.masterGain);
    crunchNoise.start(now);

    // 3. Ground tremor rumble aftershock (1.6s)
    const brownBuffer = this.createBrownNoiseBuffer(1.6);
    if (brownBuffer) {
      const rumbleSource = ctx.createBufferSource();
      rumbleSource.buffer = brownBuffer;

      const rumbleFilter = ctx.createBiquadFilter();
      rumbleFilter.type = 'lowpass';
      rumbleFilter.frequency.setValueAtTime(95, now);
      rumbleFilter.frequency.linearRampToValueAtTime(45, now + 1.5);

      const rumbleGain = ctx.createGain();
      rumbleGain.gain.setValueAtTime(0.001, now + 0.05);
      rumbleGain.gain.linearRampToValueAtTime(0.5, now + 0.15);
      rumbleGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.55);

      rumbleSource.connect(rumbleFilter);
      rumbleFilter.connect(rumbleGain);
      rumbleGain.connect(this.masterGain);

      rumbleSource.start(now + 0.05);
      rumbleSource.stop(now + 1.6);
    }
  }

  /**
   * 17. Doctor Strange — Mystic Eldritch Mandala & Astral Shimmer
   */
  public playHeroMystic(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Sacred geometric mandala bell arpeggio (Kamar-Taj pentatonic)
    const mandalaPitches = [370.0, 466.16, 554.37, 739.99, 830.61, 1108.73, 1479.98];
    mandalaPitches.forEach((freq, idx) => {
      const noteTime = now + idx * 0.045;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, noteTime);
      osc1.detune.setValueAtTime(-6, noteTime);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2.01, noteTime);
      osc2.detune.setValueAtTime(6, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.24, noteTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.65);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain!);

      osc1.start(noteTime);
      osc2.start(noteTime);
      osc1.stop(noteTime + 0.7);
      osc2.stop(noteTime + 0.7);
    });

    // Deep cosmic dimensional drone
    const droneOsc = ctx.createOscillator();
    const droneGain = ctx.createGain();
    droneOsc.type = 'sine';
    droneOsc.frequency.setValueAtTime(108, now);
    droneOsc.frequency.linearRampToValueAtTime(72, now + 0.8);

    droneGain.gain.setValueAtTime(0.001, now);
    droneGain.gain.linearRampToValueAtTime(0.35, now + 0.08);
    droneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

    droneOsc.connect(droneGain);
    droneGain.connect(this.masterGain);
    droneOsc.start(now);
    droneOsc.stop(now + 0.95);
  }

  /**
   * 18. Spider-Man & Miles Morales — Web Shooter "Thwip" Pop & Tensile Zip
   */
  public playHeroWeb(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // 1. Mechanical valve trigger click
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'sine';
    clickOsc.frequency.setValueAtTime(2800, now);
    clickOsc.frequency.exponentialRampToValueAtTime(320, now + 0.025);

    clickGain.gain.setValueAtTime(0.001, now);
    clickGain.gain.linearRampToValueAtTime(0.4, now + 0.001);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

    clickOsc.connect(clickGain);
    clickGain.connect(this.masterGain);
    clickOsc.start(now);
    clickOsc.stop(now + 0.035);

    // 2. High-pressure pneumatic "THWIP" gas pop
    const popBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.08), ctx.sampleRate);
    const popData = popBuffer.getChannelData(0);
    for (let i = 0; i < popData.length; i++) {
      popData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (popData.length * 0.1));
    }
    const popNoise = ctx.createBufferSource();
    popNoise.buffer = popBuffer;

    const popFilter = ctx.createBiquadFilter();
    popFilter.type = 'bandpass';
    popFilter.frequency.setValueAtTime(3200, now + 0.005);
    popFilter.frequency.exponentialRampToValueAtTime(800, now + 0.06);

    const popGain = ctx.createGain();
    popGain.gain.setValueAtTime(0.001, now + 0.005);
    popGain.gain.linearRampToValueAtTime(0.5, now + 0.008);
    popGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

    popNoise.connect(popFilter);
    popFilter.connect(popGain);
    popGain.connect(this.masterGain);
    popNoise.start(now + 0.005);

    // 3. Tensile elastic web zip
    const zipOsc = ctx.createOscillator();
    const zipGain = ctx.createGain();
    zipOsc.type = 'triangle';
    zipOsc.frequency.setValueAtTime(2100, now + 0.015);
    zipOsc.frequency.exponentialRampToValueAtTime(380, now + 0.22);

    zipGain.gain.setValueAtTime(0.001, now + 0.015);
    zipGain.gain.linearRampToValueAtTime(0.35, now + 0.03);
    zipGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

    zipOsc.connect(zipGain);
    zipGain.connect(this.masterGain);
    zipOsc.start(now + 0.015);
    zipOsc.stop(now + 0.26);
  }

  /**
   * 19. Black Panther — Vibranium Kinetic Shockwave Pulse
   */
  public playHeroVibranium(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // 1. Kinetic energy accumulation rising hum
    const charge = ctx.createOscillator();
    const chargeGain = ctx.createGain();
    charge.type = 'sine';
    charge.frequency.setValueAtTime(70, now);
    charge.frequency.exponentialRampToValueAtTime(190, now + 0.12);

    chargeGain.gain.setValueAtTime(0.001, now);
    chargeGain.gain.linearRampToValueAtTime(0.4, now + 0.1);
    chargeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    charge.connect(chargeGain);
    chargeGain.connect(this.masterGain);
    charge.start(now);
    charge.stop(now + 0.15);

    // 2. Kinetic explosive discharge pulse
    const pulseTime = now + 0.12;
    const pulseOsc = ctx.createOscillator();
    const pulseGain = ctx.createGain();
    pulseOsc.type = 'triangle';
    pulseOsc.frequency.setValueAtTime(170, pulseTime);
    pulseOsc.frequency.exponentialRampToValueAtTime(38, pulseTime + 0.4);

    pulseGain.gain.setValueAtTime(0.001, pulseTime);
    pulseGain.gain.linearRampToValueAtTime(0.65, pulseTime + 0.01);
    pulseGain.gain.exponentialRampToValueAtTime(0.0001, pulseTime + 0.45);

    pulseOsc.connect(pulseGain);
    pulseGain.connect(this.masterGain);
    pulseOsc.start(pulseTime);
    pulseOsc.stop(pulseTime + 0.5);

    // 3. Vibranium metallic shimmer ring
    const ring = ctx.createOscillator();
    const ringGain = ctx.createGain();
    ring.type = 'sine';
    ring.frequency.setValueAtTime(1450, pulseTime);
    ring.frequency.exponentialRampToValueAtTime(980, pulseTime + 0.35);

    ringGain.gain.setValueAtTime(0.001, pulseTime);
    ringGain.gain.linearRampToValueAtTime(0.25, pulseTime + 0.005);
    ringGain.gain.exponentialRampToValueAtTime(0.0001, pulseTime + 0.4);

    ring.connect(ringGain);
    ringGain.connect(this.masterGain);
    ring.start(pulseTime);
    ring.stop(pulseTime + 0.45);
  }

  /**
   * 20. Thanos & Galactus — Infinity Gauntlet Cosmic Snap & Harmony
   */
  public playHeroSnap(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // 1. Crisp physical gauntlet finger snap
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(3800, now);
    snapOsc.frequency.exponentialRampToValueAtTime(450, now + 0.03);

    snapGain.gain.setValueAtTime(0.001, now);
    snapGain.gain.linearRampToValueAtTime(0.65, now + 0.001);
    snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    snapOsc.connect(snapGain);
    snapGain.connect(this.masterGain);
    snapOsc.start(now);
    snapOsc.stop(now + 0.045);

    // 2. Cosmic chords of the 6 Infinity Stones
    const stonePitches = [
      587.33,  // Reality (Red)
      698.46,  // Soul (Orange)
      783.99,  // Power (Purple)
      880.00,  // Space (Blue)
      1046.50, // Mind (Yellow)
      1174.66, // Time (Green)
    ];

    stonePitches.forEach((freq, i) => {
      const stoneTime = now + 0.02 + i * 0.02;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, stoneTime);
      // Cosmic reality warp plunge
      osc.frequency.exponentialRampToValueAtTime(freq * 0.35, stoneTime + 0.7);

      gain.gain.setValueAtTime(0.001, stoneTime);
      gain.gain.linearRampToValueAtTime(0.2, stoneTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, stoneTime + 0.75);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(stoneTime);
      osc.stop(stoneTime + 0.8);
    });

    // 3. Deep cosmic void vacuum hum
    const voidOsc = ctx.createOscillator();
    const voidGain = ctx.createGain();
    voidOsc.type = 'sine';
    voidOsc.frequency.setValueAtTime(110, now + 0.03);
    voidOsc.frequency.exponentialRampToValueAtTime(30, now + 0.9);

    voidGain.gain.setValueAtTime(0.001, now + 0.03);
    voidGain.gain.linearRampToValueAtTime(0.55, now + 0.08);
    voidGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);

    voidOsc.connect(voidGain);
    voidGain.connect(this.masterGain);
    voidOsc.start(now + 0.03);
    voidOsc.stop(now + 1.0);
  }

  /**
   * 21. Scarlet Witch — Reality-Warping Chaos Hex Surge
   */
  public playHeroChaos(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Dissonant minor second chaos cluster (Eb5 & E5) with slow flanging
    const freqs = [622.25, 659.25, 932.33, 1244.5];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.linearRampToValueAtTime(f * 1.15, now + 0.35);
      osc.frequency.exponentialRampToValueAtTime(f * 0.7, now + 0.8);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(450, now + 0.8);
      filter.Q.setValueAtTime(4.0, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.26, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + 0.9);
    });

    // Deep reality-distortion sub pulse
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'triangle';
    sub.frequency.setValueAtTime(140, now);
    sub.frequency.exponentialRampToValueAtTime(40, now + 0.5);

    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.linearRampToValueAtTime(0.45, now + 0.03);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    sub.connect(subGain);
    subGain.connect(this.masterGain);
    sub.start(now);
    sub.stop(now + 0.6);
  }

  /**
   * 22. Captain Marvel — Supersonic Cosmic Photon Blast
   */
  public playHeroPhoton(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const distortion = this.makeDistortionCurve(18);

    // Stellar power charge
    const ascOsc = ctx.createOscillator();
    const ascGain = ctx.createGain();
    ascOsc.type = 'sine';
    ascOsc.frequency.setValueAtTime(500, now);
    ascOsc.frequency.exponentialRampToValueAtTime(2800, now + 0.14);

    ascGain.gain.setValueAtTime(0.001, now);
    ascGain.gain.linearRampToValueAtTime(0.3, now + 0.12);
    ascGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    ascOsc.connect(ascGain);
    ascGain.connect(this.masterGain);
    ascOsc.start(now);
    ascOsc.stop(now + 0.16);

    // Photon blast detonation
    const blastTime = now + 0.14;
    const blast = ctx.createOscillator();
    const blastGain = ctx.createGain();
    const blastShaper = ctx.createWaveShaper();
    blastShaper.curve = distortion as any;

    blast.type = 'sawtooth';
    blast.frequency.setValueAtTime(2400, blastTime);
    blast.frequency.exponentialRampToValueAtTime(90, blastTime + 0.28);

    blastGain.gain.setValueAtTime(0.001, blastTime);
    blastGain.gain.linearRampToValueAtTime(0.7, blastTime + 0.01);
    blastGain.gain.exponentialRampToValueAtTime(0.0001, blastTime + 0.45);

    blast.connect(blastShaper);
    blastShaper.connect(blastGain);
    blastGain.connect(this.masterGain);
    blast.start(blastTime);
    blast.stop(blastTime + 0.5);

    // Stellar plasma beam pink noise wash
    const pinkBuffer = this.createPinkNoiseBuffer(0.35);
    if (pinkBuffer) {
      const beamSource = ctx.createBufferSource();
      beamSource.buffer = pinkBuffer;

      const beamFilter = ctx.createBiquadFilter();
      beamFilter.type = 'bandpass';
      beamFilter.frequency.setValueAtTime(3200, blastTime);
      beamFilter.frequency.exponentialRampToValueAtTime(600, blastTime + 0.3);

      const beamGain = ctx.createGain();
      beamGain.gain.setValueAtTime(0.001, blastTime);
      beamGain.gain.linearRampToValueAtTime(0.4, blastTime + 0.015);
      beamGain.gain.exponentialRampToValueAtTime(0.0001, blastTime + 0.35);

      beamSource.connect(beamFilter);
      beamFilter.connect(beamGain);
      beamGain.connect(this.masterGain);

      beamSource.start(blastTime);
      beamSource.stop(blastTime + 0.36);
    }
  }

  /**
   * 23. Hawkeye — High-Tension Bowstring Twang & Pinpoint Arrow Hit
   */
  public playHeroArrow(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Bowstring release twang
    const twang = ctx.createOscillator();
    const twangGain = ctx.createGain();
    twang.type = 'triangle';
    twang.frequency.setValueAtTime(480, now);
    twang.frequency.exponentialRampToValueAtTime(160, now + 0.08);

    twangGain.gain.setValueAtTime(0.001, now);
    twangGain.gain.linearRampToValueAtTime(0.5, now + 0.003);
    twangGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

    twang.connect(twangGain);
    twangGain.connect(this.masterGain);
    twang.start(now);
    twang.stop(now + 0.11);

    // Supersonic arrow whistle
    const whistle = ctx.createOscillator();
    const whistleGain = ctx.createGain();
    whistle.type = 'sine';
    whistle.frequency.setValueAtTime(2200, now + 0.03);
    whistle.frequency.exponentialRampToValueAtTime(1400, now + 0.15);

    whistleGain.gain.setValueAtTime(0.001, now + 0.03);
    whistleGain.gain.linearRampToValueAtTime(0.25, now + 0.06);
    whistleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

    whistle.connect(whistleGain);
    whistleGain.connect(this.masterGain);
    whistle.start(now + 0.03);
    whistle.stop(now + 0.17);

    // Pinpoint bullseye impact thud
    const impactTime = now + 0.15;
    const impact = ctx.createOscillator();
    const impactGain = ctx.createGain();
    impact.type = 'sine';
    impact.frequency.setValueAtTime(320, impactTime);
    impact.frequency.exponentialRampToValueAtTime(80, impactTime + 0.08);

    impactGain.gain.setValueAtTime(0.001, impactTime);
    impactGain.gain.linearRampToValueAtTime(0.6, impactTime + 0.002);
    impactGain.gain.exponentialRampToValueAtTime(0.0001, impactTime + 0.09);

    impact.connect(impactGain);
    impactGain.connect(this.masterGain);
    impact.start(impactTime);
    impact.stop(impactTime + 0.1);
  }

  /**
   * 24. Loki — Illusory Emerald Magic Chime & Deceptive Whisper
   */
  public playHeroLoki(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Ethereal descending mystery chime (Minor chord with pitch drift)
    const lokiNotes = [1174.66, 987.77, 880.0, 698.46, 587.33];
    lokiNotes.forEach((freq, idx) => {
      const noteTime = now + idx * 0.05;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);
      // Illusory detuning drift
      osc.frequency.linearRampToValueAtTime(freq * 0.96, noteTime + 0.4);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.25, noteTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(noteTime);
      osc.stop(noteTime + 0.55);
    });
  }

  /**
   * 25. Deadpool — Dual Katana Blade Clash & Pistol Pop
   */
  public playHeroDeadpool(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Katana blade clash "SHING"
    const freqs = [1850, 2900, 4400];
    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now);
      osc.stop(now + 0.45);
    });

    // Pistol slide rack & pop at t+0.12s
    const popTime = now + 0.12;
    const popOsc = ctx.createOscillator();
    const popGain = ctx.createGain();
    popOsc.type = 'square';
    popOsc.frequency.setValueAtTime(800, popTime);
    popOsc.frequency.exponentialRampToValueAtTime(90, popTime + 0.06);

    popGain.gain.setValueAtTime(0.001, popTime);
    popGain.gain.linearRampToValueAtTime(0.4, popTime + 0.002);
    popGain.gain.exponentialRampToValueAtTime(0.0001, popTime + 0.07);

    popOsc.connect(popGain);
    popGain.connect(this.masterGain);
    popOsc.start(popTime);
    popOsc.stop(popTime + 0.08);
  }

  /**
   * 26. Black Widow — Widow's Bite Electroshock Gauntlet Discharge
   */
  public playHeroWidow(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // High-voltage taser buzz (140Hz square wave with frequency jitter)
    const taser = ctx.createOscillator();
    const taserGain = ctx.createGain();
    taser.type = 'square';
    taser.frequency.setValueAtTime(140, now);

    taserGain.gain.setValueAtTime(0.001, now);
    taserGain.gain.linearRampToValueAtTime(0.45, now + 0.005);
    taserGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    taser.connect(taserGain);
    taserGain.connect(this.masterGain);
    taser.start(now);
    taser.stop(now + 0.25);

    // High-frequency electro-snap whip
    const whip = ctx.createOscillator();
    const whipGain = ctx.createGain();
    whip.type = 'sawtooth';
    whip.frequency.setValueAtTime(3200, now);
    whip.frequency.exponentialRampToValueAtTime(400, now + 0.08);

    whipGain.gain.setValueAtTime(0.001, now);
    whipGain.gain.linearRampToValueAtTime(0.35, now + 0.002);
    whipGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

    whip.connect(whipGain);
    whipGain.connect(this.masterGain);
    whip.start(now);
    whip.stop(now + 0.12);
  }

  /**
   * 27. Wolverine — Adamantium Claw Unsheathe & Metallic Slash
   */
  public playHeroClaw(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // 3 rapid staggered claw snicks (0ms, 25ms, 50ms)
    [0, 0.025, 0.05].forEach((offset, idx) => {
      const t = now + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(2200 + idx * 400, t);
      osc.frequency.exponentialRampToValueAtTime(900, t + 0.04);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + 0.07);
    });

    // Metallic slash resonance
    const slash = ctx.createOscillator();
    const slashGain = ctx.createGain();
    slash.type = 'triangle';
    slash.frequency.setValueAtTime(3400, now + 0.05);
    slash.frequency.exponentialRampToValueAtTime(600, now + 0.35);

    slashGain.gain.setValueAtTime(0.001, now + 0.05);
    slashGain.gain.linearRampToValueAtTime(0.35, now + 0.06);
    slashGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    slash.connect(slashGain);
    slashGain.connect(this.masterGain);
    slash.start(now + 0.05);
    slash.stop(now + 0.45);
  }
}

export const soundManager = new SoundManager();
