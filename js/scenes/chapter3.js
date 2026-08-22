/**
 * chapter3.js — Emotional Reaction.
 * A stylized geometric character "reads" the letter, pauses, smiles.
 * 2D canvas animation — elegant, not cartoonish.
 */
import { CONTENT } from '../config.js';

export const Chapter3Scene = {
  name: 'chapter3',
  threeScene: null,   // no Three.js for this overlay scene
  _canvas: null,
  _ctx: null,
  _animId: null,
  _time: 0,
  _phase: 0,         // 0=reading, 1=pause, 2=smile, 3=done
  _initialized: false,

  init(engine) {
    // Use a dummy Three.js scene (black) so renderer doesn't crash
    // We overlay the canvas on top via CSS
    const THREE = window._THREE_REF;
    this.threeScene = { isScene: true, background: null, fog: null, children: [], uuid: 'c3' };
  },

  enter(engine) {
    engine.camera.position.set(0, 0, 5);

    const reactionDiv = document.getElementById('reaction-scene');
    const canvas      = document.getElementById('reaction-canvas');
    const continueBtn = document.getElementById('reaction-continue');

    reactionDiv.classList.remove('ui-hidden');
    reactionDiv.style.visibility = 'visible';
    gsap.fromTo(reactionDiv, { opacity: 0 }, { opacity: 1, duration: 1 });

    // Size canvas
    const W = Math.min(500, window.innerWidth * 0.9);
    const H = Math.min(400, window.innerHeight * 0.6);
    canvas.width  = W;
    canvas.height = H;
    this._canvas = canvas;
    this._ctx    = canvas.getContext('2d');
    this._time   = 0;
    this._phase  = 0;

    // Start animation
    this._animActive = true;
    this._drawLoop();

    // Phase timeline
    setTimeout(() => { this._phase = 1; }, 2000);  // pause
    setTimeout(() => { this._phase = 2; }, 3500);  // smile
    setTimeout(() => {                              // show CTA
      continueBtn.classList.remove('ui-hidden');
      continueBtn.style.visibility = 'visible';
      gsap.fromTo(continueBtn, { opacity: 0 }, { opacity: 1, duration: 0.7 });
    }, 5000);

    continueBtn.onclick = () => {
      this._animActive = false;
      gsap.to(reactionDiv, {
        opacity: 0, duration: 0.7,
        onComplete: () => {
          reactionDiv.classList.add('ui-hidden');
          continueBtn.classList.add('ui-hidden');
          engine.advance();
        }
      });
    };
  },

  _drawLoop() {
    if (!this._animActive) return;
    this._time += 0.016;
    this._draw();
    this._animId = requestAnimationFrame(() => this._drawLoop());
  },

  _draw() {
    const { _ctx: ctx, _canvas: canvas, _time: t, _phase: phase } = this;
    const W = canvas.width;
    const H = canvas.height;

    // Background
    ctx.clearRect(0, 0, W, H);
    const bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W * 0.7);
    bg.addColorStop(0, 'rgba(35, 20, 10, 0.95)');
    bg.addColorStop(1, 'rgba(10, 5, 2, 0.98)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // ── Her figure ──
    const cx = W * 0.5;
    const baseY = H * 0.78;

    // Body (elegant ellipse)
    ctx.save();
    ctx.translate(cx, baseY);
    ctx.fillStyle = 'rgba(230, 200, 165, 0.15)';
    ctx.beginPath();
    ctx.ellipse(0, -H * 0.16, H * 0.1, H * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Head — slightly tilted based on phase
    let headTilt = 0;
    let headY    = baseY - H * 0.38;
    let bodyLean = 0;

    if (phase === 0) {
      // Reading: head looks down slightly
      headTilt = 0.2 + Math.sin(t * 0.5) * 0.05;
      headY    = baseY - H * 0.38 + H * 0.02;
    } else if (phase === 1) {
      // Pause: head lifts slightly, thinking
      headTilt = 0.08;
      headY    = baseY - H * 0.4;
    } else if (phase === 2) {
      // Smile: head tilts to side gently
      headTilt = -0.15 + Math.sin(t * 0.3) * 0.04;
      headY    = baseY - H * 0.42;
      bodyLean = 0.06;
    }

    // Draw body
    ctx.save();
    ctx.translate(cx, baseY);
    ctx.rotate(bodyLean);
    // Shoulders
    ctx.strokeStyle = 'rgba(200, 170, 130, 0.5)';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(-H * 0.09, -H * 0.25);
    ctx.quadraticCurveTo(0, -H * 0.27, H * 0.09, -H * 0.25);
    ctx.stroke();
    // Torso silhouette
    ctx.fillStyle = 'rgba(180, 140, 100, 0.2)';
    ctx.beginPath();
    ctx.moveTo(-H * 0.07, -H * 0.25);
    ctx.bezierCurveTo(-H * 0.09, 0, -H * 0.07, 0, 0, 0);
    ctx.bezierCurveTo(H * 0.07, 0, H * 0.09, 0, H * 0.07, -H * 0.25);
    ctx.fill();
    ctx.restore();

    // Head
    const headR = H * 0.09;
    ctx.save();
    ctx.translate(cx, headY);
    ctx.rotate(headTilt);

    // Head glow
    const hGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, headR * 1.8);
    hGrad.addColorStop(0, 'rgba(230, 200, 160, 0.08)');
    hGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = hGrad;
    ctx.beginPath();
    ctx.arc(0, 0, headR * 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Head circle
    ctx.fillStyle = 'rgba(220, 185, 145, 0.85)';
    ctx.beginPath();
    ctx.arc(0, 0, headR, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    const eyeOpen = phase === 2
      ? 0.3 + 0.1 * Math.sin(t * 0.4)  // softer when smiling
      : 0.38;

    [-0.35, 0.35].forEach(ex => {
      ctx.fillStyle = 'rgba(60, 35, 20, 0.9)';
      ctx.beginPath();
      ctx.ellipse(headR * ex, -headR * 0.1, headR * 0.12, headR * eyeOpen, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Smile / expression
    if (phase >= 2) {
      ctx.strokeStyle = 'rgba(80, 45, 25, 0.7)';
      ctx.lineWidth   = headR * 0.1;
      ctx.lineCap     = 'round';
      ctx.beginPath();
      ctx.arc(0, headR * 0.25, headR * 0.32, 0.2, Math.PI - 0.2);
      ctx.stroke();
    } else {
      // Neutral / slight reading expression
      ctx.strokeStyle = 'rgba(80, 45, 25, 0.5)';
      ctx.lineWidth   = headR * 0.08;
      ctx.lineCap     = 'round';
      ctx.beginPath();
      ctx.moveTo(-headR * 0.25, headR * 0.25);
      ctx.lineTo(headR * 0.25, headR * 0.25);
      ctx.stroke();
    }

    // Hair (dark arc above head)
    ctx.fillStyle = 'rgba(30, 18, 8, 0.9)';
    ctx.beginPath();
    ctx.arc(0, -headR * 0.3, headR * 1.05, Math.PI * 1.1, Math.PI * 1.9);
    ctx.fill();

    ctx.restore();

    // ── Heart particles (phase 2 only) ──
    if (phase >= 2) {
      const heartCount = 5;
      for (let i = 0; i < heartCount; i++) {
        const hProgress = ((t * 0.5 + i * 0.4) % 1);
        const hx = cx + (Math.sin(i * 2.1) * 40);
        const hy = headY - hProgress * 80;
        const alpha = 1 - hProgress;
        const size  = 8 * (1 - hProgress * 0.5);

        ctx.save();
        ctx.globalAlpha = alpha * 0.7;
        ctx.fillStyle   = '#d4a843';
        ctx.translate(hx, hy);
        ctx.scale(size / 10, size / 10);
        ctx.beginPath();
        ctx.moveTo(0, 3);
        ctx.bezierCurveTo(0, 0, -5, 0, -5, -3);
        ctx.bezierCurveTo(-5, -6, 0, -6, 0, -3);
        ctx.bezierCurveTo(0, -6, 5, -6, 5, -3);
        ctx.bezierCurveTo(5, 0, 0, 0, 0, 3);
        ctx.fill();
        ctx.restore();
      }
    }

    // ── Letter (reading phase) ──
    if (phase === 0) {
      const lx = cx - W * 0.12;
      const ly = baseY - H * 0.22;
      const lw = W * 0.24;
      const lh = H * 0.18;

      // Paper
      ctx.fillStyle   = 'rgba(245, 235, 210, 0.85)';
      ctx.strokeStyle = 'rgba(180, 150, 100, 0.4)';
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.rect(lx, ly, lw, lh);
      ctx.fill();
      ctx.stroke();

      // Lines on paper
      for (let i = 0; i < 4; i++) {
        ctx.strokeStyle = 'rgba(100, 80, 50, 0.2)';
        ctx.lineWidth   = 0.8;
        ctx.beginPath();
        ctx.moveTo(lx + lw * 0.1, ly + lh * (0.2 + i * 0.18));
        ctx.lineTo(lx + lw * 0.9, ly + lh * (0.2 + i * 0.18));
        ctx.stroke();
      }
    }

    // ── Warm vignette ──
    const vig = ctx.createRadialGradient(W/2, H/2, H * 0.2, W/2, H/2, W * 0.8);
    vig.addColorStop(0, 'transparent');
    vig.addColorStop(1, 'rgba(8, 4, 2, 0.5)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  },

  update(delta) { /* animation handled by _drawLoop */ },

  exit() {
    this._animActive = false;
    if (this._animId) cancelAnimationFrame(this._animId);
    const div = document.getElementById('reaction-scene');
    div.classList.add('ui-hidden');
    div.style.visibility = 'hidden';
  },
};
