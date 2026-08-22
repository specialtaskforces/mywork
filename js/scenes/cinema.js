/**
 * cinema.js — Private cinema room experience.
 * Dark theatre, vintage projector beam, large screen with video placeholder.
 */
import * as THREE from 'three';

export const CinemaScene = {
  name: 'cinema',
  threeScene: null,
  _projectorLight: null,
  _time: 0,
  _initialized: false,

  init(engine) {
    const scene = new THREE.Scene();
    this.threeScene = scene;
    scene.fog = new THREE.Fog(0x030303, 1, 30);
    scene.background = new THREE.Color(0x030303);

    // ── Lights ──
    scene.add(new THREE.AmbientLight(0x0a0806, 0.3));

    // Projector spotlight
    const projector = new THREE.SpotLight(0xfff8e0, 1.5, 25, Math.PI * 0.15, 0.4, 1.5);
    projector.position.set(0, 7, 10);
    projector.target.position.set(0, 2, -8);
    scene.add(projector);
    scene.add(projector.target);
    this._projectorLight = projector;

    // Screen glow (ambient from screen)
    const screenGlow = new THREE.PointLight(0x2030a0, 0.6, 16);
    screenGlow.position.set(0, 2.5, -8);
    scene.add(screenGlow);
    this._screenGlow = screenGlow;

    // ── Floor ──
    scene.add(Object.assign(
      new THREE.Mesh(
        new THREE.PlaneGeometry(20, 25),
        new THREE.MeshLambertMaterial({ color: 0x0a0806 })
      ),
      { rotation: new THREE.Euler(-Math.PI/2,0,0), position: new THREE.Vector3(0,-2,0) }
    ));

    // ── Screen ──
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 5.6),
      new THREE.MeshBasicMaterial({ color: 0x1a2050, transparent: true, opacity: 0.9 })
    );
    screen.position.set(0, 2.5, -9);
    scene.add(screen);

    // Screen border
    const border = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(10.2, 5.8, 0.05)),
      new THREE.LineBasicMaterial({ color: 0x2a2010 })
    );
    border.position.copy(screen.position);
    scene.add(border);

    // ── Walls ──
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x080806 });
    scene.add(Object.assign(
      new THREE.Mesh(new THREE.PlaneGeometry(20, 14), wallMat.clone()),
      { position: new THREE.Vector3(0, 5, -10) }
    ));
    [-9, 9].forEach(x => {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(25, 14), wallMat.clone());
      w.rotation.y = x > 0 ? -Math.PI/2 : Math.PI/2;
      w.position.set(x, 5, 0);
      scene.add(w);
    });

    // ── Seating (2 rows of seat backs) ──
    for (let row = 0; row < 2; row++) {
      const zPos = 6 - row * 3;
      const count = 6;
      for (let c = 0; c < count; c++) {
        const sx = (c - count/2 + 0.5) * 2.2;
        const seatMat = new THREE.MeshLambertMaterial({ color: 0x1a0a06 });
        // Seat back
        scene.add(Object.assign(
          new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 0.14), seatMat.clone()),
          { position: new THREE.Vector3(sx, -0.5, zPos) }
        ));
        // Seat
        scene.add(Object.assign(
          new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 0.9), seatMat.clone()),
          { position: new THREE.Vector3(sx, -1.05, zPos + 0.35) }
        ));
      }
    }

    // ── Projector machine ──
    scene.add(Object.assign(
      new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.55, 0.7),
        new THREE.MeshLambertMaterial({ color: 0x1a1a18 })
      ),
      { position: new THREE.Vector3(0, 7, 9.5) }
    ));
    // Lens
    scene.add(Object.assign(
      new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.1, 0.4, 12),
        new THREE.MeshLambertMaterial({ color: 0x303030 })
      ),
      Object.assign(
        { rotation: new THREE.Euler(Math.PI/2, 0, 0) },
        { position: new THREE.Vector3(0, 7, 9.1) }
      )
    ));
  },

  enter(engine) {
    engine.camera.position.set(0, 2, 12);
    engine.camera.rotation.set(-0.1, 0, 0);

    gsap.to(engine.camera.position, { z: 6, y: 1.5, duration: 2.5, ease: 'power2.inOut',
      onComplete: () => {
        // Show the Cinema screen UI overlay
        const cinemaDiv = document.getElementById('cinema-scene');
        cinemaDiv.classList.remove('ui-hidden');
        cinemaDiv.style.visibility = 'visible';
        gsap.fromTo(cinemaDiv, { opacity: 0 }, { opacity: 1, duration: 1 });

        document.getElementById('cinema-continue').onclick = () => {
          gsap.to(cinemaDiv, {
            opacity: 0, duration: 0.8,
            onComplete: () => {
              cinemaDiv.classList.add('ui-hidden');
              engine.advance();
            }
          });
        };
      }
    });
  },

  update(delta) {
    this._time += delta;
    // Subtle projector flicker
    if (this._projectorLight) {
      this._projectorLight.intensity = 1.4 + 0.15 * Math.sin(this._time * 12 + Math.random()*0.5);
    }
    if (this._screenGlow) {
      this._screenGlow.intensity = 0.55 + 0.08 * Math.sin(this._time * 3);
    }
  },

  exit() {
    const cinemaDiv = document.getElementById('cinema-scene');
    cinemaDiv.classList.add('ui-hidden');
    cinemaDiv.style.visibility = 'hidden';
  },
};
