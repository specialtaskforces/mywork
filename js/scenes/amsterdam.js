/**
 * amsterdam.js — Amsterdam night canal scene.
 * Dark navy atmosphere, canal reflections, Dutch buildings, soft rain, warm windows.
 */
import * as THREE from 'three';
import { CONTENT } from '../config.js';

export const AmsterdamScene = {
  name: 'amsterdam',
  threeScene: null,
  _rain: null,
  _time: 0,
  _initialized: false,

  init(engine) {
    const scene = new THREE.Scene();
    this.threeScene = scene;
    scene.fog = new THREE.FogExp2(0x060c18, 0.018);
    scene.background = new THREE.Color(0x060a14);

    // ── Lights ──
    scene.add(new THREE.AmbientLight(0x0d1828, 0.5));

    // Street lamp glow (warm amber)
    const lampLight1 = new THREE.PointLight(0xff9922, 1.2, 20);
    lampLight1.position.set(-4, 4, 2);
    scene.add(lampLight1);
    this._lampLight1 = lampLight1;

    const lampLight2 = new THREE.PointLight(0xff9922, 1.0, 18);
    lampLight2.position.set(6, 4, -3);
    scene.add(lampLight2);

    // Window glow fill
    const windowFill = new THREE.AmbientLight(0x6a4020, 0.2);
    scene.add(windowFill);

    // ── Ground (stone street) ──
    scene.add(Object.assign(
      new THREE.Mesh(
        new THREE.PlaneGeometry(60, 40),
        new THREE.MeshLambertMaterial({ color: 0x0e1220 })
      ),
      { rotation: new THREE.Euler(-Math.PI/2,0,0), position: new THREE.Vector3(0,-0.5,0) }
    ));

    // ── Canal (water) ──
    const canalMat = new THREE.MeshLambertMaterial({
      color: 0x0a1428, transparent: true, opacity: 0.88,
    });
    scene.add(Object.assign(
      new THREE.Mesh(new THREE.PlaneGeometry(60, 12), canalMat),
      { rotation: new THREE.Euler(-Math.PI/2,0,0), position: new THREE.Vector3(0,-0.49,-10) }
    ));

    // Canal light reflection (shimmer)
    const reflection = new THREE.PointLight(0x1040a0, 0.4, 15);
    reflection.position.set(0, 1, -10);
    scene.add(reflection);
    this._reflection = reflection;

    // ── Bridge ──
    this._makeBridge(scene);

    // ── Dutch buildings (left side) ──
    this._buildRow(scene, 'left');
    // ── Dutch buildings (right side) ──
    this._buildRow(scene, 'right');

    // ── Street lamps ──
    [[-4, 4, 2], [6, 4, 0], [-12, 4, -2], [14, 4, -1]].forEach(([x, y, z]) => {
      scene.add(this._makeLampPost(x, y, z));
    });

    // ── Bicycle ──
    scene.add(this._makeBicycle(-2.5, -0.5, 1.5));

    // ── Rain ──
    this._rain = this._makeRain(scene);

    // ── Stars (faint through clouds) ──
    const sGeo = new THREE.BufferGeometry();
    const sPos = new Float32Array(150 * 3);
    for (let i = 0; i < 150; i++) {
      sPos[i*3]   = (Math.random()-0.5)*200;
      sPos[i*3+1] = 25 + Math.random()*50;
      sPos[i*3+2] = (Math.random()-0.5)*200;
    }
    sGeo.setAttribute('position', new THREE.BufferAttribute(sPos,3));
    scene.add(new THREE.Points(sGeo, new THREE.PointsMaterial({
      color:0xffffff, size:0.15, transparent:true, opacity:0.3
    })));
  },

  enter(engine) {
    engine.camera.position.set(0, 2.5, 12);
    engine.camera.rotation.set(-0.05, 0, 0);

    // Slow cinematic drift
    gsap.to(engine.camera.position, { z: 6, duration: 4, ease: 'none' });

    // Show message
    setTimeout(() => engine.ui.showSceneText([CONTENT.amsterdam.message]), 2500);

    // CTA
    setTimeout(() => {
      engine.ui.showCTA('CONTINUE', () => {
        engine.ui.hideSceneText();
        engine.ui.hideCTA();
        gsap.to(engine.camera.position, {
          z: -2, duration: 2, ease: 'power2.in',
          onComplete: () => engine.advance()
        });
      });
    }, 4500);
  },

  update(delta) {
    this._time += delta;

    // Animate rain
    if (this._rain) {
      const pos = this._rain.geometry.attributes.position.array;
      for (let i = 0; i < pos.length/3; i++) {
        pos[i*3+1] -= 0.35;
        pos[i*3]   += 0.02;
        if (pos[i*3+1] < -2) {
          pos[i*3+1] = 30 + Math.random() * 10;
          pos[i*3]   = (Math.random()-0.5) * 40;
        }
      }
      this._rain.geometry.attributes.position.needsUpdate = true;
    }

    // Shimmer canal reflection
    if (this._reflection) {
      this._reflection.intensity = 0.35 + 0.12 * Math.sin(this._time * 2.8);
    }
    if (this._lampLight1) {
      this._lampLight1.intensity = 1.1 + 0.1 * Math.sin(this._time * 1.5);
    }
  },

  exit(engine) {
    engine.ui.hideSceneText();
    engine.ui.hideCTA();
  },

  // ── Helpers ──

  _buildRow(scene, side) {
    const isLeft = side === 'left';
    const xBase  = isLeft ? -18 : 18;
    const xDir   = isLeft ? 1 : -1;
    const colors = [0x1a1610, 0x201c14, 0x181410, 0x1c1812];
    const windowCol = 0xffaa44;

    for (let i = 0; i < 6; i++) {
      const w = 4 + Math.random() * 2;
      const h = 8 + Math.random() * 6;
      const x = xBase + xDir * (i * 5 + w/2);
      const col = colors[i % colors.length];

      // Building body
      const bld = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, 4),
        new THREE.MeshLambertMaterial({ color: col })
      );
      bld.position.set(x, h/2 - 0.5, -6);
      scene.add(bld);

      // Step gable top (Dutch style)
      const gable = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.6, 1.2, 4.1),
        new THREE.MeshLambertMaterial({ color: col })
      );
      gable.position.set(x, h + 0.1, -6);
      scene.add(gable);

      // Windows (warm glow)
      for (let row = 0; row < 3; row++) {
        for (let col2 = 0; col2 < 2; col2++) {
          const wx = x + (col2 - 0.5) * (w * 0.38);
          const wy = 2 + row * 2.5;
          const ww  = new THREE.Mesh(
            new THREE.PlaneGeometry(0.7, 1.0),
            new THREE.MeshBasicMaterial({
              color: Math.random() > 0.3 ? windowCol : 0x080808,
              transparent: true,
              opacity: Math.random() > 0.3 ? 0.85 : 0.2,
            })
          );
          ww.position.set(wx, wy - 0.5, isLeft ? -3.8 : -3.8);
          ww.rotation.y = isLeft ? 0 : Math.PI;
          scene.add(ww);
        }
      }
    }
  },

  _makeBridge(scene) {
    const mat = new THREE.MeshLambertMaterial({ color: 0x2a2018 });

    // Deck
    scene.add(Object.assign(
      new THREE.Mesh(new THREE.BoxGeometry(6, 0.3, 3.5), mat.clone()),
      { position: new THREE.Vector3(0, 0, -8) }
    ));
    // Rails
    [[-2.8, 0], [2.8, 0]].forEach(([rx]) => {
      scene.add(Object.assign(
        new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.9, 3.5), new THREE.MeshLambertMaterial({ color: 0x382818 })),
        { position: new THREE.Vector3(rx, 0.6, -8) }
      ));
    });
    // Arch under bridge
    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(1.8, 0.3, 8, 16, Math.PI),
      mat.clone()
    );
    arch.rotation.z = Math.PI;
    arch.position.set(0, -0.5, -8);
    scene.add(arch);
  },

  _makeLampPost(x, y, z) {
    const g = new THREE.Group();
    // Post
    g.add(Object.assign(
      new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.07, y, 8),
        new THREE.MeshLambertMaterial({ color: 0x1a1808 })
      ),
      { position: new THREE.Vector3(0, y/2 - 0.5, 0) }
    ));
    // Lamp
    g.add(Object.assign(
      new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffcc66 })
      ),
      { position: new THREE.Vector3(0, y - 0.5, 0) }
    ));
    g.position.set(x, 0.5, z);
    return g;
  },

  _makeBicycle(x, y, z) {
    const g = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color: 0x2a2010 });
    // Frame (rough)
    g.add(Object.assign(
      new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.04, 6, 18), mat.clone()),
      { position: new THREE.Vector3(-0.45, 0.4, 0), rotation: new THREE.Euler(Math.PI/2,0,0) }
    ));
    g.add(Object.assign(
      new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.04, 6, 18), mat.clone()),
      { position: new THREE.Vector3(0.45, 0.4, 0), rotation: new THREE.Euler(Math.PI/2,0,0) }
    ));
    g.position.set(x, y, z);
    return g;
  },

  _makeRain(scene) {
    const count = 600;
    const geo   = new THREE.BufferGeometry();
    const pos   = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i*3]   = (Math.random()-0.5) * 40;
      pos[i*3+1] = Math.random() * 30;
      pos[i*3+2] = (Math.random()-0.5) * 25;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const rain = new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0x8090b0, size: 0.08, transparent: true, opacity: 0.35,
    }));
    scene.add(rain);
    return rain;
  },
};
