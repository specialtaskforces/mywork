/**
 * chapter2.js — The Letter.
 * Warm interior table with candle. Camera pushes toward table.
 * CSS 3D letter unfolds with line-by-line reveal.
 */
import * as THREE from 'three';
import { CONTENT } from '../config.js';

export const Chapter2Scene = {
  name: 'chapter2',
  threeScene: null,
  _candles: [],
  _time: 0,
  _initialized: false,

  init(engine) {
    const scene = new THREE.Scene();
    this.threeScene = scene;
    scene.fog = new THREE.Fog(0x100806, 4, 28);
    scene.background = new THREE.Color(0x0e0804);

    // ── Lights ──
    scene.add(new THREE.AmbientLight(0x3a1c08, 0.4));

    // Main room directional (slight moonlight through window)
    const dirLight = new THREE.DirectionalLight(0x4060a0, 0.2);
    dirLight.position.set(-5, 10, 5);
    scene.add(dirLight);

    // ── Floor ──
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshLambertMaterial({ color: 0x1a0e06 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.5;
    scene.add(floor);

    // ── Table ──
    const tableTop = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 0.1, 2),
      new THREE.MeshLambertMaterial({ color: 0x3d2010 })
    );
    tableTop.position.y = 0;
    scene.add(tableTop);

    // Table legs
    [[-1.6, -1.6], [-1.6, 0.85], [1.6, -1.6], [1.6, 0.85]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 1.5, 0.12),
        new THREE.MeshLambertMaterial({ color: 0x2a1508 })
      );
      leg.position.set(x, -0.75, z);
      scene.add(leg);
    });

    // ── Candles on table ──
    [[-0.8, 0, -0.3], [0.7, 0, 0.4]].forEach((pos, i) => {
      const candleGroup = this._makeCandle(scene, pos);
      this._candles.push(candleGroup.light);
    });

    // ── Letter on table (visible mesh) ──
    const letter = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.01, 1.1),
      new THREE.MeshLambertMaterial({ color: 0xf0e8d0 })
    );
    letter.position.set(0, 0.06, 0.2);
    scene.add(letter);

    // Envelope seal
    const seal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.02, 12),
      new THREE.MeshLambertMaterial({ color: 0xd4a020 })
    );
    seal.position.set(0, 0.08, 0.2);
    scene.add(seal);

    // ── Walls ──
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x1a0e08 });
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), wallMat);
    backWall.position.set(0, 3.5, -3.5);
    scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 10), wallMat.clone());
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-5, 3.5, 0);
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 10), wallMat.clone());
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(5, 3.5, 0);
    scene.add(rightWall);

    // ── Window with city glow ──
    const windowGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(2.5, 1.8),
      new THREE.MeshBasicMaterial({ color: 0x2040a0, transparent: true, opacity: 0.6 })
    );
    windowGlow.position.set(-3, 2, -3.4);
    scene.add(windowGlow);

    const windowFrame = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(2.5, 1.8, 0.05)),
      new THREE.LineBasicMaterial({ color: 0x3a2510 })
    );
    windowFrame.position.set(-3, 2, -3.3);
    scene.add(windowFrame);

    // Light from window
    const windowLight = new THREE.PointLight(0x2040a0, 0.3, 8);
    windowLight.position.set(-3, 2, -2);
    scene.add(windowLight);
  },

  enter(engine) {
    // Camera: starts far back, zooms to table
    engine.camera.position.set(0, 4, 10);
    engine.camera.lookAt(0, 0, 0);

    // Push toward table
    gsap.to(engine.camera.position, {
      y: 2.2, z: 4.5, duration: 2.5, ease: 'power2.inOut',
      onComplete: () => {
        // Show the letter scene UI
        this._showLetterUI(engine);
      }
    });
  },

  _showLetterUI(engine) {
    const letterScene = document.getElementById('letter-scene');
    const letterLines = document.getElementById('letter-lines');
    const signName    = document.getElementById('letter-sign-name');
    const openBtn     = document.getElementById('letter-open-btn');
    const doneBtn     = document.getElementById('letter-done-btn');

    // Populate letter content
    letterLines.innerHTML = '';
    CONTENT.chapter2.lines.forEach(line => {
      const p = document.createElement('p');
      p.className = 'letter-line';
      p.textContent = line;
      letterLines.appendChild(p);
    });
    signName.textContent = CONTENT.chapter2.signName;

    // Show scene
    letterScene.classList.remove('ui-hidden');
    letterScene.style.visibility = 'visible';
    gsap.fromTo(letterScene, { opacity: 0 }, { opacity: 1, duration: 0.9 });

    // Open button
    openBtn.onclick = () => {
      this._openLetter();
      openBtn.classList.add('ui-hidden');
    };

    // Done button
    doneBtn.onclick = () => {
      gsap.to(letterScene, {
        opacity: 0, duration: 0.7,
        onComplete: () => {
          letterScene.classList.add('ui-hidden');
          engine.advance();
        }
      });
    };
  },

  _openLetter() {
    const envelope = document.getElementById('letter-envelope');
    const paper    = document.getElementById('letter-paper');
    const salut    = document.querySelector('.letter-salutation');
    const lines    = document.querySelectorAll('.letter-line');
    const sign     = document.querySelector('.letter-sign');
    const doneBtn  = document.getElementById('letter-done-btn');

    // Slide envelope up / unfold paper
    envelope.classList.add('open');
    setTimeout(() => {
      paper.classList.add('unfolded');
    }, 500);

    // Stagger text reveal
    setTimeout(() => { salut.classList.add('reveal'); }, 900);
    lines.forEach((l, i) => {
      setTimeout(() => l.classList.add('reveal'), 1200 + i * 1000);
    });
    setTimeout(() => {
      sign.classList.add('reveal');
    }, 1400 + lines.length * 1000);

    // Show done button after all lines
    setTimeout(() => {
      doneBtn.classList.remove('ui-hidden');
      gsap.fromTo(doneBtn, { opacity: 0 }, { opacity: 1, duration: 0.6 });
    }, 1800 + lines.length * 1000);
  },

  update(delta) {
    this._time += delta;
    this._candles.forEach((light, i) => {
      light.intensity = 1.1 + 0.25 * Math.sin(this._time * 2.8 + i * 1.7);
    });
  },

  exit() {
    const letterScene = document.getElementById('letter-scene');
    letterScene.classList.add('ui-hidden');
    letterScene.style.visibility = 'hidden';
  },

  _makeCandle(scene, [cx, cy, cz]) {
    const group = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.6, 10),
      new THREE.MeshLambertMaterial({ color: 0xf5f0e0 })
    );
    body.position.set(cx, cy + 0.3, cz);
    scene.add(body);

    // Flame
    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.04, 0.18, 8),
      new THREE.MeshBasicMaterial({ color: 0xff9922 })
    );
    flame.position.set(cx, cy + 0.7, cz);
    scene.add(flame);

    // Candle light
    const light = new THREE.PointLight(0xff8833, 1.2, 6);
    light.position.set(cx, cy + 0.8, cz);
    scene.add(light);

    // Holder
    const holder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.1, 0.06, 10),
      new THREE.MeshLambertMaterial({ color: 0xb0883a })
    );
    holder.position.set(cx, cy + 0.03, cz);
    scene.add(holder);

    return { light };
  },
};
