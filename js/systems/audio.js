/**
 * audio.js — Optional audio system.
 * Music and ambient sounds are NOT auto-played.
 * The user opts in via the ♫ button.
 * Replace asset paths in TRACKS with your own files.
 */

const TRACKS = {
  ambient: 'assets/audio/ambient.mp3',  // background music
  nature:  'assets/audio/nature.mp3',   // nature scene ambience
  // Add more as needed
};

class AudioSystem {
  constructor() {
    this._enabled  = false;
    this._context  = null;
    this._nodes    = {};
    this._bgGain   = null;
    this._bgSource = null;
    this._current  = null;
    this._interacted = false;
  }

  /** Call once after first user interaction */
  async _initContext() {
    if (this._context) return;
    try {
      this._context = new (window.AudioContext || window.webkitAudioContext)();
      this._bgGain = this._context.createGain();
      this._bgGain.gain.value = 0.35;
      this._bgGain.connect(this._context.destination);
    } catch (e) {
      console.warn('Audio context unavailable:', e);
    }
  }

  /** Toggle music on/off. Returns new state (true = playing). */
  async toggle() {
    if (!this._interacted) {
      await this._initContext();
      this._interacted = true;
    }

    this._enabled = !this._enabled;
    this._updateIcon();

    if (this._enabled) {
      await this._play(TRACKS.ambient);
    } else {
      this._fadeOut();
    }
    return this._enabled;
  }

  async _play(url) {
    if (!this._context) return;
    try {
      if (this._context.state === 'suspended') {
        await this._context.resume();
      }
      const resp = await fetch(url);
      if (!resp.ok) return; // missing file — silent fail
      const buf  = await this._context.decodeAudioData(await resp.arrayBuffer());
      const src  = this._context.createBufferSource();
      src.buffer = buf;
      src.loop   = true;
      src.connect(this._bgGain);
      src.start(0);
      if (this._bgSource) {
        try { this._bgSource.stop(); } catch (_) {}
      }
      this._bgSource = src;
      // Fade in
      this._bgGain.gain.setValueAtTime(0, this._context.currentTime);
      this._bgGain.gain.linearRampToValueAtTime(0.35, this._context.currentTime + 2);
    } catch (e) {
      // File not found or decode error — fail silently
    }
  }

  _fadeOut() {
    if (!this._bgGain || !this._context) return;
    this._bgGain.gain.linearRampToValueAtTime(0, this._context.currentTime + 1.5);
    setTimeout(() => {
      if (this._bgSource) {
        try { this._bgSource.stop(); } catch (_) {}
      }
    }, 1600);
  }

  _updateIcon() {
    const ctrl = document.getElementById('audio-ctrl');
    if (!ctrl) return;
    ctrl.classList.toggle('muted', !this._enabled);
  }
}

export const audio = new AudioSystem();
