// AudioManager.js - Complete Audio Management System for PixelPlay

class AudioManager {
  constructor() {
    this.audioEnabled = true;
    this.musicVolume = 0.2;
    this.effectsVolume = 0.1;
    this.backgroundMusic = null;
    this.audioContext = null;

    this.audioBasePath = "/audio";
    this.musicTracks = {
      dance: "upbeat-dance.mp3",
      ninja: "action-theme.mp3",
      yoga: "calm-ambient.mp3",
      rhythm: "electronic-beat.mp3",
      lightning-ladders: "energetic-workout.mp3",
      shadow-punch: "combat-music.mp3",
      adventure: "adventure-theme.mp3",
      superhero: "heroic-theme.mp3",
      magic: "mystical-ambient.mp3",
      sports: "sports-theme.mp3",
      memory: "memory-theme.mp3",
      brain: "brain-theme.mp3",
    };

    // Web Audio API tone-based effects
    this.toneEffects = {
      success: [800, 1200],
      countdown: [600],
      complete: [400, 800, 1200],
      button: [440],
      error: [300],
      levelUp: [523, 659, 784, 1047],
    };

    // Preloaded audio clip effects (for overlapping sounds)
    this.clipEffects = {};
  }

  // Initialize Web Audio API
  init() {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
      } catch (error) {
        console.warn("Web Audio API not supported:", error);
        return false;
      }
    }
    return true;
  }

  // Enable/disable audio
  setAudioEnabled(enabled) {
    this.audioEnabled = enabled;
    if (this.backgroundMusic)
      this.backgroundMusic.volume = enabled ? this.musicVolume : 0;
  }

  // Set volumes
  setVolume(musicVolume = 0.2, effectsVolume = 0.1) {
    this.musicVolume = Math.min(Math.max(musicVolume, 0), 1);
    this.effectsVolume = Math.min(Math.max(effectsVolume, 0), 1);
    if (this.backgroundMusic && this.audioEnabled)
      this.backgroundMusic.volume = this.musicVolume;
  }

  // Background Music Management
  async startBackgroundMusic(gameId) {
    if (!this.audioEnabled || !this.musicTracks[gameId]) return false;

    this.stopBackgroundMusic();
    const musicPath = `${this.audioBasePath}/${this.musicTracks[gameId]}`;
    this.backgroundMusic = new Audio(musicPath);
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = this.musicVolume;

    this.backgroundMusic.addEventListener("error", () => {
      console.warn(`Music file not found: ${musicPath}`);
    });

    try {
      await this.backgroundMusic.play();
      return true;
    } catch {
      return false;
    }
  }

  pauseBackgroundMusic() {
    if (this.backgroundMusic && !this.backgroundMusic.paused)
      this.backgroundMusic.pause();
  }

  resumeBackgroundMusic() {
    if (this.backgroundMusic && this.backgroundMusic.paused)
      this.backgroundMusic.play().catch(() => {});
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
      this.backgroundMusic = null;
    }
  }

  // Web Audio API: Tone-based effects (oscillators)
  playToneEffect(effectType, duration = 0.3) {
    if (
      !this.audioEnabled ||
      !this.audioContext ||
      !this.toneEffects[effectType]
    )
      return;

    const frequencies = this.toneEffects[effectType];
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(
      frequencies[0],
      this.audioContext.currentTime
    );
    frequencies.slice(1).forEach((freq, i) => {
      const time =
        this.audioContext.currentTime +
        (duration / frequencies.length) * (i + 1);
      oscillator.frequency.setValueAtTime(freq, time);
    });

    gainNode.gain.setValueAtTime(
      this.effectsVolume,
      this.audioContext.currentTime
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Preload audio clips for overlapping effects
  loadAudioClip(name, src) {
    const audio = new Audio(src);
    audio.volume = this.effectsVolume;
    this.clipEffects[name] = audio;
  }

  // Play preloaded audio clip (allows overlapping)
  playAudioClip(name) {
    if (!this.audioEnabled || !this.clipEffects[name]) return;

    const clip = this.clipEffects[name].cloneNode(true); // clone for overlap
    clip.volume = this.effectsVolume;
    clip.play().catch(() => {});
  }

  // Convenience methods for common events
  playSuccessSound() {
    this.playToneEffect("success");
  }
  playCountdownSound() {
    this.playToneEffect("countdown");
  }
  playCompletionSound() {
    this.playToneEffect("complete", 0.6);
  }
  playButtonSound() {
    this.playToneEffect("button", 0.2);
  }
  playErrorSound() {
    this.playToneEffect("error");
  }
  playLevelUpSound() {
    this.playToneEffect("levelUp", 1.0);
  }

  hasBackgroundMusic(gameId) {
    return !!this.musicTracks[gameId];
  }
  getGamesWithMusic() {
    return Object.keys(this.musicTracks);
  }

  cleanup() {
    this.stopBackgroundMusic();
    if (this.audioContext && this.audioContext.state !== "closed")
      this.audioContext.close().catch(console.warn);
  }

  getStatus() {
    return {
      audioEnabled: this.audioEnabled,
      musicVolume: this.musicVolume,
      effectsVolume: this.effectsVolume,
      hasBackgroundMusic: !!this.backgroundMusic,
      musicPaused: this.backgroundMusic?.paused ?? null,
      audioContextState: this.audioContext?.state ?? null,
      supportedGames: Object.keys(this.musicTracks),
    };
  }
}

const audioManager = new AudioManager();
export default audioManager;
