/**
 * rajasthan.js — Luxurious Rajasthan heritage haveli.
 * Terracotta ground, sandstone walls, arched gateways, amber lanterns, dense stars.
 */
import * as THREE from 'three';
import { CONTENT } from '../config.js';

export const RajasthanScene = {
  name: 'rajasthan',
  threeScene: null,
  _lanternLights: [],
  _time: 0,
  _initialized: false,

  init(engine) {
    const scene = new THREE.Scene();
    this.threeScene = scene;
    scene.fog = new THREE.FogExp2(0x0a0608, 0.018);
    scene.background = new THREE.Color(0x080406);

    // ── Lights ──
    scene.add(new THREE.AmbientLight(0x2a1408, 0.4));

    const moonDir = new THREE.DirectionalLight(0x6050a0, 0.3);
    moonDir.position.set(10, 30, -20);
    scene.add(moonDir);

    // ── Dense star field ──
    scene.add(this._makeStars(700));

    // ── Ground (terracotta courtyard) ──
    scene.add(Object.assign(
      new THREE.Mesh(
        new THREE.PlaneGeometry(80, 80),
        new THREE.MeshLambertMaterial({ color: 0x3a2010 })
      ),
      { rotation: new THREE.Euler(-Math.PI/2,0,0), position: new THREE.Vector3(0,-0.5,0) }
    ));

    // Ground tile lines
    for (let x = -30; x <= 30; x += 3) {
      const line = new THREE.Mesh(
        new THREE.PlaneGeometry(0.04, 60),
        new THREE.MeshBasicMaterial({ color: 0x2a1808 })
      );
      line.rotation.x = -Math.PI/2;
      line.position.set(x, -0.48, 0);
      scene.add(line);
    }

    // ── Haveli walls (three sides) ──
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x5a3820 });

    // Back wall
    const backW = new THREE.Mesh(new THREE.BoxGeometry(30, 12, 1.2), wallMat.clone());
    backW.position.set(0, 5.5, -16);
    scene.add(backW);

    // Left wall
    const leftW = new THREE.Mesh(new THREE.BoxGeometry(1.2, 12, 24), wallMat.clone());
    leftW.position.set(-14.5, 5.5, -4);
    scene.add(leftW);

    // Right wall
    const rightW = new THREE.Mesh(new THREE.BoxGeometry(1.2, 12, 24), wallMat.clone());
    rightW.position.set(14.5, 5.5, -4);
    scene.add(rightW);

    // ── Main arch gateway (centre back) ──
    this._makeHaveliArch(scene, 0, -0.5, -15.5, 6, 9);

    // ── Side arched niches ──
    this._makeHaveliArch(scene, -9, -0.5, -15.6, 3.5, 6);
    this._makeHaveliArch(scene, 9, -0.5, -15.6, 3.5, 6);

    // ── Jharokha balcony (upper window) ──
    this._makeJharokha(scene, 0, 8, -15);

    // ── Lanterns ──
    [
      [-5, 2.5, -5], [5, 2.5, -5],
      [-10, 2.5, -10], [10, 2.5, -10],
      [0, 3.5, -14],
    ].forEach(([x, y, z]) => {
      const l = this._makeLantern(scene, x, y, z);
      this._lanternLights.push(l);
    });

    // ── Decorative urns ──
    [[-5, 0, 2], [5, 0, 2]].forEach(([x, y, z]) => {
      scene.add(this._makeUrn(x, y, z));
    });

    // ── Low seating platform ──
    scene.add(Object.assign(
      new THREE.Mesh(
        new THREE.BoxGeometry(8, 0.3, 4),
        new THREE.MeshLambertMaterial({ color: 0x4a2c18 })
      ),
      { position: new THREE.Vector3(0, -0.35, 2) }
    ));

    // Cushions
    [[−1.5, 0, 1.5], [1.5, 0, 2.5]].forEach(([x, y, z]) => {
      scene.add(Object.assign(
        new THREE.Mesh(
          new THREE.BoxGeometry(1.0, 0.18, 0.8),
          new THREE.MeshLambertMaterial({ color: 0x7a1f2e })
        ),
        { position: new THREE.Vector3(x, y + 0.08, z) }
      ));
    });
  },

  enter(engine) {
    engine.camera.position.set(0, 3, 12);
    engine.camera.rotation.set(-0.06, 0, 0);

    gsap.to(engine.camera.position, { z: 6, y: 2.5, duration: 3, ease: 'power2.inOut' });

    setTimeout(() => engine.ui.showSceneText([CONTENT.rajasthan.message]), 2500);

    setTimeout(() => {
      engine.ui.showCTA('CONTINUE', () => {
        engine.ui.hideSceneText();
        engine.ui.hideCTA();
        gsap.to(engine.camera.position, {
          z: 0, duration: 2, ease: 'power2.in',
          onComplete: () => engine.advance()
        });
      });
    }, 4500);
  },

  update(delta) {
    this._time += delta;
    this._lanternLights.forEach((l, i) => {
      l.intensity = 0.9 + 0.3 * Math.sin(this._time * 1.8 + i * 1.4);
    });
  },

  exit(engine) {
    engine.ui.hideSceneText();
    engine.ui.hideCTA();
  },

  // ── Helpers ──

  _makeHaveliArch(scene, x, baseY, z, w, h) {
    const mat = new THREE.MeshLambertMaterial({ color: 0x5a3820 });
    const dark = new THREE.MeshLambertMaterial({ color: 0x3a2210 });

    // Left pillar
    scene.add(Object.assign(
      new THREE.Mesh(new THREE.BoxGeometry(w*0.2, h*0.8, 1.2), mat.clone()),
      { position: new THREE.Vector3(x - w/2, baseY + h*0.4, z) }
    ));
    // Right pillar
    scene.add(Object.assign(
      new THREE.Mesh(new THREE.BoxGeometry(w*0.2, h*0.8, 1.2), mat.clone()),
      { position: new THREE.Vector3(x + w/2, baseY + h*0.4, z) }
    ));
    // Arch (Mughal-style torus — slightly pointed)
    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(w*0.42, w*0.1, 8, 20, Math.PI),
      mat.clone()
    );
    arch.rotation.x = Math.PI/2;
    arch.rotation.z = Math.PI;
    arch.position.set(x, baseY + h*0.8, z);
    scene.add(arch);

    // Top lintel
    scene.add(Object.assign(
      new THREE.Mesh(new THREE.BoxGeometry(w*1.2, h*0.12, 1.2), mat.clone()),
      { position: new THREE.Vector3(x, baseY + h*0.95, z) }
    ));
  },

  _makeJharokha(scene, x, y, z) {
    const mat = new THREE.MeshLambertMaterial({ color: 0x7a4a28 });
    // Base bracket
    scene.add(Object.assign(
      new THREE.Mesh(new THREE.BoxGeometry(4, 0.3, 1.5), mat.clone()),
      { position: new THREE.Vector3(x, y - 0.15, z + 0.75) }
    ));
    // Window box
    scene.add(Object.assign(
      new THREE.Mesh(new THREE.BoxGeometry(3.5, 2, 1), mat.clone()),
      { position: new THREE.Vector3(x, y + 1, z + 0.5) }
    ));
    // Lattice window (light)
    scene.add(Object.assign(
      new THREE.Mesh(
        new THREE.PlaneGeometry(2.8, 1.5),
        new THREE.MeshBasicMaterial({ color: 0xd4a017, transparent: true, opacity: 0.35 })
      ),
      { position: new THREE.Vector3(x, y + 1, z + 1.01) }
    ));
    // Light inside
    const light = new THREE.PointLight(0xffaa22, 0.8, 8);
    light.position.set(x, y + 1, z + 0.5);
    scene.add(light);
  },

  _makeLantern(scene, x, y, z) {
    // Chain
    scene.add(Object.assign(
      new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 1.0, 6),
        new THREE.MeshLambertMaterial({ color: 0x3a2810 })
      ),
      { position: new THREE.Vector3(x, y + 0.7, z) }
    ));
    // Body
    scene.add(Object.assign(
      new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.22, 0.5, 8),
        new THREE.MeshLambertMaterial({ color: 0x8a1f10, transparent: true, opacity: 0.7 })
      ),
      { position: new THREE.Vector3(x, y, z) }
    ));
    // Glow orb
    scene.add(Object.assign(
      new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xff9933 })
      ),
      { position: new THREE.Vector3(x, y, z) }
    ));
    const light = new THREE.PointLight(0xff7722, 1.0, 8);
    light.position.set(x, y, z);
    scene.add(light);
    return light;
  },

  _makeUrn(x, y, z) {
    const g = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color: 0x5a3018 });
    // Body
    g.add(Object.assign(
      new THREE.Mesh(new THREE.SphereGeometry(0.4, 10, 10), mat.clone()),
      { position: new THREE.Vector3(0, 0.4, 0) }
    ));
    // Neck
    g.add(Object.assign(
      new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.32, 0.4, 10), mat.clone()),
      { position: new THREE.Vector3(0, 0.9, 0) }
    ));
    // Base
    g.add(Object.assign(
      new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.15, 10), mat.clone()),
      { position: new THREE.Vector3(0, 0.07, 0) }
    ));
    g.position.set(x, y, z);
    return g;
  },

  _makeStars(count) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i*3]   = (Math.random()-0.5)*400;
      pos[i*3+1] = 15 + Math.random()*100;
      pos[i*3+2] = (Math.random()-0.5)*400;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
    return new THREE.Points(geo, new THREE.PointsMaterial({
      color:0xfff8e0, size:0.22, transparent:true, opacity:0.8
    }));
  },
};
