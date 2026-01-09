export class AudioManager {
  constructor() {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.isMuted = false;
  }

  playTone(freq, type, duration, startTime = 0, vol = 0.1) {
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
  }
}

export const audioManager = new AudioManager();
