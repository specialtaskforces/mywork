/**
 * engine.js — Three.js renderer, shared camera, scene management.
 * Scenes register themselves here; the engine swaps them in/out cleanly.
 */
import * as THREE from 'three';

export class Engine {
  constructor() {
    this.renderer   = null;
    this.camera     = null;
    this.clock      = new THREE.Clock();
    this.scenes     = {};          // registered scene objects
    this.activeScene = null;       // currently rendering scene
    this._raf       = null;
    this._mouseX    = 0;
    this._mouseY    = 0;
    this._targetRotX = 0;
    this._targetRotY = 0;
    this._baseRotX  = 0;
    this._baseRotY  = 0;
    this.ui         = null;        // set by main.js after UI init
    this.onAdvance  = null;        // set by main.js
  }

  /** Initialize renderer and camera, mount to DOM */
  init() {
    const container = document.getElementById('canvas-container');

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    container.appendChild(this.renderer.domElement);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    this.camera.position.set(0, 2, 15);

    // Mouse parallax
    window.addEventListener('mousemove', this._onMouseMove.bind(this), { passive: true });

    // Resize
    window.addEventListener('resize', this._onResize.bind(this), { passive: true });

    // Pause when tab hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.clock.stop();
      else this.clock.start();
    });
  }

  /** Register a scene module */
  register(scene) {
    this.scenes[scene.name] = scene;
  }

  /** Switch to a scene by name (calls init if first time) */
  async switchTo(name) {
    const next = this.scenes[name];
    if (!next) { console.warn(`Scene "${name}" not registered`); return; }

    // Exit current
    if (this.activeScene && this.activeScene.exit) {
      this.activeScene.exit(this);
    }

    // Init next if not yet initialized
    if (!next._initialized) {
      await next.init(this);
      next._initialized = true;
    }

    this.activeScene = next;

    // Enter
    if (next.enter) await next.enter(this);
  }

  /** Called by each scene when the visitor advances the story */
  advance() {
    if (this.onAdvance) this.onAdvance();
  }

  /** Main render loop */
  start() {
    const loop = () => {
      this._raf = requestAnimationFrame(loop);
      if (document.hidden) return;

      const delta = Math.min(this.clock.getDelta(), 0.05);

      // Smooth camera parallax
      this._baseRotY += (this._targetRotY - this._baseRotY) * 0.04;
      this._baseRotX += (this._targetRotX - this._baseRotX) * 0.04;

      // Render active scene
      if (this.activeScene && this.activeScene.threeScene) {
        // Per-frame update
        if (this.activeScene.update) {
          this.activeScene.update(delta, this);
        }

        // Apply subtle parallax to camera rotation
        this.camera.rotation.y = this._baseRotY;
        this.camera.rotation.x = this._baseRotX;

        this.renderer.render(this.activeScene.threeScene, this.camera);
      }
    };
    loop();
  }

  // ---- Private helpers ----

  _onMouseMove(e) {
    this._mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    this._mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    this._targetRotY = this._mouseX * 0.04;
    this._targetRotX = -this._mouseY * 0.025;
  }

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  /** Helper: dispose all objects in a Three.js scene */
  static disposeScene(threeScene) {
    if (!threeScene) return;
    threeScene.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach(m => {
          Object.values(m).forEach(v => { if (v && v.isTexture) v.dispose(); });
          m.dispose();
        });
      }
    });
  }

  /** Helper: create a canvas texture from a draw function */
  static canvasTex(w, h, drawFn) {
    const canvas = document.createElement('canvas');
    canvas.width  = w;
    canvas.height = h;
    drawFn(canvas.getContext('2d'), w, h);
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  /** Helper: create a star field Points object */
  static makeStars(count = 600, spread = 300, minY = 10, maxY = 120) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = minY + Math.random() * (maxY - minY);
      pos[i * 3 + 2] = (Math.random() - 0.5) * spread;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.25,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
    });
    return new THREE.Points(geo, mat);
  }

  /** Helper: create a warm point light + small sphere bulb */
  static makeLamp(color, intensity, distance, position) {
    const group = new THREE.Group();
    const light = new THREE.PointLight(color, intensity, distance);
    group.add(light);
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 8, 8),
      new THREE.MeshBasicMaterial({ color })
    );
    group.add(bulb);
    group.position.copy(position);
    return group;
  }

  /** Helper: create a tree group (trunk cylinder + cone canopy) */
  static makeTree(trunkColor, canopyColor, scale = 1) {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18 * scale, 0.28 * scale, 3.5 * scale, 7),
      new THREE.MeshLambertMaterial({ color: trunkColor })
    );
    trunk.position.y = 1.75 * scale;
    g.add(trunk);

    // Two cone tiers
    [
      { r: 2.2 * scale, h: 4 * scale, y: 5.5 * scale },
      { r: 1.5 * scale, h: 3 * scale, y: 7.5 * scale },
    ].forEach(t => {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(t.r, t.h, 8),
        new THREE.MeshLambertMaterial({ color: canopyColor })
      );
      cone.position.y = t.y;
      g.add(cone);
    });
    return g;
  }
}
