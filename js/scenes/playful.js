/**
 * playful.js — Charming 2D canvas animation.
 * A small male character steals a golden heart.
 * The female chases him. He drops it. Both laugh. Then hearts rain.
 * Elegant, not cartoonish.
 */

export const PlayfulScene = {
  name: 'playful',
  threeScene: null,
  _animId: null,
  _time: 0,
  _phase: 0,        // 0=idle, 1=steal, 2=chase, 3=drop, 4=laugh, 5=hearts
  _initialized: false,

  init(engine) {
    this.threeScene = {
      isScene: true, background: null, fog: null, children: [], uuid: 'playful',
    };
  },

  enter(engine) {
    engine.camera.position.set(0, 0, 5);

    const playDiv    = document.getElementById('playful-scene');
    const canvas     = document.getElementById('playful-canvas');
    const continueBtn = document.getElementById('playful-continue');

    playDiv.classList.remove('ui-hidden');
    playDiv.style.visibility = 'visible';
    gsap.fromTo(playDiv, { opacity: 0 }, { opacity: 1, duration: 1 });

    const W = Math.min(600, window.innerWidth * 0.9);
    const H = Math.min(400, window.innerHeight * 0.55);
    canvas.width  = W;
    canvas.height = H;
    this._canvas  = canvas;
    this._ctx     = canvas.getContext('2d');
    this._time    = 0;
    this._phase   = 0;
    this._animActive = true;

    // Phase timeline
    setTimeout(() => this._phase = 1, 1000);   // steal
    setTimeout(() => this._phase = 2, 2500);   // chase
    setTimeout(() => this._phase = 3, 4500);   // drop
    setTimeout(() => this._phase = 4, 5500);   // laugh
    setTimeout(() => {                          // hearts + CTA
      this._phase = 5;
      continueBtn.classList.remove('ui-hidden');
      continueBtn.style.visibility = 'visible';
      gsap.fromTo(continueBtn, { opacity: 0 }, { opacity: 1, duration: 0.7 });
    }, 6500);

    continueBtn.onclick = () => {
      this._animActive = false;
      gsap.to(playDiv, {
        opacity: 0, duration: 0.7,
        onComplete: () => {
          playDiv.classList.add('ui-hidden');
          continueBtn.classList.add('ui-hidden');
          engine.advance();
        }
      });
    };

    this._loop();
  },

  _loop() {
    if (!this._animActive) return;
    this._time += 0.016;
    this._draw();
    this._animId = requestAnimationFrame(() => this._loop());
  },

  _draw() {
    const { _ctx: ctx, _canvas: c, _time: t, _phase: phase } = this;
    const W = c.width, H = c.height;
    const cx = W / 2, cy = H / 2;

    // Background
    ctx.clearRect(0, 0, W, H);
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0c0a18');
    bg.addColorStop(1, '#04030c');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Ground line
    ctx.strokeStyle = 'rgba(200,180,130,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, H * 0.78);
    ctx.lineTo(W, H * 0.78);
    ctx.stroke();

    // ── Character positions ──
    const groundY = H * 0.72;
    const maleR   = H * 0.08;
    const femR    = H * 0.075;
    const heartSize = maleR * 0.5;

    // Male character x
    let maleX;
    if (phase === 0) {
      // Idle: standing left-center
      maleX = cx - W * 0.2 + Math.sin(t * 0.8) * 2;
    } else if (phase === 1) {
      // Running right with heart
      maleX = cx - W * 0.2 + (t - 1) * 60;
    } else if (phase === 2) {
      // Running further right, being chased
      maleX = cx + W * 0.08 + (t - 2.5) * 40;
      maleX = Math.min(maleX, W * 0.82);
    } else if (phase >= 3) {
      maleX = W * 0.82;
    }

    // Female character x
    let femX;
    if (phase <= 1) {
      // Idle: standing right-center
      femX = cx + W * 0.15 + Math.sin(t * 0.9 + 1) * 2;
    } else if (phase === 2) {
      // Chasing
      femX = cx + W * 0.08 - W * 0.08 + (t - 2.5) * 35;
      femX = Math.min(femX, W * 0.7);
    } else {
      femX = W * 0.65;
    }

    // Heart position
    let heartX = cx;
    let heartY = groundY - maleR * 0.8;
    let heartVisible = true;

    if (phase === 0) {
      // Heart between them, floating
      heartX = cx;
      heartY = groundY - H * 0.2 + Math.sin(t * 1.5) * 4;
    } else if (phase === 1 || phase === 2) {
      // Heart being held by male
      heartX = maleX + maleR * 0.7;
      heartY = groundY - maleR * 1.1;
    } else if (phase === 3) {
      // Heart dropped, falling
      heartX = maleX - maleR * 0.3;
      heartY = groundY - maleR * 0.8 + (t - 4.5) * 60;
      if (heartY > groundY - 10) heartY = groundY - 10;
    } else if (phase >= 4) {
      // Heart back between them
      heartX = (maleX + femX) / 2;
      heartY = groundY - maleR * 1.5 - Math.sin((t - 5.5) * 2) * 8;
    }

    // ── Draw male character ──
    ctx.save();
    ctx.translate(maleX, groundY);

    // Body
    ctx.fillStyle = 'rgba(180, 155, 120, 0.9)';
    ctx.beginPath();
    ctx.ellipse(0, -maleR * 1.4, maleR * 0.45, maleR * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    const maleBob = phase === 1 || phase === 2 ? Math.sin(t * 8) * 3 : 0;
    ctx.fillStyle = 'rgba(210, 180, 145, 0.95)';
    ctx.beginPath();
    ctx.arc(0, -maleR * 2.3 + maleBob, maleR, 0, Math.PI * 2);
    ctx.fill();

    // Hair (dark)
    ctx.fillStyle = 'rgba(40, 25, 12, 0.9)';
    ctx.beginPath();
    ctx.arc(0, -maleR * 2.55 + maleBob, maleR * 0.85, Math.PI + 0.3, Math.PI * 2 - 0.3);
    ctx.fill();

    // Eyes
    if (phase === 4 || phase === 5) {
      // Laughing eyes (squinted)
      ctx.strokeStyle = 'rgba(60, 35, 15, 0.9)';
      ctx.lineWidth = maleR * 0.12;
      ctx.lineCap = 'round';
      [-0.35, 0.35].forEach(ex => {
        ctx.beginPath();
        ctx.arc(maleR * ex, -maleR * 2.2 + maleBob, maleR * 0.18, 0, Math.PI);
        ctx.stroke();
      });
    } else {
      ctx.fillStyle = 'rgba(40, 25, 12, 0.9)';
      [-0.35, 0.35].forEach(ex => {
        ctx.beginPath();
        ctx.arc(maleR * ex, -maleR * 2.25 + maleBob, maleR * 0.12, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Arms (running motion)
    if (phase === 1 || phase === 2) {
      ctx.strokeStyle = 'rgba(200, 170, 130, 0.7)';
      ctx.lineWidth = maleR * 0.22;
      ctx.lineCap = 'round';
      const armAngle = Math.sin(t * 8) * 0.5;
      ctx.beginPath();
      ctx.moveTo(maleR * 0.4, -maleR * 1.5);
      ctx.lineTo(maleR * 0.9 + armAngle * maleR, -maleR * 0.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-maleR * 0.4, -maleR * 1.5);
      ctx.lineTo(-maleR * 0.9 - armAngle * maleR, -maleR * 0.9);
      ctx.stroke();
    }
    ctx.restore();

    // ── Draw female character ──
    ctx.save();
    ctx.translate(femX, groundY);
    ctx.scale(-1, 1); // Mirror to face left

    // Dress/body
    ctx.fillStyle = 'rgba(180, 155, 120, 0.9)';
    ctx.beginPath();
    ctx.ellipse(0, -femR * 1.4, femR * 0.5, femR * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    const femBob = phase === 2 ? Math.sin(t * 7 + 0.5) * 3 : 0;
    ctx.fillStyle = 'rgba(215, 185, 148, 0.95)';
    ctx.beginPath();
    ctx.arc(0, -femR * 2.3 + femBob, femR, 0, Math.PI * 2);
    ctx.fill();

    // Long hair
    ctx.fillStyle = 'rgba(30, 18, 8, 0.9)';
    ctx.beginPath();
    ctx.arc(0, -femR * 2.5 + femBob, femR * 0.9, Math.PI + 0.1, Math.PI * 2 - 0.1);
    ctx.fill();
    // Hair flowing down side
    ctx.beginPath();
    ctx.ellipse(femR * 0.55, -femR * 1.8 + femBob, femR * 0.2, femR * 0.65, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    if (phase === 4 || phase === 5) {
      ctx.strokeStyle = 'rgba(60, 35, 15, 0.9)';
      ctx.lineWidth = femR * 0.12;
      ctx.lineCap = 'round';
      [-0.35, 0.35].forEach(ex => {
        ctx.beginPath();
        ctx.arc(femR * ex, -femR * 2.2 + femBob, femR * 0.15, 0, Math.PI);
        ctx.stroke();
      });
    } else {
      ctx.fillStyle = 'rgba(40, 25, 12, 0.9)';
      [-0.35, 0.35].forEach(ex => {
        ctx.beginPath();
        ctx.arc(femR * ex, -femR * 2.25 + femBob, femR * 0.11, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    ctx.restore();

    // ── Draw heart ──
    if (phase < 5) {
      this._drawHeart(ctx, heartX, heartY, heartSize, '#d4a843');
    }

    // ── Phase 5: Rain of tiny hearts ──
    if (phase === 5) {
      const count = 15;
      for (let i = 0; i < count; i++) {
        const hx = (i / count) * W * 0.9 + W * 0.05;
        const hy = ((t * 0.6 + i * 0.2) % 1) * H * 0.9;
        const alpha = Math.sin(((t * 0.6 + i * 0.2) % 1) * Math.PI);
        ctx.globalAlpha = alpha * 0.7;
        this._drawHeart(ctx, hx, hy, heartSize * 0.7, i % 2 === 0 ? '#d4a843' : '#ff8080');
        ctx.globalAlpha = 1;
      }
    }

    // Vignette
    const vig = ctx.createRadialGradient(W/2, H/2, H*0.2, W/2, H/2, W*0.75);
    vig.addColorStop(0, 'transparent');
    vig.addColorStop(1, 'rgba(4, 3, 12, 0.55)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  },

  _drawHeart(ctx, x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.4);
    ctx.bezierCurveTo(x, y, x - size * 0.7, y, x - size * 0.7, y - size * 0.4);
    ctx.bezierCurveTo(x - size * 0.7, y - size * 0.9, x, y - size * 0.9, x, y - size * 0.5);
    ctx.bezierCurveTo(x, y - size * 0.9, x + size * 0.7, y - size * 0.9, x + size * 0.7, y - size * 0.4);
    ctx.bezierCurveTo(x + size * 0.7, y, x, y, x, y + size * 0.4);
    ctx.fill();
  },

  update() {},

  exit() {
    this._animActive = false;
    if (this._animId) cancelAnimationFrame(this._animId);
    const div = document.getElementById('playful-scene');
    div.classList.add('ui-hidden');
    div.style.visibility = 'hidden';
  },
};
