/**
 * rome.js — Rome / Vatican inspired evening courtyard.
 * Stone arches, fountain, warm amber lanterns, deep blue evening sky.
 */
import * as THREE from 'three';
import { CONTENT } from '../config.js';

export const RomeScene = {
  name: 'rome',
  threeScene: null,
  _candles: [],
  _time: 0,
  _initialized: false,

  init(engine) {
    const scene = new THREE.Scene();
    this.threeScene = scene;
    scene.fog = new THREE.FogExp2(0x0c1532, 0.016);
    scene.background = new THREE.Color(0x080f28);

    // ── Lights ──
    scene.add(new THREE.AmbientLight(0x1a2040, 0.5));

    const moonDir = new THREE.DirectionalLight(0x6080c0, 0.6);
    moonDir.position.set(-15, 30, -10);
    scene.add(moonDir);

    // ── Stars ──
    scene.add(this._makeStars(500));

    // ── Ground (stone courtyard) ──
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshLambertMaterial({ color: 0x2a2218 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    scene.add(ground);

    // Stone tile grid lines (visual detail)
    for (let x = -30; x <= 30; x += 4) {
      const line = new THREE.Mesh(
        new THREE.PlaneGeometry(0.05, 60),
        new THREE.MeshBasicMaterial({ color: 0x1a1510 })
      );
      line.rotation.x = -Math.PI / 2;
      line.position.set(x, -0.48, 0);
      scene.add(line);
    }
    for (let z = -30; z <= 30; z += 4) {
      const line = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 0.05),
        new THREE.MeshBasicMaterial({ color: 0x1a1510 })
      );
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, -0.48, z);
      scene.add(line);
    }

    // ── Main arch (center back) ──
    this._buildArch(scene, 0, 0, -14, 6, 10);

    // ── Side arches ──
    this._buildArch(scene, -10, 0, -12, 4, 7);
    this._buildArch(scene, 10, 0, -12, 4, 7);

    // ── Colonnade pillars ──
    [[-15, -8], [-15, -14], [-15, -20], [15, -8], [15, -14], [15, -20]].forEach(([x, z]) => {
      scene.add(this._makePillar(x, z));
    });

    // ── Fountain (center foreground) ──
    this._makeFountain(scene, 0, 0, 4);

    // ── Lanterns ──
    const lampPositions = [
      [-5, 2, -4], [5, 2, -4],
      [-12, 2, -10], [12, 2, -10],
      [-12, 2, -18], [12, 2, -18],
    ];
    lampPositions.forEach(([x, y, z]) => {
      const lamp = this._makeLantern(new THREE.Vector3(x, y, z));
      scene.add(lamp);
      this._candles.push(lamp.userData.light);
    });

    // ── Path (illuminated center path) ──
    const path = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 25),
      new THREE.MeshLambertMaterial({ color: 0x2e2518 })
    );
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, -0.49, -5);
    scene.add(path);
  },

  enter(engine) {
    engine.camera.position.set(0, 3, 12);
    engine.camera.rotation.set(-0.1, 0, 0);

    // Cinematic slow push
    gsap.to(engine.camera.position, {
      z: 7, y: 2.5, duration: 3, ease: 'power2.inOut',
    });

    // Show message after 2s
    setTimeout(() => {
      engine.ui.showSceneText([CONTENT.rome.message]);
    }, 2000);

    // Show CTA after 4s
    setTimeout(() => {
      engine.ui.showCTA('CONTINUE', () => {
        engine.ui.hideSceneText();
        engine.ui.hideCTA();
        gsap.to(engine.camera.position, {
          z: 2, duration: 2, ease: 'power2.in',
          onComplete: () => engine.advance()
        });
      });
    }, 4000);
  },

  update(delta) {
    this._time += delta;
    this._candles.forEach((light, i) => {
      light.intensity = 0.8 + 0.25 * Math.sin(this._time * 2.2 + i * 1.3);
    });
  },

  exit(engine) {
    engine.ui.hideSceneText();
    engine.ui.hideCTA();
  },

  // ── Helpers ──

  _buildArch(scene, x, baseY, z, w, h) {
    const mat = new THREE.MeshLambertMaterial({ color: 0x3a3020 });

    // Left pillar
    scene.add(Object.assign(
      new THREE.Mesh(new THREE.BoxGeometry(w * 0.18, h * 0.85, w * 0.18), mat.clone()),
      { position: new THREE.Vector3(x - w/2, baseY + h * 0.42, z) }
    ));
    // Right pillar
    scene.add(Object.assign(
      new THREE.Mesh(new THREE.BoxGeometry(w * 0.18, h * 0.85, w * 0.18), mat.clone()),
      { position: new THREE.Vector3(x + w/2, baseY + h * 0.42, z) }
    ));
    // Arch keystone top box
    scene.add(Object.assign(
      new THREE.Mesh(new THREE.BoxGeometry(w * 1.36, h * 0.14, w * 0.18), mat.clone()),
      { position: new THREE.Vector3(x, baseY + h * 0.9, z) }
    ));
    // Torus arch
    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(w * 0.45, w * 0.09, 8, 20, Math.PI),
      mat.clone()
    );
    torus.rotation.x = Math.PI / 2;
    torus.rotation.z = Math.PI;
    torus.position.set(x, baseY + h * 0.85, z);
    scene.add(torus);
  },

  _makePillar(x, z) {
    const g = new THREE.Group();
    // Shaft
    g.add(Object.assign(
      new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.4, 8, 10),
        new THREE.MeshLambertMaterial({ color: 0x3a3025 })
      ),
      { position: new THREE.Vector3(0, 4, 0) }
    ));
    // Capital
    g.add(Object.assign(
      new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 0.35, 1.0),
        new THREE.MeshLambertMaterial({ color: 0x454030 })
      ),
      { position: new THREE.Vector3(0, 8.2, 0) }
    ));
    g.position.set(x, -0.5, z);
    return g;
  },

  _makeFountain(scene, x, y, z) {
    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x3a3020 });

    // Basin
    scene.add(Object.assign(
      new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2, 0.4, 20), stoneMat.clone()),
      { position: new THREE.Vector3(x, y - 0.1, z) }
    ));
    // Centre column
    scene.add(Object.assign(
      new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 1.8, 10), stoneMat.clone()),
      { position: new THREE.Vector3(x, y + 0.9, z) }
    ));
    // Top bowl
    scene.add(Object.assign(
      new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.7, 0.25, 16), stoneMat.clone()),
      { position: new THREE.Vector3(x, y + 1.9, z) }
    ));
    // Water surface
    scene.add(Object.assign(
      new THREE.Mesh(
        new THREE.CircleGeometry(2.1, 24),
        new THREE.MeshLambertMaterial({ color: 0x1a3050, transparent: true, opacity: 0.75 })
      ),
      { rotation: new THREE.Euler(-Math.PI / 2, 0, 0), position: new THREE.Vector3(x, y + 0.22, z) }
    ));
    // Fountain light
    const waterLight = new THREE.PointLight(0x2060c0, 0.8, 6);
    waterLight.position.set(x, y + 0.5, z);
    scene.add(waterLight);
  },

  _makeLantern(pos) {
    const g = new THREE.Group();
    g.userData.pos = pos;

    // Post
    g.add(Object.assign(
      new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.07, 2.2, 8),
        new THREE.MeshLambertMaterial({ color: 0x2a2010 })
      ),
      { position: new THREE.Vector3(0, -0.9, 0) }
    ));
    // Lamp body
    g.add(Object.assign(
      new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.22, 0.45, 8),
        new THREE.MeshLambertMaterial({ color: 0x1a1808, transparent: true, opacity: 0.8 })
      ),
      { position: new THREE.Vector3(0, 0, 0) }
    ));
    // Glow
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffcc66 })
    );
    g.add(glow);

    // Light
    const light = new THREE.PointLight(0xff9933, 0.9, 9);
    g.add(light);
    g.userData.light = light;

    g.position.copy(pos);
    return g;
  },

  _makeStars(count) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i*3]   = (Math.random()-0.5)*400;
      pos[i*3+1] = 20 + Math.random()*80;
      pos[i*3+2] = (Math.random()-0.5)*400;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
    return new THREE.Points(geo, new THREE.PointsMaterial({
      color:0xffffff, size:0.2, transparent:true, opacity:0.7
    }));
  },
};
