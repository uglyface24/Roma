
class AudioService {
  private context: AudioContext | null = null;
  public isMuted: boolean = false;
  private musicElement: HTMLAudioElement | null = null;

  private getContext() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Resume context if it was suspended (browser policy)
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
    return this.context;
  }

  private createGain(startTime: number, duration: number, startVolume: number) {
    const ctx = this.getContext();
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(startVolume, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    gainNode.connect(ctx.destination);
    return gainNode;
  }

  initMusic() {
    if (this.musicElement) {
        if (!this.isMuted && this.musicElement.paused) {
            this.musicElement.play().catch(() => {});
        }
        return;
    };
    
    // Using the direct download link for the Google Drive file provided by the user
    const driveFileId = '1Fc9N7P0TN6GyKN0KZ6i9mkp3bH8xHKP7';
    const directLink = `https://docs.google.com/uc?export=download&id=${driveFileId}`;
    
    this.musicElement = new Audio(directLink);
    this.musicElement.loop = true;
    this.musicElement.volume = 0.08; // Low background volume
    
    this.musicElement.addEventListener('error', (e) => {
        console.error("Custom music failed to load from Drive:", e);
        // Fallback to a romantic instrumental if the Drive link hits CORS or other issues
        if (this.musicElement) {
            this.musicElement.src = 'https://cdn.pixabay.com/audio/2024/02/09/audio_d922b0c360.mp3';
            if (!this.isMuted) this.musicElement.play().catch(() => {});
        }
    });

    if (!this.isMuted) {
      this.musicElement.play().catch(e => {
        console.debug("Autoplay blocked, waiting for user interaction.");
      });
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.musicElement) {
      this.musicElement.muted = this.isMuted;
      if (!this.isMuted && this.musicElement.paused) {
        this.musicElement.play().catch(console.error);
      }
    } else {
        this.initMusic();
    }
    return this.isMuted;
  }

  playPop() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = this.createGain(now, 0.1, 0.5);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);

    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  playJingle() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    notes.forEach((freq, i) => {
      const startTime = now + i * 0.08;
      const osc = ctx.createOscillator();
      const gain = this.createGain(startTime, 0.2, 0.2);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.connect(gain);
      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  }

  playChime() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
      const startTime = now + i * 0.05;
      const duration = 1.5;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.connect(gain);
      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }
}

export const audioService = new AudioService();
