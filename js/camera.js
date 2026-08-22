/**
 * CINEMATIC CAMERA CONTROLLER
 * 
 * Manages smooth cinematic transitions, focus targets, FOV alterations,
 * interactive 3D memory zooms, and mouse/gyro parallax for depth.
 */

class CinematicCamera {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement || window;
    
    // Base transform
    this.savedPosition = camera.position.clone();
    this.savedTarget = new THREE.Vector3(0, 0, 0);
    this.currentTarget = new THREE.Vector3(0, 0, 0);
    this.targetVector = new THREE.Vector3(0, 0, 0);
    
    // Parallax tracking
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.parallaxIntensity = 0.75;
    this.isTransitioning = false;
    this.isFocusedOnObject = false;

    this.initEvents();
  }

  initEvents() {
    window.addEventListener('mousemove', (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      this.mouse.targetX = nx;
      this.mouse.targetY = ny;
    });

    // Mobile orientation if available
    window.addEventListener('deviceorientation', (e) => {
      if (e.gamma !== null && e.beta !== null) {
        this.mouse.targetX = THREE.MathUtils.clamp(e.gamma / 30, -1, 1);
        this.mouse.targetY = THREE.MathUtils.clamp((e.beta - 45) / 30, -1, 1);
      }
    });
  }

  /**
   * Smoothly animates camera to new position and lookAt target using GSAP
   */
  moveTo(pos, target, duration = 3.2, ease = 'power2.inOut', onComplete = null) {
    this.isTransitioning = true;
    this.savedPosition.copy(pos);
    this.savedTarget.copy(target);

    // Kill existing tweens on camera
    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.targetVector);

    const tl = gsap.timeline({
      onComplete: () => {
        this.isTransitioning = false;
        if (onComplete) onComplete();
      }
    });

    tl.to(this.camera.position, {
      x: pos.x,
      y: pos.y,
      z: pos.z,
      duration: duration,
      ease: ease
    }, 0);

    tl.to(this.targetVector, {
      x: target.x,
      y: target.y,
      z: target.z,
      duration: duration,
      ease: ease,
      onUpdate: () => {
        this.currentTarget.copy(this.targetVector);
      }
    }, 0);

    return tl;
  }

  /**
   * Focus camera smoothly on a specific 3D memory item
   */
  focusOn(worldPos, offset = { x: 0, y: 0, z: 3.5 }, duration = 2.0, onComplete = null) {
    this.isFocusedOnObject = true;
    const targetPos = new THREE.Vector3(
      worldPos.x + offset.x,
      worldPos.y + offset.y,
      worldPos.z + offset.z
    );
    return this.moveTo(targetPos, worldPos, duration, 'power2.out', onComplete);
  }

  /**
   * Return camera to saved scene viewpoint
   */
  restoreSaved(duration = 2.0, onComplete = null) {
    this.isFocusedOnObject = false;
    return this.moveTo(this.savedPosition, this.savedTarget, duration, 'power2.inOut', onComplete);
  }

  /**
   * Continuous update in render loop
   */
  update(delta) {
    // Parallax damping
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Apply subtle parallax offset to target and camera
    const intensity = this.isFocusedOnObject ? this.parallaxIntensity * 0.3 : this.parallaxIntensity;
    const pxOffset = this.mouse.x * intensity;
    const pyOffset = this.mouse.y * (intensity * 0.6);

    const activeLookTarget = new THREE.Vector3(
      this.currentTarget.x + pxOffset * 0.3,
      this.currentTarget.y + pyOffset * 0.3,
      this.currentTarget.z
    );

    this.camera.lookAt(activeLookTarget);
  }

  setFov(fov, duration = 2.0) {
    gsap.to(this.camera, {
      fov: fov,
      duration: duration,
      ease: 'power2.inOut',
      onUpdate: () => this.camera.updateProjectionMatrix()
    });
  }
}

window.CinematicCamera = CinematicCamera;
