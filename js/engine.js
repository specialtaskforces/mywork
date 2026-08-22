/**
 * MASTER THREE.JS 3D GRAPHICS & SIMULATION ENGINE
 */

class WebGLEngine {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.cameraController = null;
    this.sceneManager = null;
    this.clock = new THREE.Clock();

    // Lighting references
    this.ambientLight = null;
    this.sunLight = null;

    // Interaction Raycasting
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.init();
  }

  init() {
    // 1. Scene Setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x080e18, 0.02);

    // 2. Camera Setup
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 200);
    this.camera.position.set(0, 1.5, 12);

    // 3. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting Rig
    this.ambientLight = new THREE.AmbientLight(0xffeedd, 0.65);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xfff4e6, 1.2);
    this.sunLight.position.set(10, 20, 10);
    this.scene.add(this.sunLight);

    // 5. Camera Controller & Scene Manager
    this.cameraController = new CinematicCamera(this.camera, this.renderer.domElement);
    this.sceneManager = new SceneManager(this);

    // 6. Events
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('click', (e) => this.onClick(e));

    // 7. Start Render Loop
    this.animate();
  }

  setAtmosphere(config) {
    if (config.fogColor !== undefined) {
      const col = new THREE.Color(config.fogColor);
      gsap.to(this.scene.fog.color, {
        r: col.r,
        g: col.g,
        b: col.b,
        duration: 2.0
      });
    }
    if (config.fogDensity !== undefined) {
      gsap.to(this.scene.fog, {
        density: config.fogDensity,
        duration: 2.0
      });
    }
    if (config.skyColor !== undefined) {
      const col = new THREE.Color(config.skyColor);
      gsap.to(this.renderer, {
        duration: 2.0,
        onUpdate: () => {
          this.renderer.setClearColor(col);
        }
      });
    }
  }

  onClick(event) {
    // Only raycast when clicking outside UI buttons/modals
    if (event.target.closest('.editorial-inner-wrap') || 
        event.target.closest('.letter-modal-overlay') || 
        event.target.closest('.memory-modal-overlay') ||
        event.target.closest('.hud-top-bar')) {
      return;
    }

    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    if (this.sceneManager && this.sceneManager.activeObjects.length > 0) {
      const intersects = this.raycaster.intersectObjects(this.sceneManager.activeObjects, true);
      if (intersects.length > 0) {
        let hitObj = intersects[0].object;
        let mem = hitObj.userData.memory;
        if (!mem && hitObj.parent) {
          mem = hitObj.parent.userData.memory;
        }
        if (mem && window.uiController) {
          window.uiController.openMemoryModal(mem);
        }
      }
    }
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    if (this.cameraController) {
      this.cameraController.update(delta);
    }

    if (this.sceneManager) {
      this.sceneManager.update(delta, time);
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.WebGLEngine = WebGLEngine;
