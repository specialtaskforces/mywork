/**
 * moonlake.js — Original romantic world: moonlit lake with wooden deck.
 * Dense star field, moon reflection, fireflies, wooden dock, deep water.
 */
import * as THREE from 'three';
import { CONTENT } from '../config.js';

export const MoonlakeScene = {
  name: 'moonlake',
  threeScene: null,
  _fireflies: null,
  _waterMat: null,
  _time: 0,
  _initialized: false,

  init(engine) {
    const scene = new THREE.Scene();
    this.threeScene = scene;
    scene.fog = new THREE.FogExp2(0x050810, 0.014);
    scene.background = new THREE.Color(0x040610);

    // ── Lights ──
    scene.add(new THREE.AmbientLight(0x0a1020, 0.4));

    const moonLight = new THREE.DirectionalLight(0x8090c8, 0.6);
    moonLight.position.set(-10, 40, -30);
    scene.add(moonLight);

    // Water reflection light
    const waterReflection = new THREE.PointLight(0x1a3060, 0.5, 30);
    waterReflection.position.set(0, 0.5, 0);
    scene.add(waterReflection);
    this._waterReflection = waterReflection;

    // ── Dense star field ──
    scene.add(this._makeStars(900));

    // ── Moon ──
    const moonMesh = new THREE.Mesh(
      new THREE.SphereGeometry(4, 20, 20),
      new THREE.MeshBasicMaterial({ color: 0xe8dfc8 })
    );
    moonMesh.position.set(-30, 60, -120);
    scene.add(moonMesh);

    // Moon glow halo
    const haloGeo = new THREE.SphereGeometry(6, 20, 20);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xc0c8e0, transparent: true, opacity: 0.08, side: THREE.BackSide
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.copy(moonMesh.position);
    scene.add(halo);

    // ── Water (large dark lake) ──
    this._waterMat = new THREE.MeshLambertMaterial({
      color: 0x060c18, transparent: true, opacity: 0.92,
    });
    scene.add(Object.assign(
      new THREE.Mesh(new THREE.PlaneGeometry(200, 200), this._waterMat),
      { rotation: new THREE.Euler(-Math.PI/2,0,0), position: new THREE.Vector3(0,-0.5,0) }
    ));

    // Moon reflection on water
    const reflectionMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 60),
      new THREE.MeshBasicMaterial({ color: 0x8090c8, transparent: true, opacity: 0.15 })
    );
    reflectionMesh.rotation.x = -Math.PI/2;
    reflectionMesh.position.set(-5, -0.48, -10);
    scene.add(reflectionMesh);
    this._reflectionMesh = reflectionMesh;

    // ── Wooden dock ──
    this._makeDock(scene);

    // ── Distant shoreline trees ──
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI + Math.PI;
      const r = 35 + Math.random() * 20;
      const tree = this._makeTree();
      tree.position.set(Math.sin(angle) * r, -0.5, Math.cos(angle) * r - 5);
      tree.scale.setScalar(0.6 + Math.random() * 0.8);
      scene.add(tree);
    }

    // ── Fireflies ──
    this._fireflies = this._makeFireflies(scene);

    // ── Lily pads (flat circles near dock) ──
    const padMat = new THREE.MeshLambertMaterial({ color: 0x1a3010 });
    [[2, 0, 2], [-1.5, 0, 3.5], [3.5, 0, 5]].forEach(([x, y, z]) => {
      const pad = new THREE.Mesh(new THREE.CircleGeometry(0.35 + Math.random()*0.2, 12), padMat.clone());
      pad.rotation.x = -Math.PI/2;
      pad.position.set(x, -0.47, z);
      scene.add(pad);
    });
  },

  enter(engine) {
    engine.camera.position.set(0, 2, 10);
    engine.camera.rotation.set(-0.08, 0, 0);

    gsap.to(engine.camera.position, { z: 4, y: 1.8, duration: 3, ease: 'power2.inOut' });

    setTimeout(() => engine.ui.showSceneText([CONTENT.moonlake.message]), 2500);

    setTimeout(() => {
      engine.ui.showCTA('CONTINUE', () => {
        engine.ui.hideSceneText();
        engine.ui.hideCTA();
        engine.advance();
      });
    }, 4500);
  },

  update(delta) {
    this._time += delta;

    // Animate fireflies
    if (this._fireflies) {
      const pos   = this._fireflies.geo.attributes.position.array;
      const phase = this._fireflies.phase;
      for (let i = 0; i < pos.length/3; i++) {
        pos[i*3]   += Math.sin(this._time * 0.7 + phase[i])     * 0.005;
        pos[i*3+1] += Math.sin(this._time * 1.2 + phase[i]*1.3) * 0.003;
        pos[i*3+2] += Math.cos(this._time * 0.5 + phase[i])     * 0.004;
        // Keep fireflies near dock area
        if (pos[i*3+1] > 4) pos[i*3+1] = 0.5;
        if (pos[i*3+1] < 0.3) pos[i*3+1] = 0.3;
      }
      this._fireflies.geo.attributes.position.needsUpdate = true;
      // Twinkle opacity
      this._fireflies.mat.opacity = 0.55 + 0.25 * Math.sin(this._time * 2.5);
    }

    // Water shimmer
    if (this._waterReflection) {
      this._waterReflection.intensity = 0.45 + 0.15 * Math.sin(this._time * 1.8);
    }
    // Reflection wobble
    if (this._reflectionMesh) {
      this._reflectionMesh.material.opacity = 0.12 + 0.06 * Math.sin(this._time * 2.2);
    }
  },

  exit(engine) {
    engine.ui.hideSceneText();
    engine.ui.hideCTA();
  },

  // ── Helpers ──

  _makeDock(scene) {
    const wood = new THREE.MeshLambertMaterial({ color: 0x3a2010 });
    const plank = new THREE.MeshLambertMaterial({ color: 0x2e180a });

    // Main platform
    scene.add(Object.assign(
      new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.1, 8), wood.clone()),
      { position: new THREE.Vector3(0, -0.4, 2) }
    ));

    // Planks (visual detail)
    for (let i = 0; i < 8; i++) {
      scene.add(Object.assign(
        new THREE.Mesh(new THREE.BoxGeometry(3.45, 0.02, 0.18), plank.clone()),
        { position: new THREE.Vector3(0, -0.34, i * 0.85 - 1.5) }
      ));
    }

    // Dock legs
    [[-1.5, 0], [-1.5, 4], [1.5, 0], [1.5, 4]].forEach(([x, z]) => {
      scene.add(Object.assign(
        new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.5, 8), wood.clone()),
        { position: new THREE.Vector3(x, -1.15, z) }
      ));
    });

    // Railing posts
    for (let i = 0; i < 5; i++) {
      [[-1.85], [1.85]].forEach(([rx]) => {
        scene.add(Object.assign(
          new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.85, 6), wood.clone()),
          { position: new THREE.Vector3(rx, -0.0, i * 1.8 - 1.5) }
        ));
      });
    }
    // Top rails
    [[-1.85], [1.85]].forEach(([rx]) => {
      scene.add(Object.assign(
        new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 8), wood.clone()),
        { position: new THREE.Vector3(rx, 0.44, 2) }
      ));
    });
  },

  _makeFireflies(scene) {
    const count = 60;
    const geo   = new THREE.BufferGeometry();
    const pos   = new Float32Array(count * 3);
    const phase = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i*3]   = (Math.random()-0.5) * 14;
      pos[i*3+1] = 0.5 + Math.random() * 3;
      pos[i*3+2] = -5 + Math.random() * 12;
      phase[i]   = Math.random() * Math.PI * 2;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.userData.phase = phase;
    const mat = new THREE.PointsMaterial({
      color: 0xaaff44, size: 0.15, transparent: true, opacity: 0.65,
      sizeAttenuation: true,
    });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);
    return { geo, mat, phase };
  },

  _makeTree() {
    const g = new THREE.Group();
    g.add(Object.assign(
      new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.3, 4, 7),
        new THREE.MeshLambertMaterial({ color: 0x120808 })
      ),
      { position: new THREE.Vector3(0, 2, 0) }
    ));
    [[2.5, 5, 6], [1.8, 3.5, 9], [1.2, 2.5, 11]].forEach(([r, h, y]) => {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(r, h, 8),
        new THREE.MeshLambertMaterial({ color: 0x0a1408 })
      );
      cone.position.y = y;
      g.add(cone);
    });
    return g;
  },

  _makeStars(count) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i*3]   = (Math.random()-0.5)*500;
      pos[i*3+1] = 20 + Math.random()*120;
      pos[i*3+2] = (Math.random()-0.5)*500;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
    return new THREE.Points(geo, new THREE.PointsMaterial({
      color:0xffffff, size:0.25, transparent:true, opacity:0.85
    }));
  },
};
