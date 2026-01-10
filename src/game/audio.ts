export class AudioManager {
  audioCtx: AudioContext;
  isMuted: boolean;
  bgMusic: HTMLAudioElement | null = null;
  isMusicMuted: boolean = false;

  constructor() {
    const AudioContextClass =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) {
      throw new Error('AudioContext is not supported in this browser');
    }
    this.audioCtx = new AudioContextClass();
    this.isMuted = false;

    // Load preference
    this.isMusicMuted = localStorage.getItem('horseJumpMusicMuted') === 'true';

    // Initialize background music (respect Vite base for GH Pages)
    this.bgMusic = new Audio(`${import.meta.env.BASE_URL}bg_music.mp3`);
    this.bgMusic.loop = true;
    this.bgMusic.volume = 0.4;
  }

  playTone(freq: number, type: OscillatorType, duration: number, startTime = 0, vol = 0.1) {
    if (this.isMuted || this.audioCtx.state === 'suspended') return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + startTime);
      gain.gain.setValueAtTime(vol, this.audioCtx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + startTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(this.audioCtx.currentTime + startTime);
      osc.stop(this.audioCtx.currentTime + startTime + duration);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  jump() {
    this.playTone(200, "sine", 0.1, 0, 0.1);
  }

  crash() {
    this.playTone(100, "sawtooth", 0.3, 0, 0.2);
  }

  resume() {
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    this.playMusic();
  }

  playMusic() {
    if (!this.bgMusic || this.isMusicMuted) return;
    this.bgMusic.play().catch(e => console.warn('Music play failed', e));
  }

  stopMusic() {
    if (this.bgMusic) {
      this.bgMusic.pause();
    }
  }

  toggleMusic() {
    this.isMusicMuted = !this.isMusicMuted;
    localStorage.setItem('horseJumpMusicMuted', String(this.isMusicMuted));
    if (this.isMusicMuted) {
      this.stopMusic();
    } else {
      this.playMusic();
    }
    return this.isMusicMuted;
  }
}

export const audioManager = new AudioManager();
