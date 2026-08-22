/**
 * CENTRALIZED CINEMATIC AUDIO CONTROLLER
 * 
 * Strict Audio Rules:
 * 1. Only ONE primary audio track plays at any time.
 * 2. Main Soundtrack ('assets/audio/main-song.mp3'):
 *    - Starts on first user interaction
 *    - Loops continuously across scenes
 *    - Preserves playback position when paused/faded
 *    - Never restarts from 0 on normal scene changes
 * 3. Special Letter Song ('assets/audio/song-for-her.mp3'):
 *    - Smoothly fades and pauses main soundtrack
 *    - Supports Play, Pause, and Replay
 *    - When it ends or closes, smoothly restores main soundtrack
 * 4. Final Voiceover ('assets/audio/i-love-you.m4a'):
 *    - Smoothly fades main soundtrack down
 *    - Listens strictly to the 'ended' event
 *    - Callback only executes when voice finishes naturally
 */

class AudioManager {
  constructor() {
    this.config = window.PROPOSAL_CONFIG?.media?.audio || {};

    // Audio Elements
    this.mainAudio = null;
    this.specialAudio = null;
    this.voiceAudio = null;

    // Web Audio Synthesizer Fallback
    this.ctx = null;
    this.synthGain = null;
    this.sfxGain = null;
    this.synthInterval = null;
    this.currentChord = 0;
    this.chords = [
      [146.83, 220.00, 277.18, 329.63, 440.00], // D Maj9
      [123.47, 185.00, 220.00, 293.66, 369.99], // Bm7
      [98.00,  196.00, 246.94, 293.66, 392.00], // G Maj7
      [110.00, 164.81, 220.00, 277.18, 329.63]  // Aadd9
    ];

    // State
    this.isMuted = false;
    this.hasUserInteracted = false;
    this.isMainPlaying = false;
    this.isSpecialPlaying = false;
    this.isVoicePlaying = false;
    this.mainSavedTime = 0;
    this.normalVolume = 0.65;

    this.initAudioElements();
  }

  createAudioWithFallback(primarySrc, fallbackSrc, loop = false) {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.loop = loop;
    audio.volume = this.normalVolume;

    const tryLoad = (src) => {
      audio.src = encodeURI(src);
      audio.load();
    };

    audio.addEventListener('error', () => {
      if (fallbackSrc && audio.src.indexOf(encodeURI(fallbackSrc)) === -1) {
        console.warn(`Audio primary '${primarySrc}' failed, trying fallback '${fallbackSrc}'`);
        tryLoad(fallbackSrc);
      } else {
        console.warn(`Audio '${primarySrc}' could not be loaded.`);
      }
    });

    tryLoad(primarySrc);
    return audio;
  }

  initAudioElements() {
    // 1. Main Background Music
    const mainSrc = this.config.mainBgm || 'assets/audio/main-song.mp3';
    const mainFallback = this.config.mainBgmFallback || 'assets/audio/terehimerehisab_[cut_19sec].mp3';
    this.mainAudio = this.createAudioWithFallback(mainSrc, mainFallback, true);

    // Ensure loop repeats smoothly
    this.mainAudio.addEventListener('ended', () => {
      if (this.isMainPlaying && !this.isSpecialPlaying && !this.isVoicePlaying) {
        this.mainAudio.currentTime = 0;
        this.mainAudio.play().catch(() => {});
      }
    });

    // 2. Special Letter Song
    const specSrc = this.config.specialSong || 'assets/audio/song-for-her.mp3';
    const specFallback = this.config.specialSongFallback || 'assets/audio/song for her_[cut_25sec].mp3';
    this.specialAudio = this.createAudioWithFallback(specSrc, specFallback, false);

    // 3. Final Voice
    const voiceSrc = this.config.finalVoice || 'assets/audio/i-love-you.m4a';
    const voiceFallback = this.config.finalVoiceFallback || 'assets/audio/i love you.m4a';
    this.voiceAudio = this.createAudioWithFallback(voiceSrc, voiceFallback, false);
    this.voiceAudio.volume = 0.95;
  }

  initWebAudio() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      this.synthGain = this.ctx.createGain();
      this.synthGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.synthGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
      this.sfxGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn('Web Audio initialization error:', e);
    }
  }

  // ==========================================
  // 1. MAIN SOUNDTRACK LIFECYCLE
  // ==========================================
  start() {
    this.hasUserInteracted = true;
    this.initWebAudio();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.playMainMusic();
  }

  playMainMusic() {
    if (this.isSpecialPlaying || this.isVoicePlaying) return;

    if (this.mainAudio) {
      this.mainAudio.currentTime = this.mainSavedTime || 0;
      this.fadeAudioIn(this.mainAudio, this.normalVolume, 1.6);
      this.mainAudio.play().then(() => {
        this.isMainPlaying = true;
      }).catch((e) => {
        console.warn('Main BGM play error (will retry or use fallback synth):', e);
        this.startGenerativeFallback();
      });
    } else {
      this.startGenerativeFallback();
    }
  }

  pauseMainMusic(fadeDuration = 1.0, onComplete = null) {
    if (!this.mainAudio) return;
    this.fadeAudioOut(this.mainAudio, fadeDuration, () => {
      this.mainSavedTime = this.mainAudio.currentTime;
      this.mainAudio.pause();
      this.isMainPlaying = false;
      if (onComplete) onComplete();
    });
    this.stopGenerativeFallback();
  }

  resumeMainMusic(fadeDuration = 1.4) {
    if (this.isSpecialPlaying || this.isVoicePlaying) return;
    if (this.mainAudio) {
      this.mainAudio.currentTime = this.mainSavedTime;
      this.mainAudio.play().then(() => {
        this.isMainPlaying = true;
        this.fadeAudioIn(this.mainAudio, this.normalVolume, fadeDuration);
      }).catch(() => {
        this.startGenerativeFallback();
      });
    } else {
      this.startGenerativeFallback();
    }
  }

  // ==========================================
  // 2. SPECIAL LETTER SONG ('song for her')
  // ==========================================
  playSpecialSong(onEndedCallback, onStateChange = null) {
    this.isSpecialPlaying = true;
    
    // Smoothly duck and pause main music
    this.pauseMainMusic(1.0, () => {
      if (this.specialAudio) {
        this.specialAudio.currentTime = 0;
        this.specialAudio.volume = this.normalVolume;

        const handleEnded = () => {
          this.isSpecialPlaying = false;
          if (onStateChange) onStateChange('ended');
          if (onEndedCallback) onEndedCallback();
          this.resumeMainMusic(1.5);
        };

        this.specialAudio.onended = handleEnded;

        this.specialAudio.play().then(() => {
          if (onStateChange) onStateChange('playing');
        }).catch((e) => {
          console.warn('Could not play special song:', e);
          setTimeout(() => handleEnded(), 6000);
        });
      } else {
        setTimeout(() => {
          this.isSpecialPlaying = false;
          if (onEndedCallback) onEndedCallback();
          this.resumeMainMusic(1.5);
        }, 6000);
      }
    });
  }

  pauseSpecialSong() {
    if (this.specialAudio) {
      this.specialAudio.pause();
    }
  }

  resumeSpecialSong() {
    if (this.specialAudio) {
      this.specialAudio.play().catch(() => {});
    }
  }

  replaySpecialSong() {
    if (this.specialAudio) {
      this.specialAudio.currentTime = 0;
      this.specialAudio.play().catch(() => {});
    }
  }

  stopSpecialSong() {
    if (this.specialAudio) {
      this.specialAudio.pause();
      this.specialAudio.currentTime = 0;
      this.specialAudio.onended = null;
    }
    this.isSpecialPlaying = false;
    this.resumeMainMusic(1.2);
  }

  // ==========================================
  // 3. FINAL VOICE REVEAL ('i love you')
  // ==========================================
  playFinalVoice(onEndedCallback) {
    this.isVoicePlaying = true;
    
    // Duck main soundtrack smoothly
    this.pauseMainMusic(1.2, () => {
      if (this.voiceAudio) {
        this.voiceAudio.currentTime = 0;
        this.voiceAudio.volume = 0.95;

        let hasFinished = false;
        const triggerFinished = () => {
          if (hasFinished) return;
          hasFinished = true;
          this.isVoicePlaying = false;
          if (onEndedCallback) onEndedCallback();
          // Keep gentle ambient background playing for the proposal scene
          this.resumeMainMusic(2.5);
        };

        // Strict listener on audio 'ended' event
        this.voiceAudio.onended = triggerFinished;

        this.voiceAudio.play().catch((e) => {
          console.warn('Voice audio playback error (fallback countdown):', e);
          setTimeout(() => triggerFinished(), 4500);
        });
      } else {
        setTimeout(() => {
          this.isVoicePlaying = false;
          if (onEndedCallback) onEndedCallback();
          this.resumeMainMusic(2.5);
        }, 4500);
      }
    });
  }

  // ==========================================
  // FADES & SFX
  // ==========================================
  fadeAudioIn(audio, targetVol = 0.65, duration = 1.2) {
    if (!audio) return;
    audio.volume = 0.001;
    gsap.killTweensOf(audio);
    gsap.to(audio, {
      volume: targetVol,
      duration: duration,
      ease: 'power1.out'
    });
  }

  fadeAudioOut(audio, duration = 1.0, onComplete = null) {
    if (!audio) {
      if (onComplete) onComplete();
      return;
    }
    gsap.killTweensOf(audio);
    gsap.to(audio, {
      volume: 0.001,
      duration: duration,
      ease: 'power1.in',
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.mainAudio) this.mainAudio.muted = this.isMuted;
    if (this.specialAudio) this.specialAudio.muted = this.isMuted;
    if (this.voiceAudio) this.voiceAudio.muted = this.isMuted;
    if (this.synthGain && this.ctx) {
      this.synthGain.gain.setTargetAtTime(this.isMuted ? 0.0 : 0.35, this.ctx.currentTime, 0.1);
    }
    return this.isMuted;
  }

  // Web Audio Fallback Synth
  startGenerativeFallback() {
    if (!this.ctx) return;
    this.synthGain.gain.setTargetAtTime(this.isMuted ? 0.0 : 0.3, this.ctx.currentTime, 2.0);
    this.playNextSynthChord();
    if (!this.synthInterval) {
      this.synthInterval = setInterval(() => {
        if (!this.isMuted && this.isMainPlaying) {
          this.playNextSynthChord();
        }
      }, 7000);
    }
  }

  stopGenerativeFallback() {
    if (!this.ctx) return;
    this.synthGain.gain.setTargetAtTime(0.001, this.ctx.currentTime, 1.0);
  }

  playNextSynthChord() {
    if (!this.ctx || this.isMuted) return;
    const freqs = this.chords[this.currentChord];
    this.currentChord = (this.currentChord + 1) % this.chords.length;
    const now = this.ctx.currentTime;
    const dur = 7.5;

    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, now);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500 + i * 200, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.035 / (i + 1), now + 2.0);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.synthGain);

      osc.start(now);
      osc.stop(now + dur + 0.2);
    });
  }

  playChime(multiplier = 1.0) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((n, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(n * multiplier, now + i * 0.06);
      gain.gain.setValueAtTime(0.001, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.04, now + i * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + i * 0.06 + 1.2);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 1.3);
    });
  }

  playLetterUnfold() {
    this.playChime(1.15);
  }

  playCelebrationChord() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [146.83, 220.00, 293.66, 369.99, 440.00, 587.33, 739.99, 880.00];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx < 3 ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      gain.gain.setValueAtTime(0.0001, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.06 / (idx * 0.4 + 1), now + idx * 0.04 + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + 6.0);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.04);
      osc.stop(now + 6.5);
    });
  }

  playPlayfulBoing() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(720, now + 0.15);
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.exponentialRampToValueAtTime(0.06, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.3);
  }
}

window.audioEngine = new AudioManager();
