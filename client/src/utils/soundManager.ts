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
}

export const soundManager = new SoundManager();
