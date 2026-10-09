/**
 * Audio Engine using Web Audio API
 * Generates custom sound effects & background ambient music procedural synthesis
 * Zero external audio files required, completely reliable offline & lightweight.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = false;
  private musicOscillator: OscillatorNode | null = null;
  private musicInterval: number | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (enabled) {
      this.startAmbientMusic();
    } else {
      this.stopAmbientMusic();
    }
  }

  public playClick() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // Ignore audio failure
    }
  }

  public playPlaceMove(symbol: 'X' | 'O' | 'S') {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freqs: Record<string, number> = {
        'X': 350,
        'O': 520,
        'S': 400
      };

      const baseFreq = freqs[symbol] || 440;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch {
      // Ignore
    }
  }

  public playSosCreated() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + index * 0.07);

        gain.gain.setValueAtTime(0.18, this.ctx.currentTime + index * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + index * 0.07 + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + index * 0.07);
        osc.stop(this.ctx.currentTime + index * 0.07 + 0.15);
      });
    } catch {
      // Ignore
    }
  }

  public playWin() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const arpeggio = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
      arpeggio.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.1);

        gain.gain.setValueAtTime(0.22, this.ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.1 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + i * 0.1);
        osc.stop(this.ctx.currentTime + i * 0.1 + 0.35);
      });
    } catch {
      // Ignore
    }
  }

  public playLoss() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const notes = [440, 392, 349.23, 293.66]; // A4, G4, F4, D4
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.12);

        gain.gain.setValueAtTime(0.15, this.ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.12 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + i * 0.12);
        osc.stop(this.ctx.currentTime + i * 0.12 + 0.25);
      });
    } catch {
      // Ignore
    }
  }

  public playDraw() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const notes = [440, 440, 440];
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.15);

        gain.gain.setValueAtTime(0.15, this.ctx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.15 + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + i * 0.15);
        osc.stop(this.ctx.currentTime + i * 0.15 + 0.18);
      });
    } catch {
      // Ignore
    }
  }

  public playCombo() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const notes = [587.33, 739.99, 880, 1174.66]; // D5, F#5, A5, D6
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.05);

        gain.gain.setValueAtTime(0.25, this.ctx.currentTime + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.05 + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + i * 0.05);
        osc.stop(this.ctx.currentTime + i * 0.05 + 0.2);
      });
    } catch {
      // Ignore
    }
  }

  private startAmbientMusic() {
    if (!this.musicEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    this.stopAmbientMusic();

    const chords = [
      [261.63, 329.63, 392.00], // C major
      [220.00, 261.63, 329.63], // A minor
      [174.61, 220.00, 261.63], // F major
      [196.00, 246.94, 293.66], // G major
    ];

    let chordIdx = 0;

    const playNextChord = () => {
      if (!this.musicEnabled || !this.ctx) return;
      const currentChord = chords[chordIdx % chords.length];
      chordIdx++;

      currentChord.forEach((freq) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.025, this.ctx.currentTime + 0.8);
        gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 3.0);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 3.0);
      });
    };

    playNextChord();
    this.musicInterval = window.setInterval(playNextChord, 3200);
  }

  private stopAmbientMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    if (this.musicOscillator) {
      try {
        this.musicOscillator.stop();
        this.musicOscillator.disconnect();
      } catch {
        // Ignore
      }
      this.musicOscillator = null;
    }
  }
}

export const sound = new SoundEngine();
