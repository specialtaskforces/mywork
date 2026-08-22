/**
 * main.js — Story orchestrator.
 * Boots the engine, registers all scenes, runs the story sequence.
 */

import { Engine }         from './engine.js';
import { audio }          from './systems/audio.js';
import { runTransition }  from './systems/transitions.js';
import { STORY_SEQUENCE, CONTENT } from './config.js';

// --- Scene imports ---
import { OpeningScene }   from './scenes/opening.js';
import { Chapter1Scene }  from './scenes/chapter1.js';
import { Chapter2Scene }  from './scenes/chapter2.js';
import { Chapter3Scene }  from './scenes/chapter3.js';
import { RomeScene }      from './scenes/rome.js';
import { AmsterdamScene } from './scenes/amsterdam.js';
import { DinnerScene }    from './scenes/dinner.js';
import { RajasthanScene } from './scenes/rajasthan.js';
import { MoonlakeScene }  from './scenes/moonlake.js';
import { CinemaScene }    from './scenes/cinema.js';
import { PlayfulScene }   from './scenes/playful.js';
import { NatureScene }    from './scenes/nature.js';
import { ProposalScene }  from './scenes/proposal.js';

// ── Engine ──────────────────────────────────────────────
const engine = new Engine();
engine.init();

// ── UI helpers ──────────────────────────────────────────
function show(el) {
  if (!el) return;
  el.classList.remove('ui-hidden');
  el.style.visibility = 'visible';
  gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: 'power2.out' });
}
function hide(el) {
  if (!el) return;
  gsap.to(el, {
    opacity: 0, duration: 0.5, ease: 'power2.in',
    onComplete() {
      el.classList.add('ui-hidden');
      el.style.visibility = 'hidden';
    }
  });
}

// Attach UI API to engine
engine.ui = {
  show, hide,
  el(id) { return document.getElementById(id); },

  showCTA(text, cb) {
    const wrap = document.getElementById('cta-wrap');
    const btn  = document.getElementById('cta-btn');
    btn.textContent = text;
    btn.onclick = () => { hide(wrap); if (cb) cb(); };
    show(wrap);
  },
  hideCTA() { hide(document.getElementById('cta-wrap')); },

  showChapter(num, label) {
    if (!num && !label) return;
    const card = document.getElementById('chapter-card');
    document.getElementById('chapter-eyebrow').textContent = num ? `Chapter ${num}` : '';
    document.getElementById('chapter-heading').textContent = label || '';
    card.classList.remove('ui-hidden');
    card.style.visibility = 'visible';
    gsap.fromTo(card, { opacity: 0, y: 16 }, {
      opacity: 1, y: 0, duration: 1.1, ease: 'power2.out',
      onComplete() {
        setTimeout(() => hide(card), 3000);
      }
    });
  },

  showSceneText(lines) {
    const box = document.getElementById('scene-text');
    box.innerHTML = '';
    const divs = lines.map(t => {
      const d = document.createElement('p');
      d.className = 'scene-thought';
      d.textContent = t;
      box.appendChild(d);
      return d;
    });
    show(box);
    // Stagger reveal
    divs.forEach((d, i) => {
      setTimeout(() => d.classList.add('reveal'), 300 + i * 900);
    });
  },
  hideSceneText() { hide(document.getElementById('scene-text')); },

  showProgress(fraction) {
    const bar  = document.getElementById('progress-bar');
    const fill = document.getElementById('progress-fill');
    bar.classList.remove('ui-hidden');
    bar.style.visibility = 'visible';
    bar.style.opacity = '1';
    gsap.to(fill, { width: `${Math.round(fraction * 100)}%`, duration: 1.2, ease: 'power2.out' });
  },
};

// ── Scene registry ───────────────────────────────────────
const allScenes = [
  OpeningScene, Chapter1Scene, Chapter2Scene, Chapter3Scene,
  RomeScene, AmsterdamScene, DinnerScene, RajasthanScene,
  MoonlakeScene, CinemaScene, PlayfulScene, NatureScene, ProposalScene,
];
allScenes.forEach(s => engine.register(s));

// ── Audio button ─────────────────────────────────────────
document.getElementById('audio-ctrl').addEventListener('click', () => audio.toggle());

// ── Story progression ────────────────────────────────────
let storyIndex = -1;

engine.onAdvance = async function advanceStory() {
  storyIndex++;
  if (storyIndex >= STORY_SEQUENCE.length) return;

  const step = STORY_SEQUENCE[storyIndex];
  const prev = storyIndex > 0 ? STORY_SEQUENCE[storyIndex - 1] : null;

  // Progress bar
  engine.ui.showProgress(storyIndex / (STORY_SEQUENCE.length - 1));

  // Run transition
  if (step.transition) {
    await runTransition(
      step.transition,
      step.chapterLabel,           // location name for 'travel'
      async () => {
        // Midpoint callback: switch scene while overlay is opaque
        await engine.switchTo(step.id);
      }
    );
  } else {
    // No transition for opening
    await engine.switchTo(step.id);
  }

  // Show chapter card for labelled scenes (non-travel, since travel shows location card)
  if (step.chapterLabel && step.transition !== 'travel') {
    engine.ui.showChapter(step.chapterNum, step.chapterLabel);
  }
};

// ── Boot ─────────────────────────────────────────────────
async function boot() {
  // Show audio button
  const audioCtrl = document.getElementById('audio-ctrl');

  // Start render loop
  engine.start();

  // Start the story (index 0 = opening scene, no transition)
  await engine.switchTo('opening');
  storyIndex = 0;

  // Hide loading screen
  const loading = document.getElementById('loading-screen');
  gsap.to(loading, {
    opacity: 0, duration: 1.2, ease: 'power2.out',
    onComplete() {
      loading.style.display = 'none';
      // Reveal audio button
      audioCtrl.classList.remove('ui-hidden');
      audioCtrl.style.visibility = 'visible';
      gsap.fromTo(audioCtrl, { opacity: 0 }, { opacity: 1, duration: 0.8 });
    }
  });
}

// Small delay so fonts load
window.addEventListener('load', () => setTimeout(boot, 200));
