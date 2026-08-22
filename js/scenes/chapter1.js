/**
 * chapter1.js — Garden of Thoughts.
 * Moonlit forest clearing. Floating personal thoughts appear and fade.
 * Soft leaves drift downward. Camera slowly circles.
 */
import * as THREE from 'three';
import { CONTENT } from '../config.js';

export const Chapter1Scene = {
  name: 'chapter1',
  threeScene: null,
  _leaves: null,
  _orbit: null,
  _time: 0,
  _initialized: false,

  init(engine) {
    const scene = new THREE.Scene();
    this.threeScene = scene;
    scene.fog = new THREE.FogExp2(0x0b160e, 0.022);
    scene.background = new THREE.Color(0x080e0a);

    // ── Lights ──
    scene.add(new THREE.AmbientLight(0x1a3025, 0.5));

    // Moonlight from above-right
    const moon = new THREE.DirectionalLight(0x7090a0, 0.6);
    moon.position.set(15, 30, -10);
    scene.add(moon);

    // Warm centre glow (lantern on ground)
    const centreLight = new THREE.PointLight(0xff9940, 1.4, 18);
    centreLight.position.set(0, 1, 0);
    scene.add(centreLight);
    this._centreLight = centreLight;

    // Lantern object
    const lantern = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xffcc66 })
    );
    lantern.position.set(0, 1, 0);
    scene.add(lantern);

    // ── Ground ──
    scene.add(Object.assign(
      new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.MeshLambertMaterial({ color: 0x0c1a0e })
      ),
      { rotation: new THREE.Euler(-Math.PI / 2, 0, 0), position: new THREE.Vector3(0, -2, 0) }
    ));

    // ── Circular tree ring ──
    const treeCount = 16;
    for (let i = 0; i < treeCount; i++) {
      const angle = (i / treeCount) * Math.PI * 2;
      const r = 12 + Math.random() * 4;
      const tree = this._makeTree();
      tree.position.set(Math.sin(angle) * r, -2, Math.cos(angle) * r);
      tree.scale.setScalar(0.7 + Math.random() * 0.6);
      tree.rotation.y = Math.random() * Math.PI * 2;
      scene.add(tree);
    }

    // ── Extra scattered trees behind ──
    for (let i = 0; i < 20; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 18 + Math.random() * 20;
      const t = this._makeTree();
      t.position.set(Math.sin(a) * r, -2, Math.cos(a) * r);
      t.scale.setScalar(0.5 + Math.random() * 0.8);
      scene.add(t);
    }

    // ── Stars visible through canopy ──
    const sGeo = new THREE.BufferGeometry();
    const sPos = new Float32Array(300 * 3);
    for (let i = 0; i < 300; i++) {
      sPos[i * 3]     = (Math.random() - 0.5) * 300;
      sPos[i * 3 + 1] = 25 + Math.random() * 80;
      sPos[i * 3 + 2] = (Math.random() - 0.5) * 300;
    }
    sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    scene.add(new THREE.Points(sGeo, new THREE.PointsMaterial({
      color: 0xffffff, size: 0.2, transparent: true, opacity: 0.55,
    })));

    // ── Falling leaves ──
    const leafGeo = new THREE.BufferGeometry();
    const leafCount = 80;
    const leafPos = new Float32Array(leafCount * 3);
    const leafPhase = new Float32Array(leafCount);
    for (let i = 0; i < leafCount; i++) {
      leafPos[i * 3]     = (Math.random() - 0.5) * 24;
      leafPos[i * 3 + 1] = Math.random() * 20;
      leafPos[i * 3 + 2] = (Math.random() - 0.5) * 24;
      leafPhase[i]       = Math.random() * Math.PI * 2;
    }
    leafGeo.setAttribute('position', new THREE.BufferAttribute(leafPos, 3));
    leafGeo.userData.phase = leafPhase;
    this._leaves = new THREE.Points(leafGeo, new THREE.PointsMaterial({
      color: 0x4a7a30, size: 0.18, transparent: true, opacity: 0.6,
      sizeAttenuation: true,
    }));
    scene.add(this._leaves);
  },

  enter(engine) {
    engine.camera.position.set(8, 3, 8);
    engine.camera.lookAt(0, 1, 0);
    engine.camera.rotation.set(0, 0, 0);

    // Smooth look-at
    gsap.to(engine.camera.rotation, { y: -Math.PI * 0.2, duration: 2, ease: 'power2.out' });

    // Show thoughts one by one
    const thoughts = CONTENT.chapter1.thoughts;
    engine.ui.showSceneText(thoughts);

    // Show CTA after all thoughts are shown
    const lastDelay = 600 + thoughts.length * 1000;
    setTimeout(() => {
      engine.ui.showCTA('CONTINUE', () => {
        engine.ui.hideSceneText();
        this._exit(engine);
      });
    }, lastDelay);

    // Start gentle orbit
    this._startOrbit(engine);
  },

  _startOrbit(engine) {
    let angle = 0.5;
    const radius = 10;
    this._orbitActive = true;

    const tick = () => {
      if (!this._orbitActive) return;
      angle += 0.002;
      engine.camera.position.x = Math.sin(angle) * radius;
      engine.camera.position.z = Math.cos(angle) * radius;
      engine.camera.position.y = 2.5 + Math.sin(angle * 0.5) * 0.5;
      engine.camera.lookAt(0, 1, 0);
      requestAnimationFrame(tick);
    };
    tick();
  },

  _exit(engine) {
    this._orbitActive = false;
    engine.ui.hideCTA();
    // Camera moves forward toward centre then advance
    gsap.to(engine.camera.position, {
      x: 0, y: 2, z: 3, duration: 1.8, ease: 'power2.inOut',
      onComplete: () => engine.advance()
    });
  },

  update(delta) {
    this._time += delta;
    if (!this._leaves) return;
    const pos   = this._leaves.geometry.attributes.position.array;
    const phase = this._leaves.geometry.userData.phase;
    for (let i = 0; i < pos.length / 3; i++) {
      pos[i * 3 + 1] -= 0.008;
      pos[i * 3]     += Math.sin(this._time + phase[i]) * 0.003;
      if (pos[i * 3 + 1] < -3) pos[i * 3 + 1] = 22;
    }
    this._leaves.geometry.attributes.position.needsUpdate = true;

    // Lantern flicker
    if (this._centreLight) {
      this._centreLight.intensity = 1.3 + 0.2 * Math.sin(this._time * 3.5);
    }
  },

  exit() {
    this._orbitActive = false;
  },

  _makeTree() {
    const g = new THREE.Group();
    g.add(Object.assign(new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.3, 4.5, 7),
      new THREE.MeshLambertMaterial({ color: 0x160a04 })
    ), { position: new THREE.Vector3(0, 2.25, 0) }));
    [[2.6, 5, 6.5], [2, 4, 9.5], [1.4, 3, 12]].forEach(([r, h, y]) => {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(r, h, 8),
        new THREE.MeshLambertMaterial({ color: 0x091606 })
      );
      cone.position.y = y;
      g.add(cone);
    });
    return g;
  },
};
