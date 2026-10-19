/**
 * Web Audio API synthesizer for romantic music box chords and playful sound effects.
 * 100% procedural with zero external MP3 dependencies.
 */

class SoundController {
  private ctx: AudioContext | null = null;
  private isMusicPlaying = false;
  private musicTimer: number | null = null;
  private currentNoteIndex = 0;

  // Romantic music box melody (frequencies in Hz, warm dreamy progression)
  // C major 7 -> A minor 7 -> F major 7 -> G 7
  private melodyNotes = [
    523.25, 659.25, 783.99, 987.77, // C5, E5, G5, B5 (Cmaj7)
    880.00, 659.25, 523.25, 659.25, // A5, E5, C5, E5
    698.46, 880.00, 1046.50, 880.00, // F5, A5, C6, A5 (Fmaj7)
    783.99, 987.77, 1174.66, 987.77, // G5, B5, D6, B5 (G7)
    659.25, 783.99, 987.77, 1046.50, // E5, G5, B5, C6
    880.00, 783.99, 659.25, 587.33, // A5, G5, E5, D5
    523.25, 659.25, 783.99, 880.00, // C5, E5, G5, A5
    783.99, 659.25, 587.33, 523.25, // G5, E5, D5, C5
  ];

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Play a music box chime note
   */
  public playMusicBoxNote(freq: number, volume = 0.08, duration = 1.2) {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const oscHarmonic = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Subtle 2nd harmonic for bell / celesta chime timbre
    oscHarmonic.type = 'sine';
    oscHarmonic.frequency.setValueAtTime(freq * 2.01, ctx.currentTime);

    const harmonicGain = ctx.createGain();
    harmonicGain.gain.setValueAtTime(0.2, ctx.currentTime);
    oscHarmonic.connect(harmonicGain);
    harmonicGain.connect(gain);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    oscHarmonic.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
    oscHarmonic.stop(ctx.currentTime + duration);
  }

  /**
   * Toggle background romantic music box loop
   */
  public toggleMusic(enable?: boolean): boolean {
    const target = enable !== undefined ? enable : !this.isMusicPlaying;

    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    if (target) {
      this.isMusicPlaying = true;
      if (!this.musicTimer) {
        this.scheduleNextMelodyNote();
      }
    } else {
      this.isMusicPlaying = false;
      if (this.musicTimer) {
        window.clearTimeout(this.musicTimer);
        this.musicTimer = null;
      }
    }

    return this.isMusicPlaying;
  }

  private scheduleNextMelodyNote() {
    if (!this.isMusicPlaying) return;
    const note = this.melodyNotes[this.currentNoteIndex];
    this.playMusicBoxNote(note, 0.06, 1.4);

    this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melodyNotes.length;

    // Tempo: ~340ms per note, dreamy music box pace
    this.musicTimer = window.setTimeout(() => {
      this.scheduleNextMelodyNote();
    }, 360);
  }

  public isPlaying(): boolean {
    return this.isMusicPlaying;
  }

  /**
   * Soft UI click / tap
   */
  public playSoftTap() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  }

  /**
   * Playful cute dodge boing
   */
  public playBoing() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(740, ctx.currentTime + 0.15);
    osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  }

  /**
   * Celebration fanfares on YES!
   */
  public playCelebration() {
    const ctx = this.getContext();
    if (!ctx) return;
    const chords = [523.25, 659.25, 783.99, 1046.50]; // C E G C
    chords.forEach((freq, idx) => {
      window.setTimeout(() => {
        this.playMusicBoxNote(freq, 0.12, 1.5);
      }, idx * 100);
    });
  }
}

export const sound = new SoundController();
