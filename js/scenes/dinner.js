/**
 * dinner.js — Intimate candlelight dinner.
 * Elegant round table, two chairs, multiple candles, city window view, orbiting camera.
 */
import * as THREE from 'three';
import { CONTENT } from '../config.js';

export const DinnerScene = {
  name: 'dinner',
  threeScene: null,
  _candles: [],
  _orbit: null,
  _time: 0,
  _initialized: false,

  init(engine) {
    const scene = new THREE.Scene();
    this.threeScene = scene;
    scene.fog = new THREE.Fog(0x0c0806, 2, 22);
    scene.background = new THREE.Color(0x090604);

    // ── Lights ──
    scene.add(new THREE.AmbientLight(0x2a1206, 0.35));

    const windowLight = new THREE.PointLight(0x1a3060, 0.6, 15);
    windowLight.position.set(-4, 3, -5);
    scene.add(windowLight);

    // ── Floor (dark wood) ──
    scene.add(Object.assign(
      new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.MeshLambertMaterial({ color: 0x140c06 })
      ),
      { rotation: new THREE.Euler(-Math.PI/2,0,0), position: new THREE.Vector3(0,-1.5,0) }
    ));

    // ── Table ──
    // Tablecloth (round, cream)
    scene.add(Object.assign(
      new THREE.Mesh(
        new THREE.CylinderGeometry(1.35, 1.35, 0.04, 24),
        new THREE.MeshLambertMaterial({ color: 0xf5ede0 })
      ),
      { position: new THREE.Vector3(0, 0.08, 0) }
    ));
    // Table top (dark wood under cloth edges)
    scene.add(Object.assign(
      new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 1.15, 0.1, 24),
        new THREE.MeshLambertMaterial({ color: 0x2a1508 })
      ),
      { position: new THREE.Vector3(0, 0.0, 0) }
    ));
    // Table leg
    scene.add(Object.assign(
      new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.1, 1.5, 10),
        new THREE.MeshLambertMaterial({ color: 0x1e0f04 })
      ),
      { position: new THREE.Vector3(0, -0.75, 0) }
    ));
    // Base
    scene.add(Object.assign(
      new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.55, 0.06, 18),
        new THREE.MeshLambertMaterial({ color: 0x1e0f04 })
      ),
      { position: new THREE.Vector3(0, -1.48, 0) }
    ));

    // ── Chairs ──
    this._makeChair(scene, 0, 0, 2.2, 0);       // near chair
    this._makeChair(scene, 0, 0, -2.2, Math.PI); // far chair

    // ── Candles ──
    [
      [0, 0.14, 0],         // centre
      [-0.5, 0.14, 0.3],
      [0.5, 0.14, -0.3],
    ].forEach(pos => {
      this._candles.push(this._makeCandle(scene, pos));
    });

    // ── Plates ──
    [0, Math.PI].forEach(angle => {
      const px = Math.sin(angle) * 0.85;
      const pz = Math.cos(angle) * 0.85;
      scene.add(Object.assign(
        new THREE.Mesh(
          new THREE.CylinderGeometry(0.28, 0.28, 0.015, 20),
          new THREE.MeshLambertMaterial({ color: 0xf0e8d8 })
        ),
        { position: new THREE.Vector3(px, 0.14, pz) }
      ));
    });

    // ── Flower (small rose centre) ──
    const flowerGeo = new THREE.SphereGeometry(0.1, 8, 8);
    scene.add(Object.assign(
      new THREE.Mesh(flowerGeo, new THREE.MeshLambertMaterial({ color: 0x8a1020 })),
      { position: new THREE.Vector3(0, 0.28, 0) }
    ));

    // ── Walls ──
    const darkWood = new THREE.MeshLambertMaterial({ color: 0x0e0806 });
    [-5.5, 5.5].forEach(x => {
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), darkWood.clone());
      wall.rotation.y = x > 0 ? -Math.PI/2 : Math.PI/2;
      wall.position.set(x, 3.5, 0);
      scene.add(wall);
    });
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(12, 10), darkWood.clone());
    backWall.position.set(0, 3.5, -5.5);
    scene.add(backWall);

    // ── Window ──
    const windowGeo = new THREE.PlaneGeometry(3.5, 2.5);
    const windowMat = new THREE.MeshBasicMaterial({ color: 0x1830a0, transparent: true, opacity: 0.55 });
    const win = new THREE.Mesh(windowGeo, windowMat);
    win.position.set(-3, 2.5, -5.4);
    scene.add(win);

    // City light behind window
    const cityLight = new THREE.Mesh(
      new THREE.PlaneGeometry(3.5, 2.5),
      new THREE.MeshBasicMaterial({ color: 0x102060, transparent: true, opacity: 0.4 })
    );
    cityLight.position.set(-3, 2.5, -5.5);
    scene.add(cityLight);

    // Window frame
    const frameMat = new THREE.MeshLambertMaterial({ color: 0x2a1a0a });
    [[0, 1.3], [0, -1.3], [1.8, 0], [-1.8, 0]].forEach(([ox, oy]) => {
      const isH = Math.abs(oy) > 0;
      const f = new THREE.Mesh(
        new THREE.BoxGeometry(isH ? 0.05 : 3.5, isH ? 2.5 : 0.07, 0.06),
        frameMat.clone()
      );
      f.position.set(-3 + ox, 2.5 + oy, -5.3);
      scene.add(f);
    });
  },

  enter(engine) {
    engine.camera.position.set(0, 3.5, 6);
    engine.camera.lookAt(0, 0.5, 0);

    // Start slow orbit after entry push
    gsap.to(engine.camera.position, {
      y: 2.5, z: 4.5, duration: 2.5, ease: 'power2.out',
      onComplete: () => this._startOrbit(engine),
    });

    // Show message
    setTimeout(() => engine.ui.showSceneText([CONTENT.dinner.message]), 2500);

    setTimeout(() => {
      engine.ui.showCTA('CONTINUE', () => {
        this._orbitActive = false;
        engine.ui.hideSceneText();
        engine.ui.hideCTA();
        engine.advance();
      });
    }, 4500);
  },

  _startOrbit(engine) {
    let angle = 0;
    const radius = 4.5;
    const centerY = 1;
    this._orbitActive = true;

    const tick = () => {
      if (!this._orbitActive) return;
      angle += 0.004;
      engine.camera.position.x = Math.sin(angle) * radius;
      engine.camera.position.z = Math.cos(angle) * radius;
      engine.camera.position.y = 2.5 + Math.sin(angle * 0.5) * 0.3;
      engine.camera.lookAt(0, centerY, 0);
      requestAnimationFrame(tick);
    };
    tick();
  },

  update(delta) {
    this._time += delta;
    this._candles.forEach((c, i) => {
      c.intensity = 1.0 + 0.3 * Math.sin(this._time * 2.5 + i * 2.1);
    });
  },

  exit(engine) {
    this._orbitActive = false;
    engine.ui.hideSceneText();
    engine.ui.hideCTA();
  },

  _makeCandle(scene, [cx, cy, cz]) {
    scene.add(Object.assign(
      new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8),
        new THREE.MeshLambertMaterial({ color: 0xf8f2e0 })
      ),
      { position: new THREE.Vector3(cx, cy + 0.25, cz) }
    ));
    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.025, 0.12, 8),
      new THREE.MeshBasicMaterial({ color: 0xff9900 })
    );
    flame.position.set(cx, cy + 0.56, cz);
    scene.add(flame);
    const light = new THREE.PointLight(0xff8822, 1.0, 5);
    light.position.set(cx, cy + 0.6, cz);
    scene.add(light);
    return light;
  },

  _makeChair(scene, x, y, z, rotY) {
    const g = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color: 0x1a0e06 });

    // Seat
    g.add(Object.assign(
      new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.85), mat.clone()),
      { position: new THREE.Vector3(0, 0, 0) }
    ));
    // Back
    g.add(Object.assign(
      new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 0.07), mat.clone()),
      { position: new THREE.Vector3(0, 0.64, -0.38) }
    ));
    // Legs
    [[-0.38,-0.38], [-0.38,0.38], [0.38,-0.38], [0.38,0.38]].forEach(([lx,lz]) => {
      g.add(Object.assign(
        new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.6, 0.07), mat.clone()),
        { position: new THREE.Vector3(lx, -0.3, lz) }
      ));
    });

    g.position.set(x, y, z);
    g.rotation.y = rotY;
    scene.add(g);
  },
};
