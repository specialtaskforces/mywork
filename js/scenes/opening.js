/**
 * opening.js — Cinematic evening valley scene.
 * Dense star field, layered mountains, warm village lights, winding path.
 * First impression: "I have arrived somewhere beautiful."
 */
import * as THREE from 'three';
import { CONTENT } from '../config.js';

export const OpeningScene = {
  name: 'opening',
  threeScene: null,
  _particles: null,
  _warmLights: [],
  _time: 0,
  _initialized: false,

  init(engine) {
    const scene = new THREE.Scene();
    this.threeScene = scene;
    scene.fog = new THREE.FogExp2(0x0a1628, 0.016);
    scene.background = new THREE.Color(0x060e1e);

    // ── Lights ──
    scene.add(new THREE.AmbientLight(0x1a2a4a, 0.6));

    const moonLight = new THREE.DirectionalLight(0x8090c8, 0.5);
    moonLight.position.set(20, 40, -30);
    scene.add(moonLight);

    const horizonGlow = new THREE.PointLight(0xff6622, 1.2, 120);
    horizonGlow.position.set(-10, -2, -60);
    scene.add(horizonGlow);

    // ── Ground ──
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(300, 300),
      new THREE.MeshLambertMaterial({ color: 0x0d1a0e })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3;
    scene.add(ground);

    // ── Layered mountain silhouettes ──
    const mtnColors = [0x060e0a, 0x081208, 0x0a160a, 0x0d1c10];
    const mtnHeights = [16, 14, 12, 10];
    mtnColors.forEach((col, i) => {
      const geo = new THREE.PlaneGeometry(260, mtnHeights[i]);
      const mat = new THREE.MeshBasicMaterial({ color: col, side: THREE.FrontSide });
      const mtn = new THREE.Mesh(geo, mat);
      mtn.position.z = -60 + i * 14;
      mtn.position.y = 2 - i;
      scene.add(mtn);
    });

    // ── Stars ──
    scene.add(this._makeStarField(700));

    // ── Moon ──
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(3, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xe8dfc0 })
    );
    moon.position.set(35, 55, -150);
    scene.add(moon);

    // ── Trees (both sides of path) ──
    for (let i = 0; i < 24; i++) {
      const tree = this._makeTree();
      const side = i % 2 === 0 ? 1 : -1;
      tree.position.set(
        side * (4.5 + Math.random() * 22),
        -3,
        -6 - Math.random() * 50
      );
      tree.scale.setScalar(0.5 + Math.random() * 0.65);
      tree.rotation.y = Math.random() * Math.PI * 2;
      scene.add(tree);
    }

    // ── Winding path ──
    const path = new THREE.Mesh(
      new THREE.PlaneGeometry(2.5, 80),
      new THREE.MeshLambertMaterial({ color: 0x1a2415 })
    );
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, -2.95, -30);
    scene.add(path);

    // ── Village warm lights in distance ──
    const lightCols = [0xff9933, 0xffbb44, 0xff7722, 0xffcc55];
    for (let i = 0; i < 12; i++) {
      const col = lightCols[i % lightCols.length];
      const pl = new THREE.PointLight(col, 0.6 + Math.random() * 0.4, 12);
      pl.position.set(
        (Math.random() - 0.5) * 60,
        -1.5 + Math.random() * 1.5,
        -30 - Math.random() * 40
      );
      scene.add(pl);
      this._warmLights.push(pl);

      // Visible bulb
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 6, 6),
        new THREE.MeshBasicMaterial({ color: col })
      );
      bulb.position.copy(pl.position);
      scene.add(bulb);
    }

    // ── Floating particles (fireflies / dust) ──
    const pGeo = new THREE.BufferGeometry();
    const pCount = 120;
    const pPos = new Float32Array(pCount * 3);
    const pPhase = new Float32Array(pCount);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3]     = (Math.random() - 0.5) * 40;
      pPos[i * 3 + 1] = 0.5 + Math.random() * 5;
      pPos[i * 3 + 2] = -5 - Math.random() * 35;
      pPhase[i]       = Math.random() * Math.PI * 2;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.userData.phase = pPhase;
    const pMat = new THREE.PointsMaterial({
      color: 0xffff99, size: 0.12, transparent: true, opacity: 0.55,
      sizeAttenuation: true,
    });
    this._particles = new THREE.Points(pGeo, pMat);
    scene.add(this._particles);
  },

  enter(engine) {
    // Camera start position
    engine.camera.position.set(0, 2.5, 14);
    engine.camera.rotation.set(-0.05, 0, 0);

    // Show opening text with staggered reveal
    const title = document.getElementById('opening-title');
    title.classList.remove('ui-hidden');
    title.style.visibility = 'visible';
    title.style.opacity = '0';
    gsap.to(title, { opacity: 1, duration: 1.5, ease: 'power2.out', delay: 0.8 });

    const lines = title.querySelectorAll('.opening-line');
    lines.forEach((l, i) => {
      setTimeout(() => l.classList.add('reveal'), 1200 + i * 800);
    });

    // Slow cinematic camera push-in while idle
    this._idleTween = gsap.to(engine.camera.position, {
      z: 10, y: 2.2, duration: 20, ease: 'none',
    });

    // Show CTA after 2.5s
    setTimeout(() => {
      engine.ui.showCTA(CONTENT.opening.cta, () => this._startJourney(engine));
    }, 2500);
  },

  _startJourney(engine) {
    if (this._idleTween) this._idleTween.kill();

    // Hide opening title
    const title = document.getElementById('opening-title');
    gsap.to(title, {
      opacity: 0, duration: 0.8, onComplete() {
        title.classList.add('ui-hidden');
      }
    });

    // Camera advances forward briskly
    gsap.to(engine.camera.position, {
      z: -5, y: 1.5, duration: 2.8, ease: 'power2.inOut',
      onComplete: () => engine.advance()
    });
    gsap.to(engine.camera.rotation, { x: 0, duration: 2.8, ease: 'power2.inOut' });
  },

  update(delta, engine) {
    this._time += delta;
    if (!this._particles) return;

    const pos   = this._particles.geometry.attributes.position.array;
    const phase = this._particles.geometry.userData.phase;
    for (let i = 0; i < pos.length / 3; i++) {
      pos[i * 3 + 1] += Math.sin(this._time * 0.8 + phase[i]) * 0.003;
      pos[i * 3]     += Math.cos(this._time * 0.4 + phase[i]) * 0.002;
      // Wrap
      if (pos[i * 3 + 1] > 7) pos[i * 3 + 1] = 0.5;
    }
    this._particles.geometry.attributes.position.needsUpdate = true;

    // Subtle light flicker
    this._warmLights.forEach((pl, i) => {
      pl.intensity = 0.55 + 0.15 * Math.sin(this._time * 2.1 + i);
    });
  },

  exit(engine) {
    if (this._idleTween) this._idleTween.kill();
    engine.ui.hideCTA();
    const title = document.getElementById('opening-title');
    title.classList.add('ui-hidden');
  },

  dispose() {
    Engine.disposeScene && Engine.disposeScene(this.threeScene);
  },

  // ── Helpers ──

  _makeStarField(count) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 400;
      pos[i * 3 + 1] = 15 + Math.random() * 100;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 400;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0xffffff, size: 0.22, transparent: true, opacity: 0.7,
      sizeAttenuation: true,
    }));
  },

  _makeTree() {
    const g = new THREE.Group();
    // Trunk
    g.add(Object.assign(new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.32, 4, 7),
      new THREE.MeshLambertMaterial({ color: 0x1e0e06 })
    ), { position: { x: 0, y: 2, z: 0 } }));
    // Canopy tiers
    [[2.4, 4, 5.8], [1.8, 3.2, 8.2], [1.2, 2.4, 10.2]].forEach(([r, h, y]) => {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(r, h, 8),
        new THREE.MeshLambertMaterial({ color: 0x0a1808 })
      );
      cone.position.y = y;
      g.add(cone);
    });
    return g;
  },
};

// Import Engine for static dispose helper
import { Engine } from '../engine.js';
