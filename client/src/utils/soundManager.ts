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
  private lastSliderTickTime: number = 0;
  private lastSliderScore: number = -1;

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
   * 1. Infinity Stone Pick — Physical crystalline mineral acoustic resonance
   *    Layer 1: Precision felt-tip striker transient (highpass micro-burst, 2ms)
   *    Layer 2: Pure acoustic sine bell tuned to stone frequency (decay 380ms)
   *    Layer 3: Inharmonic glass overtone partial (2.756x) with high damping (110ms)
   *    Layer 4: Damped mineral body resonance (130Hz - 180Hz) providing physical weight
   */
  public playGemClick(color?: CrystalColor): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Harmonic tuning tuned to real acoustic bells (C6 down to D5)
    const stoneConfig: Record<string, { freq: number; bodyFreq: number }> = {
      topaz:    { freq: 1046.50, bodyFreq: 180 }, // Mind (C6) — pure celesta
      sapphire: { freq: 880.00,  bodyFreq: 160 }, // Space (A5) — ethereal quartz
      obsidian: { freq: 659.25,  bodyFreq: 140 }, // Soul (E5) — warm singing bowl
      amethyst: { freq: 783.99,  bodyFreq: 150 }, // Power (G5) — regal bell
      ruby:     { freq: 587.33,  bodyFreq: 130 }, // Reality (D5) — punchy ruby
      emerald:  { freq: 1174.66, bodyFreq: 190 }, // Time (D6) — radiant crystal
      gold:     { freq: 987.77,  bodyFreq: 170 }, // S.H.I.E.L.D. (B5) — brushed titanium
    };
    const cfg = (color && stoneConfig[color]) ? stoneConfig[color] : { freq: 880, bodyFreq: 160 };
    const freq = cfg.freq;

    // ── Layer 1: Striker Transient (Felt Mallet on Crystal) ──
    const strike = ctx.createOscillator();
    const strikeGain = ctx.createGain();
    const strikeFilter = ctx.createBiquadFilter();
    strike.type = 'triangle';
    strike.frequency.setValueAtTime(freq * 3.4, now);
    strike.frequency.exponentialRampToValueAtTime(freq * 1.2, now + 0.006);
    strikeFilter.type = 'bandpass';
    strikeFilter.frequency.setValueAtTime(3200, now);
    strikeFilter.Q.setValueAtTime(2.5, now);
    strikeGain.gain.setValueAtTime(0.0001, now);
    strikeGain.gain.linearRampToValueAtTime(0.18, now + 0.001);
    strikeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.008);
    strike.connect(strikeFilter);
    strikeFilter.connect(strikeGain);
    strikeGain.connect(this.masterGain);
    strike.start(now);
    strike.stop(now + 0.012);

    // ── Layer 2: Fundamental Crystalline Resonance ──
    const bell = ctx.createOscillator();
    const bellGain = ctx.createGain();
    bell.type = 'sine';
    bell.frequency.setValueAtTime(freq, now);
    bellGain.gain.setValueAtTime(0.0001, now);
    bellGain.gain.linearRampToValueAtTime(0.32, now + 0.003);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
    bell.connect(bellGain);
    bellGain.connect(this.masterGain);
    bell.start(now);
    bell.stop(now + 0.42);

    // ── Layer 3: Inharmonic Glass Overtone (2.756x) ──
    const glass = ctx.createOscillator();
    const glassGain = ctx.createGain();
    glass.type = 'sine';
    glass.frequency.setValueAtTime(freq * 2.756, now);
    glassGain.gain.setValueAtTime(0.0001, now);
    glassGain.gain.linearRampToValueAtTime(0.12, now + 0.002);
    glassGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    glass.connect(glassGain);
    glassGain.connect(this.masterGain);
    glass.start(now);
    glass.stop(now + 0.16);

    // ── Layer 4: Physical Mineral Weight Body ──
    const body = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    body.type = 'sine';
    body.frequency.setValueAtTime(cfg.bodyFreq, now);
    body.frequency.exponentialRampToValueAtTime(cfg.bodyFreq * 0.6, now + 0.04);
    bodyGain.gain.setValueAtTime(0.0001, now);
    bodyGain.gain.linearRampToValueAtTime(0.14, now + 0.002);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    body.connect(bodyGain);
    bodyGain.connect(this.masterGain);
    body.start(now);
    body.stop(now + 0.06);
  }

  /**
   * 2. Gem Deselect — Gentle acoustic velvet lift & felt magnetic release
   *    (Eliminated cartoonish slide whistle LFO; replaced with tactile felt release)
   */
  public playGemDeselect(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Layer 1: Soft felt body breath (160Hz -> 75Hz)
    const felt = ctx.createOscillator();
    const feltGain = ctx.createGain();
    felt.type = 'sine';
    felt.frequency.setValueAtTime(160, now);
    felt.frequency.exponentialRampToValueAtTime(75, now + 0.05);
    feltGain.gain.setValueAtTime(0.0001, now);
    feltGain.gain.linearRampToValueAtTime(0.16, now + 0.002);
    feltGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
    felt.connect(feltGain);
    feltGain.connect(this.masterGain);
    felt.start(now);
    felt.stop(now + 0.07);

    // Layer 2: Subtle magnetic separation transient (bandpass click, 1800Hz)
    const release = ctx.createOscillator();
    const releaseGain = ctx.createGain();
    const releaseFilter = ctx.createBiquadFilter();
    release.type = 'triangle';
    release.frequency.setValueAtTime(1800, now);
    release.frequency.exponentialRampToValueAtTime(600, now + 0.012);
    releaseFilter.type = 'bandpass';
    releaseFilter.frequency.setValueAtTime(1200, now);
    releaseFilter.Q.setValueAtTime(2.0, now);
    releaseGain.gain.setValueAtTime(0.0001, now);
    releaseGain.gain.linearRampToValueAtTime(0.09, now + 0.001);
    releaseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
    release.connect(releaseFilter);
    releaseFilter.connect(releaseGain);
    releaseGain.connect(this.masterGain);
    release.start(now);
    release.stop(now + 0.02);
  }

  /**
   * 3. Gem Collect — Cinematic Gemstone Tumbling Cascade & Loot Confirmation
   *    (Multi-crystal micro-clinks + Velvety sub-bass loot drop + Celestial harmonic bloom)
   */
  public playGemCollect(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // ── STAGE 1: Three Micro-Staggered Crystalline Impacts (Gems tumbling into hand) ──
    const clinks = [
      { time: now + 0.000, freq: 880.00,  vol: 0.18 }, // A5
      { time: now + 0.032, freq: 1108.73, vol: 0.22 }, // C#6
      { time: now + 0.065, freq: 1318.51, vol: 0.25 }, // E6
    ];

    clinks.forEach(({ time, freq, vol }) => {
      if (!ctx || !this.masterGain) return;
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      oscGain.gain.setValueAtTime(0.0001, time);
      oscGain.gain.linearRampToValueAtTime(vol, time + 0.003);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);
      osc.connect(oscGain);
      oscGain.connect(this.masterGain);
      osc.start(time);
      osc.stop(time + 0.25);

      // Micro glass overtone
      const glass = ctx.createOscillator();
      const glassG = ctx.createGain();
      glass.type = 'triangle';
      glass.frequency.setValueAtTime(freq * 2.756, time);
      glassG.gain.setValueAtTime(0.0001, time);
      glassG.gain.linearRampToValueAtTime(vol * 0.45, time + 0.002);
      glassG.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);
      glass.connect(glassG);
      glassG.connect(this.masterGain);
      glass.start(time);
      glass.stop(time + 0.1);
    });

    // ── STAGE 2: Velvety Sub-Bass Loot Confirmation (Weighted impact) ──
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(110, now + 0.04);
    sub.frequency.exponentialRampToValueAtTime(42, now + 0.26);
    subGain.gain.setValueAtTime(0.0001, now + 0.04);
    subGain.gain.linearRampToValueAtTime(0.35, now + 0.05);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
    sub.connect(subGain);
    subGain.connect(this.masterGain);
    sub.start(now + 0.04);
    sub.stop(now + 0.35);

    // ── STAGE 3: Ascending Celestial Chord Bloom (Major Pentatonic Warmth) ──
    const chordNotes = [739.99, 932.33, 1108.73, 1479.98]; // F#5, A#5, C#6, F#6
    chordNotes.forEach((freq, idx) => {
      if (!ctx || !this.masterGain) return;
      const t = now + 0.09 + idx * 0.024;
      const bell = ctx.createOscillator();
      const bellGain = ctx.createGain();
      const bellFilter = ctx.createBiquadFilter();

      bell.type = 'sine';
      bell.frequency.setValueAtTime(freq, t);

      bellFilter.type = 'lowpass';
      bellFilter.frequency.setValueAtTime(1400, t);
      bellFilter.frequency.exponentialRampToValueAtTime(3800, t + 0.18);

      bellGain.gain.setValueAtTime(0.0001, t);
      bellGain.gain.linearRampToValueAtTime(0.18 - idx * 0.02, t + 0.008);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.36);

      bell.connect(bellFilter);
      bellFilter.connect(bellGain);
      bellGain.connect(this.masterGain);

      bell.start(t);
      bell.stop(t + 0.4);
    });

    // ── STAGE 4: Crystalline Air Sparkle Shimmer Tail ──
    const pinkBuf = this.createPinkNoiseBuffer(0.35);
    if (pinkBuf) {
      const sparkle = ctx.createBufferSource();
      sparkle.buffer = pinkBuf;
      const sparkleFilter = ctx.createBiquadFilter();
      sparkleFilter.type = 'highpass';
      sparkleFilter.frequency.setValueAtTime(4500, now + 0.12);
      const sparkleGain = ctx.createGain();
      sparkleGain.gain.setValueAtTime(0.0001, now + 0.12);
      sparkleGain.gain.linearRampToValueAtTime(0.07, now + 0.16);
      sparkleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
      sparkle.connect(sparkleFilter);
      sparkleFilter.connect(sparkleGain);
      sparkleGain.connect(this.masterGain);
      sparkle.start(now + 0.12);
      sparkle.stop(now + 0.45);
    }
  }

  /**
   * 4. Hero Recruited / Card Purchased
   *    Tier 1 — Arc Reactor charge-up → clean energy snap
   *    Tier 2 — Iron Man repulsor power surge + harmonic bloom
   *    Tier 3 — Infinity Stone socket into Gauntlet (cosmic sub-BOOM + light speed)
   */
  public playCardBuy(tier: number = 1): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    if (tier === 1) {
      // ── Tier 1: Tactical Card Lock + Resonant Harmonic Bloom ──
      // 1. Aerodynamic card draw whoosh (filtered noise transient)
      const whooshBuf = this.createPinkNoiseBuffer(0.12);
      if (whooshBuf) {
        const whoosh = ctx.createBufferSource();
        whoosh.buffer = whooshBuf;
        const whooshF = ctx.createBiquadFilter();
        whooshF.type = 'bandpass';
        whooshF.frequency.setValueAtTime(1400, now);
        whooshF.frequency.exponentialRampToValueAtTime(3200, now + 0.08);
        whooshF.Q.setValueAtTime(1.8, now);
        const whooshG = ctx.createGain();
        whooshG.gain.setValueAtTime(0.001, now);
        whooshG.gain.linearRampToValueAtTime(0.12, now + 0.02);
        whooshG.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
        whoosh.connect(whooshF); whooshF.connect(whooshG); whooshG.connect(this.masterGain);
        whoosh.start(now); whoosh.stop(now + 0.11);
      }

      // 2. Chassis magnetic lock transient (solid tactile snap)
      const snap = ctx.createOscillator();
      const snapG = ctx.createGain();
      snap.type = 'triangle';
      snap.frequency.setValueAtTime(220, now + 0.04);
      snap.frequency.exponentialRampToValueAtTime(54, now + 0.16);
      snapG.gain.setValueAtTime(0.001, now + 0.04);
      snapG.gain.linearRampToValueAtTime(0.32, now + 0.045);
      snapG.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      snap.connect(snapG); snapG.connect(this.masterGain);
      snap.start(now + 0.04); snap.stop(now + 0.24);

      // 3. Crisp Eb major triad bloom (Eb5 622.25, G5 783.99, Bb5 932.33)
      const triad = [622.25, 783.99, 932.33];
      triad.forEach((freq, idx) => {
        const t = now + 0.06 + idx * 0.016;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const f = ctx.createBiquadFilter();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        f.type = 'lowpass';
        f.frequency.setValueAtTime(4200, t);
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.18 - idx * 0.02, t + 0.014);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
        osc.connect(f); f.connect(g); g.connect(this.masterGain!);
        osc.start(t); osc.stop(t + 0.45);
      });

    } else if (tier === 2) {
      // ── Tier 2: Arc Reactor Capacitor Surge + Heroic Brass Cluster ──
      // 1. Rising capacitor whir & ionization
      const surge = ctx.createOscillator();
      const surgeG = ctx.createGain();
      const surgeF = ctx.createBiquadFilter();
      surge.type = 'sawtooth';
      surge.frequency.setValueAtTime(95, now);
      surge.frequency.exponentialRampToValueAtTime(680, now + 0.18);
      surgeF.type = 'lowpass';
      surgeF.frequency.setValueAtTime(1400, now);
      surgeF.frequency.exponentialRampToValueAtTime(3200, now + 0.18);
      surgeG.gain.setValueAtTime(0.001, now);
      surgeG.gain.linearRampToValueAtTime(0.24, now + 0.06);
      surgeG.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
      surge.connect(surgeF); surgeF.connect(surgeG); surgeG.connect(this.masterGain);
      surge.start(now); surge.stop(now + 0.2);

      // 2. Heavy Sub Punch detonation (125Hz down to 36Hz)
      const sub = ctx.createOscillator();
      const subG = ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(125, now + 0.14);
      sub.frequency.exponentialRampToValueAtTime(36, now + 0.52);
      subG.gain.setValueAtTime(0.001, now + 0.14);
      subG.gain.linearRampToValueAtTime(0.48, now + 0.148);
      subG.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
      sub.connect(subG); subG.connect(this.masterGain);
      sub.start(now + 0.14); sub.stop(now + 0.58);

      // 3. Heroic cinematic French horn cluster (Eb4 311.13, G4 392.00, Bb4 466.16, Eb5 622.25)
      const hornNotes = [311.13, 392.00, 466.16, 622.25];
      hornNotes.forEach((freq, idx) => {
        const t = now + 0.15 + idx * 0.018;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const f = ctx.createBiquadFilter();
        osc.type = idx < 2 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        f.type = 'lowpass';
        f.frequency.setValueAtTime(1800, t);
        f.frequency.exponentialRampToValueAtTime(800, t + 0.6);
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.18 - idx * 0.015, t + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);
        osc.connect(f); f.connect(g); g.connect(this.masterGain!);
        osc.start(t); osc.stop(t + 0.7);
      });

      // 4. Pink noise air wash tail
      const pink = this.createPinkNoiseBuffer(0.35);
      if (pink) {
        const pSource = ctx.createBufferSource();
        pSource.buffer = pink;
        const pF = ctx.createBiquadFilter();
        pF.type = 'highpass'; pF.frequency.setValueAtTime(3500, now + 0.18);
        const pG = ctx.createGain();
        pG.gain.setValueAtTime(0.001, now + 0.18);
        pG.gain.linearRampToValueAtTime(0.08, now + 0.22);
        pG.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);
        pSource.connect(pF); pF.connect(pG); pG.connect(this.masterGain);
        pSource.start(now + 0.18); pSource.stop(now + 0.5);
      }

    } else {
      // ── Tier 3: Legendary Cosmic Infinity Assembly (Hollywood BRAAAM + Celestial Harmonics) ──
      // 1. Hollywood Sub-Detonation BRAAAM
      const braam1 = ctx.createOscillator();
      const braam2 = ctx.createOscillator();
      const braamG = ctx.createGain();
      const braamF = ctx.createBiquadFilter();
      braam1.type = 'sawtooth';
      braam1.frequency.setValueAtTime(68, now);
      braam1.frequency.exponentialRampToValueAtTime(32, now + 0.6);
      braam2.type = 'sine';
      braam2.frequency.setValueAtTime(136, now);
      braam2.frequency.exponentialRampToValueAtTime(64, now + 0.6);
      braamF.type = 'lowpass';
      braamF.frequency.setValueAtTime(450, now);
      braamF.frequency.exponentialRampToValueAtTime(160, now + 0.55);
      braamF.Q.setValueAtTime(2.5, now);
      braamG.gain.setValueAtTime(0.001, now);
      braamG.gain.linearRampToValueAtTime(0.65, now + 0.02);
      braamG.gain.exponentialRampToValueAtTime(0.0001, now + 0.68);
      braam1.connect(braamF); braam2.connect(braamF);
      braamF.connect(braamG); braamG.connect(this.masterGain);
      braam1.start(now); braam2.start(now);
      braam1.stop(now + 0.7); braam2.stop(now + 0.7);

      // 2. Heavy Uru plate impact transient (metallic bell body)
      const uru = ctx.createOscillator();
      const uruG = ctx.createGain();
      uru.type = 'triangle';
      uru.frequency.setValueAtTime(380, now + 0.005);
      uru.frequency.exponentialRampToValueAtTime(110, now + 0.24);
      uruG.gain.setValueAtTime(0.001, now + 0.005);
      uruG.gain.linearRampToValueAtTime(0.35, now + 0.012);
      uruG.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
      uru.connect(uruG); uruG.connect(this.masterGain);
      uru.start(now + 0.005); uru.stop(now + 0.3);

      // 3. 6-Gem Cosmic Harmonic Ascension (Power, Space, Reality, Soul, Time, Mind)
      const cosmicScale = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      cosmicScale.forEach((freq, idx) => {
        const t = now + 0.18 + idx * 0.045;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const f = ctx.createBiquadFilter();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        f.type = 'lowpass';
        f.frequency.setValueAtTime(3200, t);
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.2 - idx * 0.014, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
        osc.connect(f); f.connect(g); g.connect(this.masterGain!);
        osc.start(t); osc.stop(t + 0.6);
      });

      // 4. Sparkling ethereal C7 aurora halo tail
      const halo = ctx.createOscillator();
      const haloG = ctx.createGain();
      halo.type = 'sine';
      halo.frequency.setValueAtTime(2093, now + 0.5);
      halo.frequency.linearRampToValueAtTime(2637, now + 1.2);
      haloG.gain.setValueAtTime(0.001, now + 0.5);
      haloG.gain.linearRampToValueAtTime(0.14, now + 0.58);
      haloG.gain.exponentialRampToValueAtTime(0.0001, now + 1.35);
      halo.connect(haloG); haloG.connect(this.masterGain);
      halo.start(now + 0.5); halo.stop(now + 1.4);
    }
  }

  /**
   * 5. Card Reserve — Holographic Vault Containment & Pneumatic Clamp Latch
   */
  public playCardReserve(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // 1. Holographic scanline shimmer sweep
    const scan = ctx.createOscillator();
    const scanG = ctx.createGain();
    const scanF = ctx.createBiquadFilter();
    scan.type = 'triangle';
    scan.frequency.setValueAtTime(440, now);
    scan.frequency.exponentialRampToValueAtTime(1760, now + 0.16);
    scanF.type = 'bandpass';
    scanF.frequency.setValueAtTime(1200, now);
    scanF.frequency.exponentialRampToValueAtTime(3200, now + 0.16);
    scanF.Q.setValueAtTime(2.5, now);
    scanG.gain.setValueAtTime(0.001, now);
    scanG.gain.linearRampToValueAtTime(0.18, now + 0.05);
    scanG.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    scan.connect(scanF); scanF.connect(scanG); scanG.connect(this.masterGain);
    scan.start(now); scan.stop(now + 0.2);

    // 2. Heavy vault pneumatic clamp latch (hydraulic lock)
    const clampTime = now + 0.14;
    const clamp = ctx.createOscillator();
    const clampG = ctx.createGain();
    clamp.type = 'triangle';
    clamp.frequency.setValueAtTime(280, clampTime);
    clamp.frequency.exponentialRampToValueAtTime(65, clampTime + 0.12);
    clampG.gain.setValueAtTime(0.001, clampTime);
    clampG.gain.linearRampToValueAtTime(0.36, clampTime + 0.004);
    clampG.gain.exponentialRampToValueAtTime(0.0001, clampTime + 0.16);
    clamp.connect(clampG); clampG.connect(this.masterGain);
    clamp.start(clampTime); clamp.stop(clampTime + 0.18);

    // 3. Security confirmation ping (C7 crystal harmonic)
    const pingTime = now + 0.22;
    const ping = ctx.createOscillator();
    const pingG = ctx.createGain();
    ping.type = 'sine';
    ping.frequency.setValueAtTime(2093.00, pingTime); // C7
    pingG.gain.setValueAtTime(0.001, pingTime);
    pingG.gain.linearRampToValueAtTime(0.15, pingTime + 0.005);
    pingG.gain.exponentialRampToValueAtTime(0.0001, pingTime + 0.42);
    ping.connect(pingG); pingG.connect(this.masterGain);
    ping.start(pingTime); ping.stop(pingTime + 0.45);
  }

  /**
   * 6. UI Button Click — Swiss Precision Tactile Micro-Switch
   */
  public playButtonClick(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Layer 1: Aluminum switch casing body resonance (130Hz -> 48Hz)
    const body = ctx.createOscillator();
    const bodyG = ctx.createGain();
    body.type = 'triangle';
    body.frequency.setValueAtTime(130, now);
    body.frequency.exponentialRampToValueAtTime(48, now + 0.024);
    bodyG.gain.setValueAtTime(0.001, now);
    bodyG.gain.linearRampToValueAtTime(0.25, now + 0.001);
    bodyG.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);
    body.connect(bodyG); bodyG.connect(this.masterGain);
    body.start(now); body.stop(now + 0.03);

    // Layer 2: Micro-contact ceramic snap (3400Hz crisp tactile transient)
    const snap = ctx.createOscillator();
    const snapG = ctx.createGain();
    const snapF = ctx.createBiquadFilter();
    snap.type = 'sine';
    snap.frequency.setValueAtTime(3400, now);
    snap.frequency.exponentialRampToValueAtTime(1200, now + 0.006);
    snapF.type = 'highpass';
    snapF.frequency.setValueAtTime(2200, now);
    snapG.gain.setValueAtTime(0.001, now);
    snapG.gain.linearRampToValueAtTime(0.14, now + 0.0005);
    snapG.gain.exponentialRampToValueAtTime(0.0001, now + 0.009);
    snap.connect(snapF); snapF.connect(snapG); snapG.connect(this.masterGain);
    snap.start(now); snap.stop(now + 0.012);
  }

  /**
   * 7. Turn Alert — S.H.I.E.L.D. Tactical Acoustic Prompt (F5 → C6 → G6)
   */
  public playTurnAlert(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // 3 ascending pure crystalline chimes (F5, C6, G6)
    const tones = [
      { freq: 698.46, delay: 0.00, dur: 0.24, gain: 0.24 }, // F5
      { freq: 1046.50, delay: 0.12, dur: 0.28, gain: 0.26 }, // C6
      { freq: 1567.98, delay: 0.24, dur: 0.65, gain: 0.22 }, // G6 (Apex sustain)
    ];

    tones.forEach(({ freq, delay, dur, gain }) => {
      const t = now + delay;
      // 1. Fundamental chime
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(gain, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g); g.connect(this.masterGain!);
      osc.start(t); osc.stop(t + dur + 0.02);

      // 2. Warm acoustic overtone (triangle)
      const harm = ctx.createOscillator();
      const hg = ctx.createGain();
      harm.type = 'triangle';
      harm.frequency.setValueAtTime(freq * 2, t);
      hg.gain.setValueAtTime(0.001, t);
      hg.gain.linearRampToValueAtTime(gain * 0.25, t + 0.006);
      hg.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.5);
      harm.connect(hg); hg.connect(this.masterGain!);
      harm.start(t); harm.stop(t + dur * 0.55);
    });

    // 3. Subtle ethereal shimmer tail
    const shimmer = ctx.createOscillator();
    const shimG = ctx.createGain();
    shimmer.type = 'sine';
    shimmer.frequency.setValueAtTime(3135.96, now + 0.35); // G7
    shimG.gain.setValueAtTime(0.001, now + 0.35);
    shimG.gain.linearRampToValueAtTime(0.08, now + 0.40);
    shimG.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);
    shimmer.connect(shimG); shimG.connect(this.masterGain);
    shimmer.start(now + 0.35); shimmer.stop(now + 1.0);
  }

  /**
   * 8. Modal Open — Holographic HUD Expansion & Pneumatic Air Cushion
   */
  public playModalOpen(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // 1. Air cushion expansion whoosh
    const airBuf = this.createPinkNoiseBuffer(0.18);
    if (airBuf) {
      const air = ctx.createBufferSource();
      air.buffer = airBuf;
      const airF = ctx.createBiquadFilter();
      airF.type = 'bandpass';
      airF.frequency.setValueAtTime(800, now);
      airF.frequency.exponentialRampToValueAtTime(2800, now + 0.12);
      airF.Q.setValueAtTime(2.0, now);
      const airG = ctx.createGain();
      airG.gain.setValueAtTime(0.001, now);
      airG.gain.linearRampToValueAtTime(0.16, now + 0.03);
      airG.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      air.connect(airF); airF.connect(airG); airG.connect(this.masterGain);
      air.start(now); air.stop(now + 0.17);
    }

    // 2. Glass HUD settlement chime (1480Hz -> 1760Hz)
    const glass = ctx.createOscillator();
    const glassG = ctx.createGain();
    glass.type = 'sine';
    glass.frequency.setValueAtTime(1480, now + 0.06);
    glass.frequency.exponentialRampToValueAtTime(1760, now + 0.14);
    glassG.gain.setValueAtTime(0.001, now + 0.06);
    glassG.gain.linearRampToValueAtTime(0.15, now + 0.08);
    glassG.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    glass.connect(glassG); glassG.connect(this.masterGain);
    glass.start(now + 0.06); glass.stop(now + 0.38);
  }

  /**
   * 9. Modal Close — Tactile Pneumatic Bleed & Soft Felt Latch
   */
  public playModalClose(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // 1. Air bleed dismiss
    const airBuf = this.createPinkNoiseBuffer(0.14);
    if (airBuf) {
      const air = ctx.createBufferSource();
      air.buffer = airBuf;
      const airF = ctx.createBiquadFilter();
      airF.type = 'lowpass';
      airF.frequency.setValueAtTime(2400, now);
      airF.frequency.exponentialRampToValueAtTime(450, now + 0.11);
      const airG = ctx.createGain();
      airG.gain.setValueAtTime(0.001, now);
      airG.gain.linearRampToValueAtTime(0.14, now + 0.015);
      airG.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      air.connect(airF); airF.connect(airG); airG.connect(this.masterGain);
      air.start(now); air.stop(now + 0.13);
    }

    // 2. Soft felt dampening thud
    const thud = ctx.createOscillator();
    const thudG = ctx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(95, now + 0.04);
    thud.frequency.exponentialRampToValueAtTime(42, now + 0.14);
    thudG.gain.setValueAtTime(0.001, now + 0.04);
    thudG.gain.linearRampToValueAtTime(0.16, now + 0.045);
    thudG.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    thud.connect(thudG); thudG.connect(this.masterGain);
    thud.start(now + 0.04); thud.stop(now + 0.18);
  }

  /**
   * 10. Gauntlet Stone Socketed — Cosmic Uru Lock & Dimensional Resonance
   */
  public playGauntletSocket(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Stage 1: Gravitational sub-frequency vacuum sink (75Hz -> 28Hz)
    const sub = ctx.createOscillator();
    const subG = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(75, now);
    sub.frequency.exponentialRampToValueAtTime(28, now + 0.35);
    subG.gain.setValueAtTime(0.001, now);
    subG.gain.linearRampToValueAtTime(0.42, now + 0.04);
    subG.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
    sub.connect(subG); subG.connect(this.masterGain);
    sub.start(now); sub.stop(now + 0.4);

    // Stage 2: Heavy Uru metal mechanical lock clamp
    const clampTime = now + 0.08;
    const clamp = ctx.createOscillator();
    const clampG = ctx.createGain();
    const clampF = ctx.createBiquadFilter();
    clamp.type = 'triangle';
    clamp.frequency.setValueAtTime(340, clampTime);
    clamp.frequency.exponentialRampToValueAtTime(88, clampTime + 0.16);
    clampF.type = 'lowpass';
    clampF.frequency.setValueAtTime(2200, clampTime);
    clampG.gain.setValueAtTime(0.001, clampTime);
    clampG.gain.linearRampToValueAtTime(0.38, clampTime + 0.006);
    clampG.gain.exponentialRampToValueAtTime(0.0001, clampTime + 0.22);
    clamp.connect(clampF); clampF.connect(clampG); clampG.connect(this.masterGain);
    clamp.start(clampTime); clamp.stop(clampTime + 0.25);

    // Stage 3: Cosmic stone ignition chime (Perfect 5th: C5 523.25 + G5 783.99 + C7 sparkle)
    const chimeTime = now + 0.18;
    const chimes = [523.25, 783.99, 2093.00];
    chimes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = idx === 2 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, chimeTime);
      g.gain.setValueAtTime(0.001, chimeTime);
      g.gain.linearRampToValueAtTime(0.24 - idx * 0.06, chimeTime + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, chimeTime + 0.7);
      osc.connect(g); g.connect(this.masterGain!);
      osc.start(chimeTime); osc.stop(chimeTime + 0.75);
    });
  }

  /**
   * 11. Victory / Game Over Win — Grand Hollywood Cinematic Superhero Fanfare
   */
  public playVictory(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Stage 1: Heroic brass progression (D major -> G major -> A major apex)
    // Voicing chords with brass timbre (filtered sawtooth + triangle)
    const brassChords = [
      // Chord 1 (0.00s): D major triad (D4 293.66, F#4 369.99, A4 440.00)
      { notes: [293.66, 369.99, 440.00], time: now, dur: 0.32, gain: 0.20 },
      // Chord 2 (0.28s): G major triad (G4 392.00, B4 493.88, D5 587.33)
      { notes: [392.00, 493.88, 587.33], time: now + 0.28, dur: 0.36, gain: 0.22 },
      // Chord 3 (0.60s): Triumphant A major apex (A4 440.00, C#5 554.37, E5 659.25, A5 880.00)
      { notes: [440.00, 554.37, 659.25, 880.00], time: now + 0.60, dur: 1.10, gain: 0.26 },
    ];

    brassChords.forEach(({ notes, time, dur, gain }) => {
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const f = ctx.createBiquadFilter();

        osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        f.type = 'lowpass';
        f.frequency.setValueAtTime(1400, time);
        f.frequency.exponentialRampToValueAtTime(3200, time + 0.08);
        f.frequency.exponentialRampToValueAtTime(1600, time + dur);
        f.Q.setValueAtTime(1.5, time);

        g.gain.setValueAtTime(0.001, time);
        g.gain.linearRampToValueAtTime(gain - idx * 0.02, time + 0.04);
        g.gain.linearRampToValueAtTime((gain - idx * 0.02) * 0.85, time + dur * 0.5);
        g.gain.exponentialRampToValueAtTime(0.0001, time + dur);

        osc.connect(f);
        f.connect(g);
        g.connect(this.masterGain!);

        osc.start(time);
        osc.stop(time + dur + 0.05);
      });
    });

    // Stage 2: Sub-bass triumphal resolution impact (110Hz -> 36Hz)
    const sub = ctx.createOscillator();
    const subG = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(110, now + 0.60);
    sub.frequency.exponentialRampToValueAtTime(36, now + 1.3);
    subG.gain.setValueAtTime(0.001, now + 0.60);
    subG.gain.linearRampToValueAtTime(0.48, now + 0.63);
    subG.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
    sub.connect(subG); subG.connect(this.masterGain);
    sub.start(now + 0.60); sub.stop(now + 1.45);

    // Stage 3: Orchestral cymbal sparkle wash
    const pinkBuf = this.createPinkNoiseBuffer(1.4);
    if (pinkBuf) {
      const cymbal = ctx.createBufferSource();
      cymbal.buffer = pinkBuf;
      const cymbalF = ctx.createBiquadFilter();
      cymbalF.type = 'highpass';
      cymbalF.frequency.setValueAtTime(4500, now + 0.60);
      const cymbalG = ctx.createGain();
      cymbalG.gain.setValueAtTime(0.001, now + 0.60);
      cymbalG.gain.linearRampToValueAtTime(0.16, now + 0.68);
      cymbalG.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
      cymbal.connect(cymbalF); cymbalF.connect(cymbalG); cymbalG.connect(this.masterGain);
      cymbal.start(now + 0.60); cymbal.stop(now + 1.85);
    }
  }

  /**
   * 12. Error / Invalid Action — Tactile Damped Resistance Thud (Informative & Sleek)
   */
  public playError(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Pulse 1: Damped felt resistance thud (160Hz -> 62Hz)
    const thud1 = ctx.createOscillator();
    const thud1G = ctx.createGain();
    thud1.type = 'triangle';
    thud1.frequency.setValueAtTime(160, now);
    thud1.frequency.exponentialRampToValueAtTime(62, now + 0.05);
    thud1G.gain.setValueAtTime(0.001, now);
    thud1G.gain.linearRampToValueAtTime(0.26, now + 0.002);
    thud1G.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
    thud1.connect(thud1G); thud1G.connect(this.masterGain);
    thud1.start(now); thud1.stop(now + 0.08);

    // Pulse 2: Soft tactile follow-up bounce (120Hz -> 48Hz)
    const t2 = now + 0.065;
    const thud2 = ctx.createOscillator();
    const thud2G = ctx.createGain();
    thud2.type = 'sine';
    thud2.frequency.setValueAtTime(120, t2);
    thud2.frequency.exponentialRampToValueAtTime(48, t2 + 0.06);
    thud2G.gain.setValueAtTime(0.001, t2);
    thud2G.gain.linearRampToValueAtTime(0.18, t2 + 0.002);
    thud2G.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.08);
    thud2.connect(thud2G); thud2G.connect(this.masterGain);
    thud2.start(t2); thud2.stop(t2 + 0.09);
  }

  /**
   * 13. Final Round Alert — Cosmic Cinematic Alarm (BRAAAM + Siren + Tension)
   * Stage 1: Dramatic sub-bass BRAAAM (0ms – 600ms)
   * Stage 2: Ascending cosmic siren sweep (150ms – 900ms)
   * Stage 3: Heroic brass sting fanfare (400ms – 1200ms)
   * Stage 4: Resonant tail bloom (800ms – 2000ms)
   */
  public playFinalRoundAlert(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // ── STAGE 1: Sub-Bass BRAAAM Detonation (0ms – 600ms) ──
    // Cinematic cinematic low-end impact ala Marvel trailer
    const braamOsc = ctx.createOscillator();
    const braamOsc2 = ctx.createOscillator();
    const braamGain = ctx.createGain();
    const braamFilter = ctx.createBiquadFilter();

    braamOsc.type = 'sawtooth';
    braamOsc.frequency.setValueAtTime(65, now);
    braamOsc.frequency.exponentialRampToValueAtTime(48, now + 0.08);
    braamOsc.frequency.linearRampToValueAtTime(38, now + 0.55);

    braamOsc2.type = 'square';
    braamOsc2.frequency.setValueAtTime(130, now);
    braamOsc2.frequency.exponentialRampToValueAtTime(96, now + 0.08);
    braamOsc2.frequency.linearRampToValueAtTime(76, now + 0.55);

    braamFilter.type = 'lowpass';
    braamFilter.frequency.setValueAtTime(280, now);
    braamFilter.frequency.exponentialRampToValueAtTime(180, now + 0.5);
    braamFilter.Q.setValueAtTime(3.5, now);

    braamGain.gain.setValueAtTime(0.001, now);
    braamGain.gain.linearRampToValueAtTime(0.75, now + 0.025);
    braamGain.gain.linearRampToValueAtTime(0.62, now + 0.15);
    braamGain.gain.exponentialRampToValueAtTime(0.001, now + 0.62);

    braamOsc.connect(braamFilter);
    braamOsc2.connect(braamFilter);
    braamFilter.connect(braamGain);
    braamGain.connect(this.masterGain);

    braamOsc.start(now);
    braamOsc2.start(now);
    braamOsc.stop(now + 0.65);
    braamOsc2.stop(now + 0.65);

    // ── STAGE 2: Cosmic Alert Siren Sweep (150ms – 900ms) ──
    // Ascending high-frequency siren sweep → urgency + danger
    const sirenOsc = ctx.createOscillator();
    const sirenGain = ctx.createGain();
    const sirenFilter = ctx.createBiquadFilter();
    const sirenStart = now + 0.15;

    sirenOsc.type = 'sawtooth';
    sirenOsc.frequency.setValueAtTime(320, sirenStart);
    sirenOsc.frequency.exponentialRampToValueAtTime(1600, sirenStart + 0.35);
    sirenOsc.frequency.linearRampToValueAtTime(980, sirenStart + 0.65);

    sirenFilter.type = 'bandpass';
    sirenFilter.frequency.setValueAtTime(800, sirenStart);
    sirenFilter.frequency.exponentialRampToValueAtTime(2200, sirenStart + 0.35);
    sirenFilter.Q.setValueAtTime(2.8, sirenStart);

    sirenGain.gain.setValueAtTime(0.001, sirenStart);
    sirenGain.gain.linearRampToValueAtTime(0.32, sirenStart + 0.04);
    sirenGain.gain.linearRampToValueAtTime(0.28, sirenStart + 0.35);
    sirenGain.gain.exponentialRampToValueAtTime(0.001, sirenStart + 0.72);

    sirenOsc.connect(sirenFilter);
    sirenFilter.connect(sirenGain);
    sirenGain.connect(this.masterGain);

    sirenOsc.start(sirenStart);
    sirenOsc.stop(sirenStart + 0.75);

    // ── STAGE 3: Heroic Brass Sting Fanfare (400ms – 1200ms) ──
    // Cinematic tension horn cluster — announces "something big is happening"
    const brassNotes = [174.61, 220.00, 261.63, 329.63, 415.30]; // F3, A3, C4, E4, Ab4
    const brassStart = now + 0.40;
    const brassDur = 0.75;

    brassNotes.forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const noteTime = brassStart + i * 0.025;
      const brassOsc = ctx.createOscillator();
      const brassGain = ctx.createGain();
      const brassFilter = ctx.createBiquadFilter();

      brassOsc.type = i % 2 === 0 ? 'sawtooth' : 'triangle';
      brassOsc.frequency.setValueAtTime(freq, noteTime);
      brassOsc.frequency.linearRampToValueAtTime(freq * 1.003, noteTime + brassDur);

      brassFilter.type = 'lowpass';
      brassFilter.frequency.setValueAtTime(900, noteTime);
      brassFilter.frequency.exponentialRampToValueAtTime(2800, noteTime + 0.12);
      brassFilter.frequency.exponentialRampToValueAtTime(1200, noteTime + brassDur);
      brassFilter.Q.setValueAtTime(1.8, noteTime);

      const peakGain = 0.14 + (brassNotes.length - i) * 0.025;
      brassGain.gain.setValueAtTime(0.001, noteTime);
      brassGain.gain.linearRampToValueAtTime(peakGain, noteTime + 0.04);
      brassGain.gain.linearRampToValueAtTime(peakGain * 0.8, noteTime + 0.4);
      brassGain.gain.exponentialRampToValueAtTime(0.001, noteTime + brassDur);

      brassOsc.connect(brassFilter);
      brassFilter.connect(brassGain);
      brassGain.connect(this.masterGain);

      brassOsc.start(noteTime);
      brassOsc.stop(noteTime + brassDur + 0.05);
    });

    // ── STAGE 4: Resonant Cymbal Wash Tail (800ms – 2000ms) ──
    // High-frequency shimmer resolving the tension
    const pinkBuffer = this.createPinkNoiseBuffer(1.3);
    if (pinkBuffer) {
      const cymbalSource = ctx.createBufferSource();
      cymbalSource.buffer = pinkBuffer;

      const cymbalHighpass = ctx.createBiquadFilter();
      cymbalHighpass.type = 'highpass';
      cymbalHighpass.frequency.setValueAtTime(4000, now + 0.8);

      const cymbalGain = ctx.createGain();
      cymbalGain.gain.setValueAtTime(0.001, now + 0.8);
      cymbalGain.gain.linearRampToValueAtTime(0.18, now + 0.88);
      cymbalGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

      cymbalSource.connect(cymbalHighpass);
      cymbalHighpass.connect(cymbalGain);
      cymbalGain.connect(this.masterGain);

      cymbalSource.start(now + 0.8);
      cymbalSource.stop(now + 2.05);
    }
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
  //  Battle Launch, Countdown & Score Adjustment SFX
  // ────────────────────────────────────────────────────────────

  /**
   * Countdown Tick — Tactical Mission Radar Pulse (Pitches upward with tension)
   */
  public playCountdownTick(secondsRemaining: number): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    if (secondsRemaining <= 1) {
      // Critical final warning (Double High-Voltage Alert Pulse)
      // Pulse 1:
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1046.5, now); // C6
      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(0.35, now + 0.004);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);
      osc1.connect(gain1);
      gain1.connect(this.masterGain);
      osc1.start(now);
      osc1.stop(now + 0.08);

      // Pulse 2 (Higher alert chime):
      const t2 = now + 0.085;
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      const harm2 = ctx.createOscillator();
      const harmGain2 = ctx.createGain();

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1396.91, t2); // F6
      harm2.type = 'triangle';
      harm2.frequency.setValueAtTime(1396.91 * 2, t2);

      gain2.gain.setValueAtTime(0.001, t2);
      gain2.gain.linearRampToValueAtTime(0.42, t2 + 0.004);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.22);

      harmGain2.gain.setValueAtTime(0.001, t2);
      harmGain2.gain.linearRampToValueAtTime(0.12, t2 + 0.004);
      harmGain2.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.12);

      osc2.connect(gain2);
      gain2.connect(this.masterGain);
      harm2.connect(harmGain2);
      harmGain2.connect(this.masterGain);

      osc2.start(t2);
      osc2.stop(t2 + 0.23);
      harm2.start(t2);
      harm2.stop(t2 + 0.23);
    } else {
      // 5, 4, 3, 2: Accelerating tension pitch
      // 5 -> 587.33 (D5), 4 -> 659.25 (E5), 3 -> 783.99 (G5), 2 -> 987.77 (B5)
      const pitchMap: Record<number, number> = {
        5: 587.33,
        4: 659.25,
        3: 783.99,
        2: 987.77,
      };
      const freq = pitchMap[secondsRemaining] ?? 660;

      // Layer 1: High metallic click transient (digital ping)
      const tick = ctx.createOscillator();
      const tickGain = ctx.createGain();
      const tickFilter = ctx.createBiquadFilter();
      tick.type = 'square';
      tick.frequency.setValueAtTime(3200, now);
      tickFilter.type = 'highpass';
      tickFilter.frequency.setValueAtTime(2400, now);
      tickGain.gain.setValueAtTime(0.001, now);
      tickGain.gain.linearRampToValueAtTime(0.12, now + 0.001);
      tickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);
      tick.connect(tickFilter);
      tickFilter.connect(tickGain);
      tickGain.connect(this.masterGain);
      tick.start(now);
      tick.stop(now + 0.02);

      // Layer 2: Resonant Sine Core
      const sine = ctx.createOscillator();
      const sineGain = ctx.createGain();
      sine.type = 'sine';
      sine.frequency.setValueAtTime(freq, now);
      sineGain.gain.setValueAtTime(0.001, now);
      sineGain.gain.linearRampToValueAtTime(0.32, now + 0.003);
      sineGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
      sine.connect(sineGain);
      sineGain.connect(this.masterGain);
      sine.start(now);
      sine.stop(now + 0.15);
    }
  }

  /**
   * Battle Launch — Cinematic Quantum Warp & Heroic Deployment Detonation
   */
  public playBattleLaunch(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Stage 1: Rising Arc Surge (140Hz -> 880Hz)
    const surge = ctx.createOscillator();
    const surgeGain = ctx.createGain();
    surge.type = 'sawtooth';
    surge.frequency.setValueAtTime(140, now);
    surge.frequency.exponentialRampToValueAtTime(880, now + 0.22);
    surgeGain.gain.setValueAtTime(0.001, now);
    surgeGain.gain.linearRampToValueAtTime(0.28, now + 0.06);
    surgeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);
    surge.connect(surgeGain);
    surgeGain.connect(this.masterGain);
    surge.start(now);
    surge.stop(now + 0.27);

    // Stage 2: Heavy Sub-Bass Boom (110Hz -> 32Hz)
    const boom = ctx.createOscillator();
    const boomGain = ctx.createGain();
    boom.type = 'sine';
    boom.frequency.setValueAtTime(110, now + 0.12);
    boom.frequency.exponentialRampToValueAtTime(32, now + 0.55);
    boomGain.gain.setValueAtTime(0.001, now + 0.12);
    boomGain.gain.linearRampToValueAtTime(0.65, now + 0.14);
    boomGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
    boom.connect(boomGain);
    boomGain.connect(this.masterGain);
    boom.start(now + 0.12);
    boom.stop(now + 0.7);

    // Stage 3: High Energy Warp Shimmer
    const shimmer = ctx.createOscillator();
    const shimGain = ctx.createGain();
    shimmer.type = 'triangle';
    shimmer.frequency.setValueAtTime(1760, now + 0.14); // A6
    shimmer.frequency.exponentialRampToValueAtTime(2637, now + 0.35); // E7
    shimGain.gain.setValueAtTime(0.001, now + 0.14);
    shimGain.gain.linearRampToValueAtTime(0.18, now + 0.18);
    shimGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    shimmer.connect(shimGain);
    shimGain.connect(this.masterGain);
    shimmer.start(now + 0.14);
    shimmer.stop(now + 0.5);
  }

  /**
   * Score Slider Tick — Tactile Quantum Rotary Encoder (Different from click/countdown!)
   * Simulates a precision ratchet dial whose pitch subtly scales with target score.
   */
  public playScoreSliderTick(score: number, min: number = 10, max: number = 50): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Throttle to 32ms so fast scrubbing creates a buttery smooth mechanical purr
    if (now - this.lastSliderTickTime < 0.032 && score === this.lastSliderScore) {
      return;
    }
    this.lastSliderTickTime = now;
    this.lastSliderScore = score;

    const ratio = Math.max(0, Math.min(1, (score - min) / (max - min)));
    // Frequency scales from 480Hz (deep mechanical detent) to 1080Hz (bright precision detent)
    const freq = 480 + ratio * 600;

    // Dual-component micro-ratchet:
    // 1. Ultra-short downward pitch blip (16ms)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq * 1.35, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.75, now + 0.016);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.24, now + 0.0015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.02);

    // 2. High friction tooth tick (subtle wood/carbon snap)
    const tooth = ctx.createOscillator();
    const toothGain = ctx.createGain();
    const toothFilter = ctx.createBiquadFilter();
    tooth.type = 'square';
    tooth.frequency.setValueAtTime(freq * 2.8, now);
    toothFilter.type = 'bandpass';
    toothFilter.frequency.setValueAtTime(freq * 2.5, now);
    toothFilter.Q.setValueAtTime(4.0, now);

    toothGain.gain.setValueAtTime(0.001, now);
    toothGain.gain.linearRampToValueAtTime(0.08, now + 0.001);
    toothGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);

    tooth.connect(toothFilter);
    toothFilter.connect(toothGain);
    toothGain.connect(this.masterGain);
    tooth.start(now);
    tooth.stop(now + 0.015);
  }

  /**
   * Score Preset Select — Heavy Cyber Cell / Magnetic Power Lock Snap
   */
  public playScorePresetSelect(pts: number): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Layer 1: Magnetic Solenoid Thud (200Hz -> 60Hz)
    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(200, now);
    thud.frequency.exponentialRampToValueAtTime(58, now + 0.038);
    thudGain.gain.setValueAtTime(0.001, now);
    thudGain.gain.linearRampToValueAtTime(0.32, now + 0.002);
    thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
    thud.connect(thudGain);
    thudGain.connect(this.masterGain);
    thud.start(now);
    thud.stop(now + 0.05);

    // Layer 2: Dual Metallic Lock Ring modulated by preset target points
    const freqMult = pts ? Math.max(0.85, Math.min(1.35, 0.85 + (pts - 12) * 0.03)) : 1.0;
    const lock1 = ctx.createOscillator();
    const lock2 = ctx.createOscillator();
    const lockGain = ctx.createGain();
    lock1.type = 'triangle';
    lock2.type = 'sine';
    lock1.frequency.setValueAtTime(659.25 * freqMult, now + 0.006); // E5 tuned
    lock2.frequency.setValueAtTime(987.77 * freqMult, now + 0.006); // B5 tuned

    lockGain.gain.setValueAtTime(0.001, now + 0.006);
    lockGain.gain.linearRampToValueAtTime(0.26, now + 0.01);
    lockGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

    lock1.connect(lockGain);
    lock2.connect(lockGain);
    lockGain.connect(this.masterGain);

    lock1.start(now + 0.006);
    lock2.start(now + 0.006);
    lock1.stop(now + 0.18);
    lock2.stop(now + 0.18);
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
   * 14. Iron Man — 5-Stage Cinematic Arc Reactor, Unibeam & Titanium Servo Lock
   * Stage 1: JARVIS AI HUD interface ping & target acquisition
   * Stage 2: Arc Reactor capacitor high-voltage charging whine (FM modulation)
   * Stage 3: High-energy Unibeam / Repulsor plasma blast detonation & beam wash
   * Stage 4: Concussive sub-bass kinetic detonation (260Hz down to 30Hz)
   * Stage 5: Gold-Titanium alloy mechanical servo lock & cooling vent hiss
   */
  public playHeroRepulsor(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const distortion = this.makeDistortionCurve(20);

    // ── STAGE 1: JARVIS HUD Target Acquisition Chime (0ms - 50ms) ──
    [1800, 2700].forEach((freq, idx) => {
      const pingTime = now + idx * 0.035;
      const pingOsc = ctx.createOscillator();
      const pingGain = ctx.createGain();
      pingOsc.type = 'sine';
      pingOsc.frequency.setValueAtTime(freq, pingTime);

      pingGain.gain.setValueAtTime(0.001, pingTime);
      pingGain.gain.linearRampToValueAtTime(0.25, pingTime + 0.003);
      pingGain.gain.exponentialRampToValueAtTime(0.0001, pingTime + 0.05);

      pingOsc.connect(pingGain);
      pingGain.connect(this.masterGain!);
      pingOsc.start(pingTime);
      pingOsc.stop(pingTime + 0.06);
    });

    // ── STAGE 2: Arc Reactor Power Charging Whine (50ms - 220ms) ──
    const chargeTime = now + 0.04;
    const chargeOsc = ctx.createOscillator();
    const chargeGain = ctx.createGain();
    const chargeVibrato = ctx.createOscillator();
    const chargeVibratoGain = ctx.createGain();

    chargeVibrato.frequency.setValueAtTime(20, chargeTime);
    chargeVibratoGain.gain.setValueAtTime(60, chargeTime);
    chargeVibrato.connect(chargeOsc.frequency);

    chargeOsc.type = 'sine';
    chargeOsc.frequency.setValueAtTime(420, chargeTime);
    chargeOsc.frequency.exponentialRampToValueAtTime(4200, chargeTime + 0.18);

    chargeGain.gain.setValueAtTime(0.001, chargeTime);
    chargeGain.gain.linearRampToValueAtTime(0.38, chargeTime + 0.16);
    chargeGain.gain.exponentialRampToValueAtTime(0.001, chargeTime + 0.2);

    chargeOsc.connect(chargeGain);
    chargeGain.connect(this.masterGain);

    chargeVibrato.start(chargeTime);
    chargeOsc.start(chargeTime);
    chargeVibrato.stop(chargeTime + 0.22);
    chargeOsc.stop(chargeTime + 0.22);

    // ── STAGE 3: Unibeam / Repulsor Plasma Blast Detonation (220ms - 600ms) ──
    const blastTime = chargeTime + 0.18;
    const blastOsc = ctx.createOscillator();
    const blastGain = ctx.createGain();
    const blastFilter = ctx.createBiquadFilter();
    const blastShaper = ctx.createWaveShaper();

    blastShaper.curve = distortion as any;
    blastOsc.type = 'sawtooth';
    blastOsc.frequency.setValueAtTime(2800, blastTime);
    blastOsc.frequency.exponentialRampToValueAtTime(75, blastTime + 0.28);

    blastFilter.type = 'lowpass';
    blastFilter.frequency.setValueAtTime(4800, blastTime);
    blastFilter.frequency.exponentialRampToValueAtTime(280, blastTime + 0.32);

    blastGain.gain.setValueAtTime(0.001, blastTime);
    blastGain.gain.linearRampToValueAtTime(0.75, blastTime + 0.008);
    blastGain.gain.exponentialRampToValueAtTime(0.0001, blastTime + 0.45);

    blastOsc.connect(blastShaper);
    blastShaper.connect(blastFilter);
    blastFilter.connect(blastGain);
    blastGain.connect(this.masterGain);

    blastOsc.start(blastTime);
    blastOsc.stop(blastTime + 0.48);

    // Plasma beam pink noise wash
    const pink = this.createPinkNoiseBuffer(0.35);
    if (pink) {
      const beamSource = ctx.createBufferSource();
      beamSource.buffer = pink;
      const beamFilter = ctx.createBiquadFilter();
      beamFilter.type = 'bandpass';
      beamFilter.frequency.setValueAtTime(3200, blastTime);
      beamFilter.frequency.exponentialRampToValueAtTime(600, blastTime + 0.3);

      const beamGain = ctx.createGain();
      beamGain.gain.setValueAtTime(0.001, blastTime);
      beamGain.gain.linearRampToValueAtTime(0.45, blastTime + 0.012);
      beamGain.gain.exponentialRampToValueAtTime(0.0001, blastTime + 0.35);

      beamSource.connect(beamFilter);
      beamFilter.connect(beamGain);
      beamGain.connect(this.masterGain);

      beamSource.start(blastTime);
      beamSource.stop(blastTime + 0.36);
    }

    // ── STAGE 4: Concussive Sub-Bass Detonation ──
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(260, blastTime);
    subOsc.frequency.exponentialRampToValueAtTime(32, blastTime + 0.26);

    subGain.gain.setValueAtTime(0.001, blastTime);
    subGain.gain.linearRampToValueAtTime(0.8, blastTime + 0.015);
    subGain.gain.exponentialRampToValueAtTime(0.0001, blastTime + 0.38);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(blastTime);
    subOsc.stop(blastTime + 0.4);

    // ── STAGE 5: Mechanical Titanium Servo Lock & Hiss (450ms - 600ms) ──
    const servoTime = blastTime + 0.28;
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'square';
    clickOsc.frequency.setValueAtTime(1750, servoTime);
    clickOsc.frequency.exponentialRampToValueAtTime(800, servoTime + 0.04);

    clickGain.gain.setValueAtTime(0.001, servoTime);
    clickGain.gain.linearRampToValueAtTime(0.28, servoTime + 0.003);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, servoTime + 0.05);

    clickOsc.connect(clickGain);
    clickGain.connect(this.masterGain);
    clickOsc.start(servoTime);
    clickOsc.stop(servoTime + 0.06);
  }

  /**
   * 15. Captain America — 4-Stage Vibranium Shield Aerodynamic Throw, Slam & Crystalline Ring
   * Stage 1: Aerodynamic shield throw whoosh (Doppler effect)
   * Stage 2: Heavy kinetic Vibranium impact slam (blunt strike)
   * Stage 3: Resonant Vibranium crystal ringing (5 harmonic frequencies sustaining for 2.0s)
   * Stage 4: Shield ricochet return & magnetic gauntlet catch
   */
  public playHeroShieldClang(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // ── STAGE 1: Aerodynamic Shield Throw Whoosh (0ms - 80ms) ──
    const throwOsc = ctx.createOscillator();
    const throwGain = ctx.createGain();
    throwOsc.type = 'sine';
    throwOsc.frequency.setValueAtTime(950, now);
    throwOsc.frequency.exponentialRampToValueAtTime(360, now + 0.08);

    throwGain.gain.setValueAtTime(0.001, now);
    throwGain.gain.linearRampToValueAtTime(0.3, now + 0.015);
    throwGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.085);

    throwOsc.connect(throwGain);
    throwGain.connect(this.masterGain);
    throwOsc.start(now);
    throwOsc.stop(now + 0.09);

    // ── STAGE 2: Heavy Kinetic Vibranium Impact Slam (80ms - 220ms) ──
    const hitTime = now + 0.07;
    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.type = 'triangle';
    thud.frequency.setValueAtTime(280, hitTime);
    thud.frequency.exponentialRampToValueAtTime(42, hitTime + 0.12);

    thudGain.gain.setValueAtTime(0.001, hitTime);
    thudGain.gain.linearRampToValueAtTime(0.7, hitTime + 0.004);
    thudGain.gain.exponentialRampToValueAtTime(0.0001, hitTime + 0.16);

    thud.connect(thudGain);
    thudGain.connect(this.masterGain);
    thud.start(hitTime);
    thud.stop(hitTime + 0.18);

    // ── STAGE 3: Pure Vibranium Inharmonic Metallic Partials (Sustaining 2.0s) ──
    const partials = [
      { freq: 1180, dur: 2.0, gain: 0.42, type: 'sine' as OscillatorType },
      { freq: 1780, dur: 1.6, gain: 0.34, type: 'triangle' as OscillatorType },
      { freq: 2360, dur: 1.2, gain: 0.28, type: 'sine' as OscillatorType },
      { freq: 3550, dur: 0.9, gain: 0.20, type: 'sine' as OscillatorType },
      { freq: 5320, dur: 0.6, gain: 0.12, type: 'sine' as OscillatorType },
    ];

    partials.forEach((p) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = p.type;
      osc.frequency.setValueAtTime(p.freq, hitTime);

      gain.gain.setValueAtTime(0.001, hitTime);
      gain.gain.linearRampToValueAtTime(p.gain, hitTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, hitTime + p.dur);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(hitTime);
      osc.stop(hitTime + p.dur + 0.05);
    });

    // ── STAGE 4: Shield Ricochet Return & Gauntlet Catch Clack (320ms) ──
    const catchTime = hitTime + 0.32;
    const catchOsc = ctx.createOscillator();
    const catchGain = ctx.createGain();
    catchOsc.type = 'triangle';
    catchOsc.frequency.setValueAtTime(820, catchTime);
    catchOsc.frequency.exponentialRampToValueAtTime(240, catchTime + 0.045);

    catchGain.gain.setValueAtTime(0.001, catchTime);
    catchGain.gain.linearRampToValueAtTime(0.4, catchTime + 0.002);
    catchGain.gain.exponentialRampToValueAtTime(0.0001, catchTime + 0.055);

    catchOsc.connect(catchGain);
    catchGain.connect(this.masterGain);
    catchOsc.start(catchTime);
    catchOsc.stop(catchTime + 0.06);
  }

  /**
   * 16. Hulk & She-Hulk — 4-Stage Gamma Leap, Bedrock Rupture & 2.2s Earthquake Tremor
   * Stage 1: Gamma leap wind displacement whoosh
   * Stage 2: HULK SMASH! Earth-shattering bedrock rupture with saturated distortion
   * Stage 3: Pulverized rock & concrete fragmentation crunch
   * Stage 4: Cavernous 2.2-second seismic earthquake tremor
   */
  public playHeroSmash(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const distortion = this.makeDistortionCurve(26);

    // ── STAGE 1: Gamma Leap Wind Displacement (0ms - 60ms) ──
    const wind = ctx.createOscillator();
    const windGain = ctx.createGain();
    wind.type = 'sine';
    wind.frequency.setValueAtTime(120, now);
    wind.frequency.exponentialRampToValueAtTime(320, now + 0.06);

    windGain.gain.setValueAtTime(0.001, now);
    windGain.gain.linearRampToValueAtTime(0.3, now + 0.02);
    windGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

    wind.connect(windGain);
    windGain.connect(this.masterGain);
    wind.start(now);
    wind.stop(now + 0.08);

    // ── STAGE 2: HULK SMASH! Earth-Shattering Bedrock Rupture (60ms - 800ms) ──
    const impactTime = now + 0.05;
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    const subShaper = ctx.createWaveShaper();
    subShaper.curve = distortion as any;

    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(340, impactTime);
    subOsc.frequency.exponentialRampToValueAtTime(24, impactTime + 0.6);

    subGain.gain.setValueAtTime(0.001, impactTime);
    subGain.gain.linearRampToValueAtTime(0.95, impactTime + 0.015);
    subGain.gain.exponentialRampToValueAtTime(0.0001, impactTime + 0.85);

    subOsc.connect(subShaper);
    subShaper.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(impactTime);
    subOsc.stop(impactTime + 0.9);

    // ── STAGE 3: Concrete & Bedrock Crunch Noise Explosions (50ms - 400ms) ──
    const crunchBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.4), ctx.sampleRate);
    const crunchData = crunchBuffer.getChannelData(0);
    for (let i = 0; i < crunchData.length; i++) {
      crunchData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (crunchData.length * 0.18));
    }
    const crunchNoise = ctx.createBufferSource();
    crunchNoise.buffer = crunchBuffer;

    const crunchFilter = ctx.createBiquadFilter();
    crunchFilter.type = 'lowpass';
    crunchFilter.frequency.setValueAtTime(750, impactTime);
    crunchFilter.frequency.exponentialRampToValueAtTime(90, impactTime + 0.35);

    const crunchGain = ctx.createGain();
    crunchGain.gain.setValueAtTime(0.001, impactTime);
    crunchGain.gain.linearRampToValueAtTime(0.75, impactTime + 0.005);
    crunchGain.gain.exponentialRampToValueAtTime(0.0001, impactTime + 0.38);

    crunchNoise.connect(crunchFilter);
    crunchFilter.connect(crunchGain);
    crunchGain.connect(this.masterGain);
    crunchNoise.start(impactTime);

    // ── STAGE 4: Cavernous 2.2s Seismic Earthquake Tremor ──
    const brownBuffer = this.createBrownNoiseBuffer(2.2);
    if (brownBuffer) {
      const rumbleSource = ctx.createBufferSource();
      rumbleSource.buffer = brownBuffer;

      const rumbleFilter = ctx.createBiquadFilter();
      rumbleFilter.type = 'lowpass';
      rumbleFilter.frequency.setValueAtTime(110, impactTime);
      rumbleFilter.frequency.linearRampToValueAtTime(40, impactTime + 2.1);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(6.0, impactTime);
      lfoGain.gain.setValueAtTime(0.18, impactTime);

      const rumbleGain = ctx.createGain();
      rumbleGain.gain.setValueAtTime(0.001, impactTime + 0.05);
      rumbleGain.gain.linearRampToValueAtTime(0.65, impactTime + 0.15);
      rumbleGain.gain.exponentialRampToValueAtTime(0.0001, impactTime + 2.15);

      lfo.connect(rumbleGain.gain);
      rumbleSource.connect(rumbleFilter);
      rumbleFilter.connect(rumbleGain);
      rumbleGain.connect(this.masterGain);

      lfo.start(impactTime);
      rumbleSource.start(impactTime + 0.05);
      lfo.stop(impactTime + 2.2);
      rumbleSource.stop(impactTime + 2.2);
    }
  }

  /**
   * 17. Doctor Strange — 4-Stage Sling Ring Portal, Kamar-Taj Eldritch Mandala & Astral Shimmer
   * Stage 1: Kamar-Taj sling ring portal ignition whoosh & spinning sparks
   * Stage 2: Sacred geometry mandala bell arpeggio (7-note pentatonic glass chime)
   * Stage 3: Astral phase chorus & Eye of Agamotto time shimmer
   * Stage 4: Deep mystical dimensional hum & cosmic resonance
   */
  public playHeroMystic(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // ── STAGE 1: Sling Ring Portal Spark Ignition Whoosh (0ms - 120ms) ──
    const sparkBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.15), ctx.sampleRate);
    const sparkData = sparkBuffer.getChannelData(0);
    for (let i = 0; i < sparkData.length; i++) {
      sparkData[i] = (Math.random() * 2 - 1) * Math.sin((i / sparkData.length) * Math.PI);
    }
    const sparkNoise = ctx.createBufferSource();
    sparkNoise.buffer = sparkBuffer;

    const sparkFilter = ctx.createBiquadFilter();
    sparkFilter.type = 'bandpass';
    sparkFilter.frequency.setValueAtTime(3600, now);
    sparkFilter.frequency.linearRampToValueAtTime(1200, now + 0.14);

    const sparkGain = ctx.createGain();
    sparkGain.gain.setValueAtTime(0.001, now);
    sparkGain.gain.linearRampToValueAtTime(0.35, now + 0.02);
    sparkGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

    sparkNoise.connect(sparkFilter);
    sparkFilter.connect(sparkGain);
    sparkGain.connect(this.masterGain);
    sparkNoise.start(now);

    // ── STAGE 2: Sacred Geometry Mandala Bell Arpeggio (Kamar-Taj Pentatonic) ──
    const mandalaPitches = [370.0, 466.16, 554.37, 739.99, 830.61, 1108.73, 1479.98];
    mandalaPitches.forEach((freq, idx) => {
      const noteTime = now + 0.03 + idx * 0.045;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, noteTime);
      osc1.detune.setValueAtTime(-8, noteTime);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2.01, noteTime);
      osc2.detune.setValueAtTime(8, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.3, noteTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.75);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain!);

      osc1.start(noteTime);
      osc2.start(noteTime);
      osc1.stop(noteTime + 0.8);
      osc2.stop(noteTime + 0.8);
    });

    // ── STAGE 3 & 4: Astral Phase Chorus & Dimensional Low Drone (0.8s) ──
    const droneOsc = ctx.createOscillator();
    const droneGain = ctx.createGain();
    droneOsc.type = 'sine';
    droneOsc.frequency.setValueAtTime(108, now + 0.05);
    droneOsc.frequency.linearRampToValueAtTime(72, now + 0.95);

    droneGain.gain.setValueAtTime(0.001, now + 0.05);
    droneGain.gain.linearRampToValueAtTime(0.45, now + 0.12);
    droneGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

    droneOsc.connect(droneGain);
    droneGain.connect(this.masterGain);
    droneOsc.start(now + 0.05);
    droneOsc.stop(now + 1.15);
  }

  /**
   * 18. Spider-Man & Miles Morales — 4-Stage Dual Trigger Click, Pneumatic THWIP, Elastic Web Zip & Impact
   * Stage 1: Dual mechanical trigger clicks (CLICK-CLICK)
   * Stage 2: High-pressure pneumatic CO2 gas "THWIP" burst
   * Stage 3: High-tension web fluid tensile elasticity whip zip (2400Hz -> 360Hz)
   * Stage 4: Web impact sticking firmly to surface (THWAP)
   */
  public playHeroWeb(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // ── STAGE 1: Dual Mechanical Valve Trigger Clicks (0ms & 20ms) ──
    [0, 0.02].forEach((offset) => {
      const t = now + offset;
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'sine';
      clickOsc.frequency.setValueAtTime(3100, t);
      clickOsc.frequency.exponentialRampToValueAtTime(450, t + 0.02);

      clickGain.gain.setValueAtTime(0.001, t);
      clickGain.gain.linearRampToValueAtTime(0.45, t + 0.001);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);

      clickOsc.connect(clickGain);
      clickGain.connect(this.masterGain!);
      clickOsc.start(t);
      clickOsc.stop(t + 0.03);
    });

    // ── STAGE 2: High-Pressure Pneumatic "THWIP" Gas Pop (20ms - 90ms) ──
    const popTime = now + 0.015;
    const popBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.1), ctx.sampleRate);
    const popData = popBuffer.getChannelData(0);
    for (let i = 0; i < popData.length; i++) {
      popData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (popData.length * 0.12));
    }
    const popNoise = ctx.createBufferSource();
    popNoise.buffer = popBuffer;

    const popFilter = ctx.createBiquadFilter();
    popFilter.type = 'bandpass';
    popFilter.frequency.setValueAtTime(3400, popTime);
    popFilter.frequency.exponentialRampToValueAtTime(750, popTime + 0.08);

    const popGain = ctx.createGain();
    popGain.gain.setValueAtTime(0.001, popTime);
    popGain.gain.linearRampToValueAtTime(0.6, popTime + 0.006);
    popGain.gain.exponentialRampToValueAtTime(0.0001, popTime + 0.09);

    popNoise.connect(popFilter);
    popFilter.connect(popGain);
    popGain.connect(this.masterGain);
    popNoise.start(popTime);

    // ── STAGE 3: Tensile Elastic Web Whip Zip (25ms - 260ms) ──
    const zipOsc = ctx.createOscillator();
    const zipGain = ctx.createGain();
    zipOsc.type = 'triangle';
    zipOsc.frequency.setValueAtTime(2400, now + 0.025);
    zipOsc.frequency.exponentialRampToValueAtTime(360, now + 0.24);

    zipGain.gain.setValueAtTime(0.001, now + 0.025);
    zipGain.gain.linearRampToValueAtTime(0.42, now + 0.04);
    zipGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);

    zipOsc.connect(zipGain);
    zipGain.connect(this.masterGain);
    zipOsc.start(now + 0.025);
    zipOsc.stop(now + 0.28);

    // ── STAGE 4: Web Surface Sticking "THWAP" Impact (200ms) ──
    const thwapTime = now + 0.2;
    const thwapOsc = ctx.createOscillator();
    const thwapGain = ctx.createGain();
    thwapOsc.type = 'triangle';
    thwapOsc.frequency.setValueAtTime(450, thwapTime);
    thwapOsc.frequency.exponentialRampToValueAtTime(110, thwapTime + 0.06);

    thwapGain.gain.setValueAtTime(0.001, thwapTime);
    thwapGain.gain.linearRampToValueAtTime(0.35, thwapTime + 0.003);
    thwapGain.gain.exponentialRampToValueAtTime(0.0001, thwapTime + 0.07);

    thwapOsc.connect(thwapGain);
    thwapGain.connect(this.masterGain);
    thwapOsc.start(thwapTime);
    thwapOsc.stop(thwapTime + 0.08);
  }

  /**
   * 19. Black Panther — 3-Stage Wakandan Kinetic Suit Absorption, Detonation & Claw Ring
   * Stage 1: Kinetic suit energy absorption rising hum (65Hz -> 220Hz)
   * Stage 2: Kinetic shockwave detonation: explosive purple kinetic blast
   * Stage 3: Vibranium micro-weave energy sizzle & razor claw unsheathe
   */
  public playHeroVibranium(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const distortion = this.makeDistortionCurve(18);

    // ── STAGE 1: Kinetic Energy Absorption Rising Hum (0ms - 140ms) ──
    const charge = ctx.createOscillator();
    const chargeGain = ctx.createGain();
    charge.type = 'sine';
    charge.frequency.setValueAtTime(65, now);
    charge.frequency.exponentialRampToValueAtTime(220, now + 0.14);

    chargeGain.gain.setValueAtTime(0.001, now);
    chargeGain.gain.linearRampToValueAtTime(0.5, now + 0.12);
    chargeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    charge.connect(chargeGain);
    chargeGain.connect(this.masterGain);
    charge.start(now);
    charge.stop(now + 0.16);

    // ── STAGE 2: Kinetic Explosive Discharge Blast (140ms - 500ms) ──
    const pulseTime = now + 0.13;
    const pulseOsc = ctx.createOscillator();
    const pulseGain = ctx.createGain();
    const pulseShaper = ctx.createWaveShaper();
    pulseShaper.curve = distortion as any;

    pulseOsc.type = 'triangle';
    pulseOsc.frequency.setValueAtTime(200, pulseTime);
    pulseOsc.frequency.exponentialRampToValueAtTime(30, pulseTime + 0.45);

    pulseGain.gain.setValueAtTime(0.001, pulseTime);
    pulseGain.gain.linearRampToValueAtTime(0.85, pulseTime + 0.012);
    pulseGain.gain.exponentialRampToValueAtTime(0.0001, pulseTime + 0.5);

    pulseOsc.connect(pulseShaper);
    pulseShaper.connect(pulseGain);
    pulseGain.connect(this.masterGain);
    pulseOsc.start(pulseTime);
    pulseOsc.stop(pulseTime + 0.55);

    // ── STAGE 3: Vibranium Claw Ring & Energy Sizzle ──
    const ring = ctx.createOscillator();
    const ringGain = ctx.createGain();
    ring.type = 'sine';
    ring.frequency.setValueAtTime(1580, pulseTime);
    ring.frequency.exponentialRampToValueAtTime(950, pulseTime + 0.4);

    ringGain.gain.setValueAtTime(0.001, pulseTime);
    ringGain.gain.linearRampToValueAtTime(0.32, pulseTime + 0.005);
    ringGain.gain.exponentialRampToValueAtTime(0.0001, pulseTime + 0.45);

    ring.connect(ringGain);
    ringGain.connect(this.masterGain);
    ring.start(pulseTime);
    ring.stop(pulseTime + 0.5);
  }

  /**
   * 20. Thanos & Galactus — 4-Stage Uru Gauntlet Clink, The SNAP, 6 Infinity Stones & Void Collapse
   * Stage 1: Heavy Uru metal gauntlet armor clink
   * Stage 2: The SNAP — crisp supersonic finger snap transient
   * Stage 3: Cosmic chords of the 6 Infinity Stones
   * Stage 4: Abyssal black-hole vacuum thud
   */
  public playHeroSnap(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // ── STAGE 1: Uru Metal Gauntlet Clink (0ms - 40ms) ──
    const clink = ctx.createOscillator();
    const clinkGain = ctx.createGain();
    clink.type = 'triangle';
    clink.frequency.setValueAtTime(1200, now);
    clink.frequency.exponentialRampToValueAtTime(450, now + 0.035);

    clinkGain.gain.setValueAtTime(0.001, now);
    clinkGain.gain.linearRampToValueAtTime(0.3, now + 0.002);
    clinkGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    clink.connect(clinkGain);
    clinkGain.connect(this.masterGain);
    clink.start(now);
    clink.stop(now + 0.045);

    // ── STAGE 2: The SNAP — Supersonic Transient (35ms - 80ms) ──
    const snapTime = now + 0.035;
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(4200, snapTime);
    snapOsc.frequency.exponentialRampToValueAtTime(480, snapTime + 0.03);

    snapGain.gain.setValueAtTime(0.001, snapTime);
    snapGain.gain.linearRampToValueAtTime(0.8, snapTime + 0.001);
    snapGain.gain.exponentialRampToValueAtTime(0.0001, snapTime + 0.045);

    snapOsc.connect(snapGain);
    snapGain.connect(this.masterGain);
    snapOsc.start(snapTime);
    snapOsc.stop(snapTime + 0.05);

    // ── STAGE 3: Harmony of all 6 Infinity Stones ──
    const stonePitches = [
      587.33,  // Reality (Red)
      698.46,  // Soul (Orange)
      783.99,  // Power (Purple)
      880.00,  // Space (Blue)
      1046.50, // Mind (Yellow)
      1174.66, // Time (Green)
    ];

    stonePitches.forEach((freq, i) => {
      const stoneTime = snapTime + 0.015 + i * 0.02;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, stoneTime);
      // Cosmic reality warp plunge
      osc.frequency.exponentialRampToValueAtTime(freq * 0.32, stoneTime + 0.8);

      gain.gain.setValueAtTime(0.001, stoneTime);
      gain.gain.linearRampToValueAtTime(0.25, stoneTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, stoneTime + 0.85);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(stoneTime);
      osc.stop(stoneTime + 0.9);
    });

    // ── STAGE 4: Abyssal Black-Hole Vacuum Collapse ──
    const voidOsc = ctx.createOscillator();
    const voidGain = ctx.createGain();
    voidOsc.type = 'sine';
    voidOsc.frequency.setValueAtTime(120, snapTime + 0.03);
    voidOsc.frequency.exponentialRampToValueAtTime(26, snapTime + 1.1);

    voidGain.gain.setValueAtTime(0.001, snapTime + 0.03);
    voidGain.gain.linearRampToValueAtTime(0.7, snapTime + 0.08);
    voidGain.gain.exponentialRampToValueAtTime(0.0001, snapTime + 1.15);

    voidOsc.connect(voidGain);
    voidGain.connect(this.masterGain);
    voidOsc.start(snapTime + 0.03);
    voidOsc.stop(snapTime + 1.2);
  }

  /**
   * 21. Scarlet Witch & Jean Grey — 3-Stage Reality-Warping Chaos Hex Surge
   * Stage 1: Dark hex whisper & minor second clash (Eb5 + E5)
   * Stage 2: Reality-warping chaotic bandpass sweep
   * Stage 3: Deep red magic sub-bass detonation
   */
  public playHeroChaos(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Dissonant minor second chaos cluster (Eb5 & E5)
    const freqs = [622.25, 659.25, 932.33, 1244.5];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.linearRampToValueAtTime(f * 1.2, now + 0.35);
      osc.frequency.exponentialRampToValueAtTime(f * 0.65, now + 0.85);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600, now);
      filter.frequency.exponentialRampToValueAtTime(420, now + 0.85);
      filter.Q.setValueAtTime(4.5, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.32, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + 0.95);
    });

    // Sub-bass reality warp pulse
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'triangle';
    sub.frequency.setValueAtTime(160, now);
    sub.frequency.exponentialRampToValueAtTime(32, now + 0.6);

    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.linearRampToValueAtTime(0.6, now + 0.03);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

    sub.connect(subGain);
    subGain.connect(this.masterGain);
    sub.start(now);
    sub.stop(now + 0.7);
  }

  /**
   * 22. Captain Marvel — 4-Stage Cosmic Stellar Ascension, Photon Blast & Sonic Boom
   * Stage 1: Binary cosmic stellar ignition sweep (450Hz -> 3200Hz)
   * Stage 2: Supersonic photon blast detonation
   * Stage 3: Stellar cosmic shockwave pink noise wash
   * Stage 4: Concussive space sonic boom
   */
  public playHeroPhoton(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const distortion = this.makeDistortionCurve(20);

    // Stellar power charge
    const ascOsc = ctx.createOscillator();
    const ascGain = ctx.createGain();
    ascOsc.type = 'sine';
    ascOsc.frequency.setValueAtTime(450, now);
    ascOsc.frequency.exponentialRampToValueAtTime(3200, now + 0.14);

    ascGain.gain.setValueAtTime(0.001, now);
    ascGain.gain.linearRampToValueAtTime(0.35, now + 0.12);
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
    blast.frequency.setValueAtTime(2600, blastTime);
    blast.frequency.exponentialRampToValueAtTime(85, blastTime + 0.28);

    blastGain.gain.setValueAtTime(0.001, blastTime);
    blastGain.gain.linearRampToValueAtTime(0.8, blastTime + 0.01);
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
      beamGain.gain.linearRampToValueAtTime(0.45, blastTime + 0.015);
      beamGain.gain.exponentialRampToValueAtTime(0.0001, blastTime + 0.35);

      beamSource.connect(beamFilter);
      beamFilter.connect(beamGain);
      beamGain.connect(this.masterGain);

      beamSource.start(blastTime);
      beamSource.stop(blastTime + 0.36);
    }
  }

  /**
   * 23. Hawkeye — 4-Stage Tension Creak, Bowstring Release Twang, Whistling Arrow & Target Hit
   */
  public playHeroArrow(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Bowstring release twang
    const twang = ctx.createOscillator();
    const twangGain = ctx.createGain();
    twang.type = 'triangle';
    twang.frequency.setValueAtTime(520, now);
    twang.frequency.exponentialRampToValueAtTime(140, now + 0.08);

    twangGain.gain.setValueAtTime(0.001, now);
    twangGain.gain.linearRampToValueAtTime(0.55, now + 0.003);
    twangGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

    twang.connect(twangGain);
    twangGain.connect(this.masterGain);
    twang.start(now);
    twang.stop(now + 0.11);

    // Supersonic arrow whistle
    const whistle = ctx.createOscillator();
    const whistleGain = ctx.createGain();
    whistle.type = 'sine';
    whistle.frequency.setValueAtTime(2400, now + 0.03);
    whistle.frequency.exponentialRampToValueAtTime(1300, now + 0.15);

    whistleGain.gain.setValueAtTime(0.001, now + 0.03);
    whistleGain.gain.linearRampToValueAtTime(0.3, now + 0.06);
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
    impact.frequency.setValueAtTime(340, impactTime);
    impact.frequency.exponentialRampToValueAtTime(75, impactTime + 0.08);

    impactGain.gain.setValueAtTime(0.001, impactTime);
    impactGain.gain.linearRampToValueAtTime(0.65, impactTime + 0.002);
    impactGain.gain.exponentialRampToValueAtTime(0.0001, impactTime + 0.09);

    impact.connect(impactGain);
    impactGain.connect(this.masterGain);
    impact.start(impactTime);
    impact.stop(impactTime + 0.1);
  }

  /**
   * 24. Loki — 3-Stage Scepter Emerald Glow, Deceptive Illusion Pitch Drift & Whisper Shimmer
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
      osc.frequency.linearRampToValueAtTime(freq * 0.95, noteTime + 0.45);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.3, noteTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.55);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(noteTime);
      osc.stop(noteTime + 0.6);
    });
  }

  /**
   * 25. Deadpool — 3-Stage Dual Katana Clash "SHING!", Gun Cock & Spent Brass Clatter
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
      gain.gain.linearRampToValueAtTime(0.38, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now);
      osc.stop(now + 0.5);
    });

    // Pistol slide rack & double pop at t+0.12s & t+0.2s
    [0.12, 0.2].forEach((offset) => {
      const popTime = now + offset;
      const popOsc = ctx.createOscillator();
      const popGain = ctx.createGain();
      popOsc.type = 'square';
      popOsc.frequency.setValueAtTime(850, popTime);
      popOsc.frequency.exponentialRampToValueAtTime(85, popTime + 0.06);

      popGain.gain.setValueAtTime(0.001, popTime);
      popGain.gain.linearRampToValueAtTime(0.48, popTime + 0.002);
      popGain.gain.exponentialRampToValueAtTime(0.0001, popTime + 0.07);

      popOsc.connect(popGain);
      popGain.connect(this.masterGain!);
      popOsc.start(popTime);
      popOsc.stop(popTime + 0.08);
    });
  }

  /**
   * 26. Black Widow — 3-Stage Tactical Combat Roll, Widow's Bite Electroshock Taser & Whip
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
    taserGain.gain.linearRampToValueAtTime(0.5, now + 0.005);
    taserGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    taser.connect(taserGain);
    taserGain.connect(this.masterGain);
    taser.start(now);
    taser.stop(now + 0.25);

    // High-frequency electro-snap whip
    const whip = ctx.createOscillator();
    const whipGain = ctx.createGain();
    whip.type = 'sawtooth';
    whip.frequency.setValueAtTime(3400, now);
    whip.frequency.exponentialRampToValueAtTime(420, now + 0.08);

    whipGain.gain.setValueAtTime(0.001, now);
    whipGain.gain.linearRampToValueAtTime(0.4, now + 0.002);
    whipGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

    whip.connect(whipGain);
    whipGain.connect(this.masterGain);
    whip.start(now);
    whip.stop(now + 0.12);
  }

  /**
   * 27. Wolverine — 3-Stage "SNIKT!" 3-Claw Unsheathe, Supersonic Cross-Slash & Ring
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
      osc.frequency.setValueAtTime(2400 + idx * 450, t);
      osc.frequency.exponentialRampToValueAtTime(850, t + 0.04);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.38, t + 0.002);
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
    slash.frequency.setValueAtTime(3600, now + 0.05);
    slash.frequency.exponentialRampToValueAtTime(550, now + 0.45);

    slashGain.gain.setValueAtTime(0.001, now + 0.05);
    slashGain.gain.linearRampToValueAtTime(0.45, now + 0.06);
    slashGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    slash.connect(slashGain);
    slashGain.connect(this.masterGain);
    slash.start(now + 0.05);
    slash.stop(now + 0.55);
  }

  /**
   * 28. Magneto — 3-Stage Electromagnetic Induction, Ferrous Metal Crush & EMP Shockwave
   */
  public playHeroMagnetic(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const distortion = this.makeDistortionCurve(22);

    // 1. Electromagnetic field induction hum (55Hz -> 220Hz)
    const hum = ctx.createOscillator();
    const humGain = ctx.createGain();
    hum.type = 'sawtooth';
    hum.frequency.setValueAtTime(55, now);
    hum.frequency.exponentialRampToValueAtTime(220, now + 0.16);

    humGain.gain.setValueAtTime(0.001, now);
    humGain.gain.linearRampToValueAtTime(0.4, now + 0.1);
    humGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    hum.connect(humGain);
    humGain.connect(this.masterGain);
    hum.start(now);
    hum.stop(now + 0.2);

    // 2. Metal crushing & twisting screech
    const crushTime = now + 0.14;
    const screech = ctx.createOscillator();
    const screechGain = ctx.createGain();
    const screechFilter = ctx.createBiquadFilter();
    screech.type = 'sawtooth';
    screech.frequency.setValueAtTime(1900, crushTime);
    screech.frequency.exponentialRampToValueAtTime(420, crushTime + 0.35);

    screechFilter.type = 'bandpass';
    screechFilter.frequency.setValueAtTime(1400, crushTime);
    screechFilter.Q.setValueAtTime(3.5, crushTime);

    screechGain.gain.setValueAtTime(0.001, crushTime);
    screechGain.gain.linearRampToValueAtTime(0.5, crushTime + 0.01);
    screechGain.gain.exponentialRampToValueAtTime(0.0001, crushTime + 0.4);

    screech.connect(screechFilter);
    screechFilter.connect(screechGain);
    screechGain.connect(this.masterGain);
    screech.start(crushTime);
    screech.stop(crushTime + 0.45);

    // 3. EMP sub-bass shockwave detonation
    const emp = ctx.createOscillator();
    const empGain = ctx.createGain();
    const empShaper = ctx.createWaveShaper();
    empShaper.curve = distortion as any;

    emp.type = 'triangle';
    emp.frequency.setValueAtTime(180, crushTime);
    emp.frequency.exponentialRampToValueAtTime(28, crushTime + 0.4);

    empGain.gain.setValueAtTime(0.001, crushTime);
    empGain.gain.linearRampToValueAtTime(0.75, crushTime + 0.015);
    empGain.gain.exponentialRampToValueAtTime(0.0001, crushTime + 0.45);

    emp.connect(empShaper);
    empShaper.connect(empGain);
    empGain.connect(this.masterGain);
    emp.start(crushTime);
    emp.stop(crushTime + 0.5);
  }

  /**
   * 29. Groot — 3-Stage Giant Timber Creak, Subterranean Root Surge & Bedrock Impact
   */
  public playHeroGroot(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // 1. Ancient wood fiber tension & creaking branches
    const creak = ctx.createOscillator();
    const creakGain = ctx.createGain();
    creak.type = 'sawtooth';
    creak.frequency.setValueAtTime(180, now);
    creak.frequency.linearRampToValueAtTime(360, now + 0.1);
    creak.frequency.exponentialRampToValueAtTime(90, now + 0.22);

    creakGain.gain.setValueAtTime(0.001, now);
    creakGain.gain.linearRampToValueAtTime(0.35, now + 0.05);
    creakGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    creak.connect(creakGain);
    creakGain.connect(this.masterGain);
    creak.start(now);
    creak.stop(now + 0.26);

    // 2. Subterranean root eruption through earth (crunch)
    const surgeTime = now + 0.12;
    const rootBuffer = this.createBrownNoiseBuffer(0.5);
    if (rootBuffer) {
      const rootSource = ctx.createBufferSource();
      rootSource.buffer = rootBuffer;

      const rootFilter = ctx.createBiquadFilter();
      rootFilter.type = 'lowpass';
      rootFilter.frequency.setValueAtTime(450, surgeTime);
      rootFilter.frequency.exponentialRampToValueAtTime(80, surgeTime + 0.4);

      const rootGain = ctx.createGain();
      rootGain.gain.setValueAtTime(0.001, surgeTime);
      rootGain.gain.linearRampToValueAtTime(0.7, surgeTime + 0.01);
      rootGain.gain.exponentialRampToValueAtTime(0.0001, surgeTime + 0.45);

      rootSource.connect(rootFilter);
      rootFilter.connect(rootGain);
      rootGain.connect(this.masterGain);

      rootSource.start(surgeTime);
      rootSource.stop(surgeTime + 0.5);
    }

    // 3. Deep timber resonance
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'triangle';
    sub.frequency.setValueAtTime(140, surgeTime);
    sub.frequency.exponentialRampToValueAtTime(35, surgeTime + 0.45);

    subGain.gain.setValueAtTime(0.001, surgeTime);
    subGain.gain.linearRampToValueAtTime(0.65, surgeTime + 0.015);
    subGain.gain.exponentialRampToValueAtTime(0.0001, surgeTime + 0.5);

    sub.connect(subGain);
    subGain.connect(this.masterGain);
    sub.start(surgeTime);
    sub.stop(surgeTime + 0.55);
  }
}

export const soundManager = new SoundManager();
