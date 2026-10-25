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

      // Studio Master Limiter / Dynamics Compressor (guarantees zero digital clipping and cohesive commercial punch)
      const masterCompressor = this.ctx.createDynamicsCompressor();
      masterCompressor.threshold.setValueAtTime(-2.5, this.ctx.currentTime);
      masterCompressor.knee.setValueAtTime(6, this.ctx.currentTime);
      masterCompressor.ratio.setValueAtTime(14, this.ctx.currentTime);
      masterCompressor.attack.setValueAtTime(0.002, this.ctx.currentTime);
      masterCompressor.release.setValueAtTime(0.12, this.ctx.currentTime);

      // Studio Master Soft EQ (warmth + silky rolloff to eliminate harsh digital shrieks on phone speakers)
      const masterLowShelf = this.ctx.createBiquadFilter();
      masterLowShelf.type = 'lowshelf';
      masterLowShelf.frequency.setValueAtTime(90, this.ctx.currentTime);
      masterLowShelf.gain.setValueAtTime(1.5, this.ctx.currentTime);

      const masterHighShelf = this.ctx.createBiquadFilter();
      masterHighShelf.type = 'highshelf';
      masterHighShelf.frequency.setValueAtTime(7500, this.ctx.currentTime);
      masterHighShelf.gain.setValueAtTime(-1.2, this.ctx.currentTime);

      this.masterGain.connect(masterLowShelf);
      masterLowShelf.connect(masterHighShelf);
      masterHighShelf.connect(masterCompressor);
      masterCompressor.connect(this.ctx.destination);
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
   * 1. Infinity Stone Pick — Prismatic Cosmic Crystal Chime
   * Tuned to circular plate overtone modes: f0, 2.756*f0, 5.404*f0
   * with pristine diamond transient & celestial harmonic decay
   */
  public playGemClick(color?: CrystalColor): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const stoneConfig: Record<string, { f0: number; gain: number }> = {
      topaz:    { f0: 1174.66, gain: 0.32 }, // Mind — Brilliant high D6
      sapphire: { f0: 987.77,  gain: 0.34 }, // Space — Cosmic B5
      emerald:  { f0: 1318.51, gain: 0.30 }, // Time — Radiant E6
      ruby:     { f0: 739.99,  gain: 0.36 }, // Reality — Punchy F#5
      amethyst: { f0: 830.61,  gain: 0.35 }, // Power — Royal violet G#5
      obsidian: { f0: 622.25,  gain: 0.38 }, // Soul — Warm amber Eb5
      gold:     { f0: 880.00,  gain: 0.34 }, // S.H.I.E.L.D. — Titanium A5
    };

    const cfg = (color && stoneConfig[color]) ? stoneConfig[color] : { f0: 880, gain: 0.34 };
    const f0 = cfg.f0;

    // ── Layer 1: Fundamental Sine Bell ──
    const bell = ctx.createOscillator();
    const bellGain = ctx.createGain();
    bell.type = 'sine';
    bell.frequency.setValueAtTime(f0, now);

    bellGain.gain.setValueAtTime(0.001, now);
    bellGain.gain.linearRampToValueAtTime(cfg.gain, now + 0.003);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);

    bell.connect(bellGain);
    bellGain.connect(this.masterGain);
    bell.start(now);
    bell.stop(now + 0.52);

    // ── Layer 2: 1st Inharmonic Glass Mode (2.756 * f0) ──
    const mode1 = ctx.createOscillator();
    const mode1Gain = ctx.createGain();
    mode1.type = 'triangle';
    mode1.frequency.setValueAtTime(f0 * 2.756, now);

    mode1Gain.gain.setValueAtTime(0.001, now);
    mode1Gain.gain.linearRampToValueAtTime(cfg.gain * 0.38, now + 0.002);
    mode1Gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    mode1.connect(mode1Gain);
    mode1Gain.connect(this.masterGain);
    mode1.start(now);
    mode1.stop(now + 0.25);

    // ── Layer 3: 2nd Crystal Shimmer Mode (5.404 * f0) ──
    const mode2 = ctx.createOscillator();
    const mode2Gain = ctx.createGain();
    const mode2Filter = ctx.createBiquadFilter();
    mode2.type = 'sine';
    mode2.frequency.setValueAtTime(f0 * 5.404, now);
    mode2Filter.type = 'lowpass';
    mode2Filter.frequency.setValueAtTime(6800, now);

    mode2Gain.gain.setValueAtTime(0.001, now);
    mode2Gain.gain.linearRampToValueAtTime(cfg.gain * 0.18, now + 0.001);
    mode2Gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    mode2.connect(mode2Filter);
    mode2Filter.connect(mode2Gain);
    mode2Gain.connect(this.masterGain);
    mode2.start(now);
    mode2.stop(now + 0.15);

    // ── Layer 4: Soft Diamond Strike Transient (zero harsh square waves) ──
    const strike = ctx.createOscillator();
    const strikeGain = ctx.createGain();
    const strikeFilter = ctx.createBiquadFilter();
    strike.type = 'triangle';
    strike.frequency.setValueAtTime(3600, now);
    strike.frequency.exponentialRampToValueAtTime(1200, now + 0.008);

    strikeFilter.type = 'bandpass';
    strikeFilter.frequency.setValueAtTime(3200, now);
    strikeFilter.Q.setValueAtTime(3.5, now);

    strikeGain.gain.setValueAtTime(0.001, now);
    strikeGain.gain.linearRampToValueAtTime(0.2, now + 0.001);
    strikeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);

    strike.connect(strikeFilter);
    strikeFilter.connect(strikeGain);
    strikeGain.connect(this.masterGain);
    strike.start(now);
    strike.stop(now + 0.015);
  }

  /**
   * 2. Gem Deselect — Magnetic Lift & Air Decouple
   * Replaces amateur cartoon pitch drops with an ultra-clean tactile lift clink + air release
   */
  public playGemDeselect(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Layer 1: Decouple pip 1 (high crystal detachment)
    const pip1 = ctx.createOscillator();
    const pip1Gain = ctx.createGain();
    pip1.type = 'triangle';
    pip1.frequency.setValueAtTime(1480, now);
    pip1.frequency.exponentialRampToValueAtTime(920, now + 0.015);

    pip1Gain.gain.setValueAtTime(0.001, now);
    pip1Gain.gain.linearRampToValueAtTime(0.18, now + 0.001);
    pip1Gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

    pip1.connect(pip1Gain);
    pip1Gain.connect(this.masterGain);
    pip1.start(now);
    pip1.stop(now + 0.03);

    // Layer 2: Decouple pip 2 (low air pop)
    const t2 = now + 0.012;
    const pip2 = ctx.createOscillator();
    const pip2Gain = ctx.createGain();
    pip2.type = 'sine';
    pip2.frequency.setValueAtTime(640, t2);
    pip2.frequency.exponentialRampToValueAtTime(320, t2 + 0.03);

    pip2Gain.gain.setValueAtTime(0.001, t2);
    pip2Gain.gain.linearRampToValueAtTime(0.16, t2 + 0.002);
    pip2Gain.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.04);

    pip2.connect(pip2Gain);
    pip2Gain.connect(this.masterGain);
    pip2.start(t2);
    pip2.stop(t2 + 0.05);
  }

  /**
   * 3. Gem Collect — Infinity Harvest Arpeggio
   * Cinematic Lydian chord cascade (F#5, A5, C#6, E6) + metallic stone clink + sub-absorption thump
   */
  public playGemCollect(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Harmonic Celestial Arpeggio (F#5, A5, C#6, E6)
    const notes = [739.99, 880.00, 1108.73, 1318.51];
    notes.forEach((freq, idx) => {
      if (!ctx || !this.masterGain) return;
      const t = now + idx * 0.042;

      // Pure bell
      const bell = ctx.createOscillator();
      const bellG = ctx.createGain();
      bell.type = 'sine';
      bell.frequency.setValueAtTime(freq, t);

      bellG.gain.setValueAtTime(0.001, t);
      bellG.gain.linearRampToValueAtTime(0.24 - idx * 0.02, t + 0.003);
      bellG.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

      bell.connect(bellG);
      bellG.connect(this.masterGain);
      bell.start(t);
      bell.stop(t + 0.38);

      // Physical gem-stone clack transient
      const clack = ctx.createOscillator();
      const clackG = ctx.createGain();
      const clackF = ctx.createBiquadFilter();
      clack.type = 'triangle';
      clack.frequency.setValueAtTime(freq * 2.5, t);

      clackF.type = 'bandpass';
      clackF.frequency.setValueAtTime(2600, t);
      clackF.Q.setValueAtTime(4.0, t);

      clackG.gain.setValueAtTime(0.001, t);
      clackG.gain.linearRampToValueAtTime(0.14, t + 0.001);
      clackG.gain.exponentialRampToValueAtTime(0.0001, t + 0.018);

      clack.connect(clackF);
      clackF.connect(clackG);
      clackG.connect(this.masterGain);
      clack.start(t);
      clack.stop(t + 0.022);
    });

    // Sub-bass absorption thump (settling into Gauntlet)
    const settle = ctx.createOscillator();
    const settleG = ctx.createGain();
    settle.type = 'sine';
    settle.frequency.setValueAtTime(85, now + 0.12);
    settle.frequency.exponentialRampToValueAtTime(36, now + 0.32);

    settleG.gain.setValueAtTime(0.001, now + 0.12);
    settleG.gain.linearRampToValueAtTime(0.28, now + 0.13);
    settleG.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

    settle.connect(settleG);
    settleG.connect(this.masterGain);
    settle.start(now + 0.12);
    settle.stop(now + 0.4);

    // Final starlight shimmer
    const shimmer = ctx.createOscillator();
    const shimmerG = ctx.createGain();
    shimmer.type = 'sine';
    shimmer.frequency.setValueAtTime(2217, now + 0.2);
    shimmer.frequency.exponentialRampToValueAtTime(3520, now + 0.45);

    shimmerG.gain.setValueAtTime(0.001, now + 0.2);
    shimmerG.gain.linearRampToValueAtTime(0.1, now + 0.23);
    shimmerG.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    shimmer.connect(shimmerG);
    shimmerG.connect(this.masterGain);
    shimmer.start(now + 0.2);
    shimmer.stop(now + 0.52);
  }

  /**
   * 4. Hero Recruited / Card Purchased
   *    Tier 1 — Street Recruit: Carbon card flick + magnetic latch clack + major third bloom
   *    Tier 2 — Heroes & Villains: Arc power surge + heroic brass triad + vibranium bloom
   *    Tier 3 — Cosmic Entity / Thanos: Hollywood BRAAAM + Uru anvil strike + cosmic portal chord + star warp
   */
  public playCardBuy(tier: number = 1): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    if (tier === 1) {
      // ── Tier 1: Carbon card flick + magnetic latch clack ──
      // Phase 1: Card Slide Swish
      const slide = ctx.createOscillator();
      const slideG = ctx.createGain();
      const slideF = ctx.createBiquadFilter();
      slide.type = 'triangle';
      slide.frequency.setValueAtTime(450, now);
      slide.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
      slideF.type = 'bandpass';
      slideF.frequency.setValueAtTime(1200, now);
      slideF.Q.setValueAtTime(2.0, now);

      slideG.gain.setValueAtTime(0.001, now);
      slideG.gain.linearRampToValueAtTime(0.16, now + 0.02);
      slideG.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

      slide.connect(slideF);
      slideF.connect(slideG);
      slideG.connect(this.masterGain);
      slide.start(now);
      slide.stop(now + 0.1);

      // Phase 2: Solid Mechanical Latch Clack
      const latchTime = now + 0.07;
      const latch = ctx.createOscillator();
      const latchG = ctx.createGain();
      latch.type = 'sine';
      latch.frequency.setValueAtTime(320, latchTime);
      latch.frequency.exponentialRampToValueAtTime(75, latchTime + 0.04);

      latchG.gain.setValueAtTime(0.001, latchTime);
      latchG.gain.linearRampToValueAtTime(0.35, latchTime + 0.002);
      latchG.gain.exponentialRampToValueAtTime(0.0001, latchTime + 0.06);

      latch.connect(latchG);
      latchG.connect(this.masterGain);
      latch.start(latchTime);
      latch.stop(latchTime + 0.08);

      // Phase 3: Major Third Confirmation Bloom (E5 -> G#5)
      [659.25, 830.61].forEach((freq, idx) => {
        if (!ctx || !this.masterGain) return;
        const t = latchTime + idx * 0.03;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.24, t + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

        osc.connect(g);
        g.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.38);
      });

    } else if (tier === 2) {
      // ── Tier 2: Hero & Villain — Arc Power Surge + Heroic Brass Triad ──
      // Phase 1: Power-up charge
      const charge = ctx.createOscillator();
      const chargeG = ctx.createGain();
      const chargeF = ctx.createBiquadFilter();
      charge.type = 'sawtooth';
      charge.frequency.setValueAtTime(110, now);
      charge.frequency.exponentialRampToValueAtTime(620, now + 0.18);
      chargeF.type = 'lowpass';
      chargeF.frequency.setValueAtTime(1600, now);

      chargeG.gain.setValueAtTime(0.001, now);
      chargeG.gain.linearRampToValueAtTime(0.22, now + 0.06);
      chargeG.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

      charge.connect(chargeF);
      chargeF.connect(chargeG);
      chargeG.connect(this.masterGain);
      charge.start(now);
      charge.stop(now + 0.22);

      // Phase 2: Heroic Brass Triad (B3, F#4, B4, D#5)
      const hitTime = now + 0.16;
      const notes = [246.94, 369.99, 493.88, 622.25];
      notes.forEach((freq, idx) => {
        if (!ctx || !this.masterGain) return;
        const t = hitTime + idx * 0.015;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const f = ctx.createBiquadFilter();
        osc.type = idx < 2 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        f.type = 'lowpass';
        f.frequency.setValueAtTime(2400, t);

        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.2 - idx * 0.02, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);

        osc.connect(f);
        f.connect(g);
        g.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.6);
      });

      // Sub-bass impact punch
      const sub = ctx.createOscillator();
      const subG = ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(95, hitTime);
      sub.frequency.exponentialRampToValueAtTime(36, hitTime + 0.35);

      subG.gain.setValueAtTime(0.001, hitTime);
      subG.gain.linearRampToValueAtTime(0.48, hitTime + 0.01);
      subG.gain.exponentialRampToValueAtTime(0.0001, hitTime + 0.45);

      sub.connect(subG);
      subG.connect(this.masterGain);
      sub.start(hitTime);
      sub.stop(hitTime + 0.5);

    } else {
      // ── Tier 3: Cosmic Entity / Thanos — Cinematic BRAAAM & Anvil Detonation ──
      // Phase 1: Heavy Uru Metal Anvil Strike
      const anvil = ctx.createOscillator();
      const anvilG = ctx.createGain();
      const anvilF = ctx.createBiquadFilter();
      anvil.type = 'triangle';
      anvil.frequency.setValueAtTime(980, now);
      anvil.frequency.exponentialRampToValueAtTime(320, now + 0.06);
      anvilF.type = 'bandpass';
      anvilF.frequency.setValueAtTime(1400, now);
      anvilF.Q.setValueAtTime(3.0, now);

      anvilG.gain.setValueAtTime(0.001, now);
      anvilG.gain.linearRampToValueAtTime(0.55, now + 0.003);
      anvilG.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      anvil.connect(anvilF);
      anvilF.connect(anvilG);
      anvilG.connect(this.masterGain);
      anvil.start(now);
      anvil.stop(now + 0.14);

      // Phase 2: Seismic Sub-Bass BRAAAM (28Hz rumble)
      const sub = ctx.createOscillator();
      const subG = ctx.createGain();
      const subF = ctx.createBiquadFilter();
      sub.type = 'sawtooth';
      sub.frequency.setValueAtTime(75, now);
      sub.frequency.exponentialRampToValueAtTime(28, now + 0.7);
      subF.type = 'lowpass';
      subF.frequency.setValueAtTime(160, now);

      subG.gain.setValueAtTime(0.001, now);
      subG.gain.linearRampToValueAtTime(0.72, now + 0.02);
      subG.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

      sub.connect(subF);
      subF.connect(subG);
      subG.connect(this.masterGain);
      sub.start(now);
      sub.stop(now + 0.9);

      // Phase 3: Cosmic Portal Chord (C-E-G-B-D celestial bloom)
      const chord = [261.63, 329.63, 392.00, 493.88, 587.33, 783.99, 987.77];
      chord.forEach((freq, idx) => {
        if (!ctx || !this.masterGain) return;
        const t = now + 0.18 + idx * 0.04;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.18 - idx * 0.012, t + 0.025);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);

        osc.connect(g);
        g.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.65);
      });

      // Phase 4: Starlight Harmonic Ring (Warm, stable celestial chime)
      const ring = ctx.createOscillator();
      const ringG = ctx.createGain();
      ring.type = 'sine';
      ring.frequency.setValueAtTime(1318.51, now + 0.45); // E6
      ring.frequency.exponentialRampToValueAtTime(880, now + 1.1); // Gently descends to A5

      ringG.gain.setValueAtTime(0.001, now + 0.45);
      ringG.gain.linearRampToValueAtTime(0.12, now + 0.48);
      ringG.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

      ring.connect(ringG);
      ringG.connect(this.masterGain);
      ring.start(now + 0.45);
      ring.stop(now + 1.15);
    }
  }

  /**
   * 5. Card Reserve — S.H.I.E.L.D. Holographic Stasis Vault
   * Dual-phase holographic scan sweep + hydraulic vault lock + crystal confirmation
   */
  public playCardReserve(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Phase 1: Holographic Phase Sweep (350Hz -> 1800Hz)
    const sweep = ctx.createOscillator();
    const sweepG = ctx.createGain();
    const sweepF = ctx.createBiquadFilter();
    sweep.type = 'triangle';
    sweep.frequency.setValueAtTime(320, now);
    sweep.frequency.exponentialRampToValueAtTime(1760, now + 0.16);
    sweepF.type = 'bandpass';
    sweepF.frequency.setValueAtTime(1100, now);
    sweepF.Q.setValueAtTime(3.0, now);

    sweepG.gain.setValueAtTime(0.001, now);
    sweepG.gain.linearRampToValueAtTime(0.22, now + 0.04);
    sweepG.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    sweep.connect(sweepF);
    sweepF.connect(sweepG);
    sweepG.connect(this.masterGain);
    sweep.start(now);
    sweep.stop(now + 0.2);

    // Phase 2: Hydraulic Stasis Clamp Lock (180Hz -> 55Hz)
    const lockTime = now + 0.14;
    const lock = ctx.createOscillator();
    const lockG = ctx.createGain();
    lock.type = 'sine';
    lock.frequency.setValueAtTime(180, lockTime);
    lock.frequency.exponentialRampToValueAtTime(52, lockTime + 0.06);

    lockG.gain.setValueAtTime(0.001, lockTime);
    lockG.gain.linearRampToValueAtTime(0.42, lockTime + 0.003);
    lockG.gain.exponentialRampToValueAtTime(0.0001, lockTime + 0.12);

    lock.connect(lockG);
    lockG.connect(this.masterGain);
    lock.start(lockTime);
    lock.stop(lockTime + 0.15);

    // Phase 3: Pristine Confirmation Harmonic Ping (1760Hz pure bell)
    const pingTime = lockTime + 0.05;
    const ping = ctx.createOscillator();
    const pingG = ctx.createGain();
    ping.type = 'sine';
    ping.frequency.setValueAtTime(1760, pingTime);

    pingG.gain.setValueAtTime(0.001, pingTime);
    pingG.gain.linearRampToValueAtTime(0.22, pingTime + 0.004);
    pingG.gain.exponentialRampToValueAtTime(0.0001, pingTime + 0.42);

    ping.connect(pingG);
    pingG.connect(this.masterGain);
    ping.start(pingTime);
    ping.stop(pingTime + 0.45);
  }

  /**
   * 6. UI Button Click — Acoustic Tactile Precision Switch (Apple / Leica Haptic Standard)
   * Multi-layer composite:
   * Layer 1: Haptic micro-impulse (filtered noise transient, bandpass 2400Hz, Q=4.5)
   * Layer 2: Anodized aluminum switch body pip (dual triangle resonators 1080Hz & 640Hz)
   * Layer 3: Solid bottom-out sub-thump (110Hz -> 48Hz)
   */
  public playButtonClick(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Layer 1: Haptic micro-transient click
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    const clickFilter = ctx.createBiquadFilter();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(3200, now);
    clickOsc.frequency.exponentialRampToValueAtTime(800, now + 0.006);

    clickFilter.type = 'bandpass';
    clickFilter.frequency.setValueAtTime(2400, now);
    clickFilter.Q.setValueAtTime(4.0, now);

    clickGain.gain.setValueAtTime(0.001, now);
    clickGain.gain.linearRampToValueAtTime(0.24, now + 0.001);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.009);

    clickOsc.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(this.masterGain);
    clickOsc.start(now);
    clickOsc.stop(now + 0.012);

    // Layer 2: Switch body mechanical resonance
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'sine';
    bodyOsc.frequency.setValueAtTime(940, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(480, now + 0.018);

    bodyGain.gain.setValueAtTime(0.001, now);
    bodyGain.gain.linearRampToValueAtTime(0.22, now + 0.0015);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(this.masterGain);
    bodyOsc.start(now);
    bodyOsc.stop(now + 0.025);

    // Layer 3: Sub-weight bottom-out
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(120, now);
    subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.02);

    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.linearRampToValueAtTime(0.26, now + 0.001);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.024);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(now);
    subOsc.stop(now + 0.028);
  }

  /**
   * 7. Turn Alert — Stark HUD Tactical Glass Chime
   * Pristine dual-tone acoustic glass bell (D6: 1174.7Hz + A6: 1760Hz) with warm acoustic body
   */
  public playTurnAlert(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const tones = [
      { freq: 880.00,  delay: 0.00, dur: 0.22, gain: 0.28 }, // A5 (warm entry)
      { freq: 1318.51, delay: 0.09, dur: 0.32, gain: 0.32 }, // E6 (apex rise)
      { freq: 1760.00, delay: 0.18, dur: 0.65, gain: 0.36 }, // A6 (crystal hold)
    ];

    tones.forEach(({ freq, delay, dur, gain }) => {
      if (!ctx || !this.masterGain) return;
      const t = now + delay;

      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(gain, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + dur + 0.05);

      // Acoustic wood/glass body
      const body = ctx.createOscillator();
      const bodyG = ctx.createGain();
      body.type = 'triangle';
      body.frequency.setValueAtTime(freq * 0.5, t);

      bodyG.gain.setValueAtTime(0.001, t);
      bodyG.gain.linearRampToValueAtTime(gain * 0.25, t + 0.005);
      bodyG.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.4);

      body.connect(bodyG);
      bodyG.connect(this.masterGain);
      body.start(t);
      body.stop(t + dur * 0.45);
    });
  }

  /**
   * 8. Modal Open — Holographic UI Panel Reveal & Harmonic Settle
   */
  public playModalOpen(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Airy velvet reveal sweep
    const whoosh = ctx.createOscillator();
    const whooshG = ctx.createGain();
    const whooshF = ctx.createBiquadFilter();
    whoosh.type = 'sine';
    whoosh.frequency.setValueAtTime(140, now);
    whoosh.frequency.exponentialRampToValueAtTime(950, now + 0.14);
    whooshF.type = 'lowpass';
    whooshF.frequency.setValueAtTime(1600, now);

    whooshG.gain.setValueAtTime(0.001, now);
    whooshG.gain.linearRampToValueAtTime(0.2, now + 0.04);
    whooshG.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

    whoosh.connect(whooshF);
    whooshF.connect(whooshG);
    whooshG.connect(this.masterGain);
    whoosh.start(now);
    whoosh.stop(now + 0.18);

    // Crystal settle chime
    const settle = ctx.createOscillator();
    const settleG = ctx.createGain();
    settle.type = 'triangle';
    settle.frequency.setValueAtTime(1480, now + 0.12);

    settleG.gain.setValueAtTime(0.001, now + 0.12);
    settleG.gain.linearRampToValueAtTime(0.18, now + 0.126);
    settleG.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    settle.connect(settleG);
    settleG.connect(this.masterGain);
    settle.start(now + 0.12);
    settle.stop(now + 0.38);
  }

  /**
   * 9. Modal Close — Aerodynamic Vacuum Dismiss & Soft Landing
   */
  public playModalClose(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const swoop = ctx.createOscillator();
    const swoopG = ctx.createGain();
    const swoopF = ctx.createBiquadFilter();
    swoop.type = 'sine';
    swoop.frequency.setValueAtTime(780, now);
    swoop.frequency.exponentialRampToValueAtTime(130, now + 0.12);
    swoopF.type = 'lowpass';
    swoopF.frequency.setValueAtTime(1200, now);

    swoopG.gain.setValueAtTime(0.001, now);
    swoopG.gain.linearRampToValueAtTime(0.18, now + 0.01);
    swoopG.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

    swoop.connect(swoopF);
    swoopF.connect(swoopG);
    swoopG.connect(this.masterGain);
    swoop.start(now);
    swoop.stop(now + 0.16);

    // Sub tactile cushion
    const cushion = ctx.createOscillator();
    const cushionG = ctx.createGain();
    cushion.type = 'sine';
    cushion.frequency.setValueAtTime(75, now + 0.08);
    cushion.frequency.exponentialRampToValueAtTime(36, now + 0.18);

    cushionG.gain.setValueAtTime(0.001, now + 0.08);
    cushionG.gain.linearRampToValueAtTime(0.2, now + 0.09);
    cushionG.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

    cushion.connect(cushionG);
    cushionG.connect(this.masterGain);
    cushion.start(now + 0.08);
    cushion.stop(now + 0.22);
  }

  /**
   * 10. Gauntlet Stone Socketed — Uru Armor Lock & Dimensional Resonance
   */
  public playGauntletSocket(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Stage 1: Uru Armor Mechanical Strike
    const strike = ctx.createOscillator();
    const strikeG = ctx.createGain();
    const strikeF = ctx.createBiquadFilter();
    strike.type = 'triangle';
    strike.frequency.setValueAtTime(720, now);
    strike.frequency.exponentialRampToValueAtTime(180, now + 0.04);
    strikeF.type = 'bandpass';
    strikeF.frequency.setValueAtTime(1100, now);
    strikeF.Q.setValueAtTime(2.5, now);

    strikeG.gain.setValueAtTime(0.001, now);
    strikeG.gain.linearRampToValueAtTime(0.48, now + 0.003);
    strikeG.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    strike.connect(strikeF);
    strikeF.connect(strikeG);
    strikeG.connect(this.masterGain);
    strike.start(now);
    strike.stop(now + 0.1);

    // Stage 2: Sub-Bass Quantum Detonation (42Hz pulse)
    const boom = ctx.createOscillator();
    const boomG = ctx.createGain();
    boom.type = 'sine';
    boom.frequency.setValueAtTime(95, now + 0.02);
    boom.frequency.exponentialRampToValueAtTime(38, now + 0.45);

    boomG.gain.setValueAtTime(0.001, now + 0.02);
    boomG.gain.linearRampToValueAtTime(0.65, now + 0.035);
    boomG.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    boom.connect(boomG);
    boomG.connect(this.masterGain);
    boom.start(now + 0.02);
    boom.stop(now + 0.6);

    // Stage 3: Cosmic Harmonic Chord (E - B - E - G# bloom)
    const socketHarmonics = [329.63, 493.88, 659.25, 830.61, 1318.51];
    socketHarmonics.forEach((freq, idx) => {
      if (!ctx || !this.masterGain) return;
      const t = now + 0.06 + idx * 0.03;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.24 - idx * 0.02, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);

      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.75);
    });
  }

  /**
   * 11. Victory — Majestic Cinematic Triumphant Fanfare & Timpani Strike
   * Multi-voice heroic orchestral progression (A -> D -> F#m -> glorious E -> A Apex)
   * with timpani sub-boom & starry infinity particle wash
   */
  public playVictory(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Timpani / War-Drum Sub Detonation
    const drum = ctx.createOscillator();
    const drumG = ctx.createGain();
    drum.type = 'sine';
    drum.frequency.setValueAtTime(110, now);
    drum.frequency.exponentialRampToValueAtTime(35, now + 0.6);

    drumG.gain.setValueAtTime(0.001, now);
    drumG.gain.linearRampToValueAtTime(0.7, now + 0.018);
    drumG.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

    drum.connect(drumG);
    drumG.connect(this.masterGain);
    drum.start(now);
    drum.stop(now + 0.85);

    // Orchestral Heroic Voicing
    const fanfareProgression = [
      { freq: 440.00,  delay: 0.00, dur: 0.22, gain: 0.32 }, // A4
      { freq: 554.37,  delay: 0.12, dur: 0.22, gain: 0.32 }, // C#5
      { freq: 659.25,  delay: 0.24, dur: 0.28, gain: 0.36 }, // E5
      { freq: 880.00,  delay: 0.38, dur: 0.55, gain: 0.42 }, // A5 (Heroic lift)
      { freq: 1108.73, delay: 0.52, dur: 0.95, gain: 0.45 }, // C#6 (Glorious resolution)
      { freq: 1318.51, delay: 0.66, dur: 1.25, gain: 0.40 }, // E6 (Apex canopy)
      { freq: 1760.00, delay: 0.78, dur: 1.60, gain: 0.34 }, // A6 (Celestial crown)
    ];

    fanfareProgression.forEach(({ freq, delay, dur, gain }, idx) => {
      if (!ctx || !this.masterGain) return;
      const t = now + delay;

      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const f = ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, t);
      f.type = 'lowpass';
      f.frequency.setValueAtTime(3200, t);

      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(gain, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(f);
      f.connect(g);
      g.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    });

    // Starry Infinity Particle Shimmer
    const shimmer = ctx.createOscillator();
    const shimmerG = ctx.createGain();
    shimmer.type = 'sine';
    shimmer.frequency.setValueAtTime(2217.46, now + 0.7);
    shimmer.frequency.exponentialRampToValueAtTime(4434.92, now + 1.8);

    shimmerG.gain.setValueAtTime(0.001, now + 0.7);
    shimmerG.gain.linearRampToValueAtTime(0.15, now + 0.85);
    shimmerG.gain.exponentialRampToValueAtTime(0.0001, now + 2.1);

    shimmer.connect(shimmerG);
    shimmerG.connect(this.masterGain);
    shimmer.start(now + 0.7);
    shimmer.stop(now + 2.15);
  }

  /**
   * 12. Error / Invalid Action — Tactile Haptic Denial (Muted Mechanical Lock)
   * Replaces obnoxious loud buzz with an elegant, clear mechanical refusal click + damped thud
   */
  public playError(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Click 1: First muted mechanical click
    const pip1 = ctx.createOscillator();
    const pip1G = ctx.createGain();
    const pip1F = ctx.createBiquadFilter();
    pip1.type = 'triangle';
    pip1.frequency.setValueAtTime(340, now);
    pip1.frequency.exponentialRampToValueAtTime(110, now + 0.015);
    pip1F.type = 'lowpass';
    pip1F.frequency.setValueAtTime(480, now);

    pip1G.gain.setValueAtTime(0.001, now);
    pip1G.gain.linearRampToValueAtTime(0.32, now + 0.0015);
    pip1G.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

    pip1.connect(pip1F);
    pip1F.connect(pip1G);
    pip1G.connect(this.masterGain);
    pip1.start(now);
    pip1.stop(now + 0.03);

    // Click 2: Second muted refusal click (80ms later)
    const t2 = now + 0.075;
    const pip2 = ctx.createOscillator();
    const pip2G = ctx.createGain();
    const pip2F = ctx.createBiquadFilter();
    pip2.type = 'triangle';
    pip2.frequency.setValueAtTime(280, t2);
    pip2.frequency.exponentialRampToValueAtTime(95, t2 + 0.015);
    pip2F.type = 'lowpass';
    pip2F.frequency.setValueAtTime(420, t2);

    pip2G.gain.setValueAtTime(0.001, t2);
    pip2G.gain.linearRampToValueAtTime(0.28, t2 + 0.0015);
    pip2G.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.025);

    pip2.connect(pip2F);
    pip2F.connect(pip2G);
    pip2G.connect(this.masterGain);
    pip2.start(t2);
    pip2.stop(t2 + 0.03);

    // Warm Low-End Refusal Thud
    const thud = ctx.createOscillator();
    const thudG = ctx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(140, now);
    thud.frequency.exponentialRampToValueAtTime(42, now + 0.08);

    thudG.gain.setValueAtTime(0.001, now);
    thudG.gain.linearRampToValueAtTime(0.38, now + 0.002);
    thudG.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    thud.connect(thudG);
    thudG.connect(this.masterGain);
    thud.start(now);
    thud.stop(now + 0.1);
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
   * Countdown Tick — Human-Grade Precision Mechanical Stopwatch / Studio Film Slate Tick ("ติ๊ก!")
   * Pure downward acoustic click with zero high-pitched electronic whining.
   */
  public playCountdownTick(secondsRemaining: number): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const playSingleTick = (time: number, isAccent: boolean = false) => {
      if (!ctx || !this.masterGain) return;

      // Layer 1: Warm Organic Mechanical Escapement Click (The crisp tactile "T" click)
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      const clickFilter = ctx.createBiquadFilter();

      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(isAccent ? 2200 : 1800, time);
      clickOsc.frequency.exponentialRampToValueAtTime(900, time + 0.006);

      clickFilter.type = 'bandpass';
      clickFilter.frequency.setValueAtTime(isAccent ? 2000 : 1600, time);
      clickFilter.Q.setValueAtTime(4.0, time);

      clickGain.gain.setValueAtTime(0.001, time);
      clickGain.gain.linearRampToValueAtTime(isAccent ? 0.32 : 0.26, time + 0.001);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.008);

      clickOsc.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(this.masterGain);
      clickOsc.start(time);
      clickOsc.stop(time + 0.01);

      // Layer 2: Hollow Wood / Metronome Resonator Body (The organic "-ick")
      const bodyOsc = ctx.createOscillator();
      const bodyGain = ctx.createGain();
      const bodyFilter = ctx.createBiquadFilter();

      const bodyFreq = isAccent ? 480 : 420;
      bodyOsc.type = 'sine';
      bodyOsc.frequency.setValueAtTime(bodyFreq, time);
      bodyOsc.frequency.exponentialRampToValueAtTime(bodyFreq * 0.55, time + 0.018);

      bodyFilter.type = 'lowpass';
      bodyFilter.frequency.setValueAtTime(1000, time);

      bodyGain.gain.setValueAtTime(0.001, time);
      bodyGain.gain.linearRampToValueAtTime(isAccent ? 0.28 : 0.22, time + 0.0015);
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.022);

      bodyOsc.connect(bodyFilter);
      bodyFilter.connect(bodyGain);
      bodyGain.connect(this.masterGain);
      bodyOsc.start(time);
      bodyOsc.stop(time + 0.026);

      // Layer 3: Tactile Mechanical Bottom-Out Thud
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();

      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(80, time);
      subOsc.frequency.exponentialRampToValueAtTime(38, time + 0.018);

      subGain.gain.setValueAtTime(0.001, time);
      subGain.gain.linearRampToValueAtTime(0.2, time + 0.001);
      subGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.022);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);
      subOsc.start(time);
      subOsc.stop(time + 0.025);
    };

    if (secondsRemaining <= 1) {
      // Final second: Crisp Double-Tick ("ติ๊ก-ติ๊ก!")
      playSingleTick(now, false);
      playSingleTick(now + 0.075, true);
    } else {
      // 5, 4, 3, 2: Crisp tactile precision tick
      playSingleTick(now, false);
    }
  }

  /**
   * Battle Launch — Heavy Cinema Sub Impact & Clean Mechanical Engage
   * Solid, deep, punchy entry into the game with zero upward pitch whining.
   */
  public playBattleLaunch(): void {
    if (this.muted || !this.initContext() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Stage 1: Crisp Mechanical Latch Engagement (Downward tactile pop)
    const latch = ctx.createOscillator();
    const latchGain = ctx.createGain();
    const latchFilter = ctx.createBiquadFilter();

    latch.type = 'triangle';
    latch.frequency.setValueAtTime(850, now);
    latch.frequency.exponentialRampToValueAtTime(220, now + 0.035);

    latchFilter.type = 'lowpass';
    latchFilter.frequency.setValueAtTime(1400, now);

    latchGain.gain.setValueAtTime(0.001, now);
    latchGain.gain.linearRampToValueAtTime(0.38, now + 0.002);
    latchGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

    latch.connect(latchFilter);
    latchFilter.connect(latchGain);
    latchGain.connect(this.masterGain);
    latch.start(now);
    latch.stop(now + 0.05);

    // Stage 2: Heavy Hollywood Sub-Bass Drop (Pure downward cinematic thud)
    const boom = ctx.createOscillator();
    const boomGain = ctx.createGain();
    boom.type = 'sine';
    boom.frequency.setValueAtTime(85, now);
    boom.frequency.exponentialRampToValueAtTime(28, now + 0.45);

    boomGain.gain.setValueAtTime(0.001, now);
    boomGain.gain.linearRampToValueAtTime(0.72, now + 0.015);
    boomGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    boom.connect(boomGain);
    boomGain.connect(this.masterGain);
    boom.start(now);
    boom.stop(now + 0.6);
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
