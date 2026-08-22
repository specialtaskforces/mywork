/**
 * 6-SCENE CINEMATIC SCENE MANAGER
 * 
 * Manages 2.5D photographic backdrops, depth layers, particle systems,
 * 3D memory objects, continuous multi-destination travel transitions,
 * animated 3D padlock, and the proposal celebration.
 */

class SceneManager {
  constructor(engine) {
    this.engine = engine;
    this.scene = engine.scene;
    this.currentSceneGroup = new THREE.Group();
    this.scene.add(this.currentSceneGroup);
    
    this.textureLoader = new THREE.TextureLoader();
    this.loadedTextures = {};
    this.activeObjects = [];
    this.animators = [];
    this.activeBackdrop = null;
  }

  loadTexture(path) {
    if (this.loadedTextures[path]) return this.loadedTextures[path];
    const tex = this.textureLoader.load(path);
    tex.encoding = THREE.sRGBEncoding;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    this.loadedTextures[path] = tex;
    return tex;
  }

  clearCurrentScene() {
    this.animators = [];
    this.activeObjects = [];
    this.activeBackdrop = null;
    while (this.currentSceneGroup.children.length > 0) {
      const obj = this.currentSceneGroup.children[0];
      this.currentSceneGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    }
  }

  createPhotoBackdrop(imagePath, options = {}) {
    const {
      width = 44,
      height = 26,
      z = -15,
      y = 1.0,
      opacity = 1.0,
      color = 0xffffff
    } = options;

    const texture = this.loadTexture(imagePath);
    const geo = new THREE.PlaneGeometry(width, height);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      color: color,
      transparent: opacity < 1.0,
      opacity: opacity,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, y, z);
    this.currentSceneGroup.add(mesh);
    this.activeBackdrop = mesh;
    return mesh;
  }

  createParticleDust(count = 250, spread = 24, color = 0xffeedd, size = 0.14) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * spread;
      pos[i + 1] = (Math.random() - 0.5) * (spread * 0.6);
      pos[i + 2] = -Math.random() * (spread * 0.8);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: color,
      size: size,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const points = new THREE.Points(geo, mat);
    this.currentSceneGroup.add(points);
    return points;
  }

  // ====================================================
  // SCENE 1 — ARRIVAL
  // ====================================================
  buildScene1Arrival() {
    this.clearCurrentScene();
    this.engine.setAtmosphere({ fogColor: 0x080f18, fogDensity: 0.02, skyColor: 0x05070a });

    const bg = this.createPhotoBackdrop('assets/images/locations/opening.jpg', {
      width: 46,
      height: 27,
      z: -16,
      y: 1.2
    });

    const warmSun = new THREE.DirectionalLight(0xffecc2, 1.8);
    warmSun.position.set(6, 10, 4);
    this.currentSceneGroup.add(warmSun);

    const dust = this.createParticleDust(260, 26, 0xfff2d6, 0.16);

    this.animators.push((time) => {
      bg.position.x = Math.sin(time * 0.12) * 0.35;
      bg.position.y = 1.2 + Math.cos(time * 0.1) * 0.15;
      dust.rotation.y = time * 0.02;
    });

    this.engine.cameraController.moveTo(
      new THREE.Vector3(0, 0.2, 8.5),
      new THREE.Vector3(0, 0.2, -16),
      3.2
    );
  }

  // ====================================================
  // SCENE 2 — THE LETTER
  // ====================================================
  buildScene2Letter() {
    this.clearCurrentScene();
    this.engine.setAtmosphere({ fogColor: 0x0c0906, fogDensity: 0.025, skyColor: 0x080503 });

    const bg = this.createPhotoBackdrop('assets/images/locations/letter_desk.jpg', {
      width: 38,
      height: 23,
      z: -11,
      y: 0.5
    });

    // Flickering warm candle light
    const candleLight = new THREE.PointLight(0xffa238, 2.8, 10);
    candleLight.position.set(-1.5, 0.6, -4);
    this.currentSceneGroup.add(candleLight);

    const candleLight2 = new THREE.PointLight(0xff7711, 1.2, 8);
    candleLight2.position.set(1.5, 0.8, -4.5);
    this.currentSceneGroup.add(candleLight2);

    const dust = this.createParticleDust(180, 18, 0xffe2b8, 0.12);

    this.animators.push((time) => {
      candleLight.intensity = 2.6 + Math.sin(time * 14) * 0.35 + Math.sin(time * 28) * 0.15;
      candleLight2.intensity = 1.1 + Math.cos(time * 10) * 0.2;
      bg.position.x = Math.sin(time * 0.08) * 0.2;
    });

    this.engine.cameraController.moveTo(
      new THREE.Vector3(0, 0.3, 6.2),
      new THREE.Vector3(0, 0.3, -11),
      3.0
    );
  }

  // ====================================================
  // SCENE 3 — OUR MEMORIES (3D Interactive Memory Wall)
  // ====================================================
  buildScene3Memories() {
    this.clearCurrentScene();
    this.engine.setAtmosphere({ fogColor: 0x070b14, fogDensity: 0.02, skyColor: 0x04060c });

    const bg = this.createPhotoBackdrop('assets/images/locations/memory_theater.jpg', {
      width: 44,
      height: 26,
      z: -15,
      y: 0.8
    });

    // Elegant Light Beam
    const beamGeo = new THREE.ConeGeometry(5.0, 14, 32, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x90caf9,
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const lightBeam = new THREE.Mesh(beamGeo, beamMat);
    lightBeam.rotation.x = -Math.PI / 2;
    lightBeam.position.set(0, 3.5, -2);
    this.currentSceneGroup.add(lightBeam);

    // 3D Physical Memory Objects Array
    const memoriesConfig = window.PROPOSAL_CONFIG.scenes.scene3.items;
    const memoryObjectsGroup = new THREE.Group();
    memoryObjectsGroup.name = 'memoryObjectsGroup';
    this.currentSceneGroup.add(memoryObjectsGroup);

    const positions = [
      { x: -3.8, y: 1.2, z: -5.5, rotY: 0.25 },  // Her Photo
      { x: 3.8,  y: 1.2, z: -5.5, rotY: -0.25 }, // My Photo
      { x: -1.4, y: -0.6, z: -4.2, rotY: 0.1 },  // Reel 1
      { x: 1.4,  y: -0.6, z: -4.2, rotY: -0.1 }  // Reel 2
    ];

    memoriesConfig.forEach((mem, index) => {
      const pos = positions[index] || { x: 0, y: 0, z: -5, rotY: 0 };
      const frameGroup = new THREE.Group();
      frameGroup.position.set(pos.x, pos.y, pos.z);
      frameGroup.rotation.y = pos.rotY;
      frameGroup.userData = { memory: mem, originalPos: { ...pos }, index: index };

      // Gold / Brass Frame
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.85,
        roughness: 0.2
      });
      const frameMesh = new THREE.Mesh(new THREE.BoxGeometry(2.3, 3.0, 0.08), goldMat);
      frameGroup.add(frameMesh);

      // Inner Photo/Media Texture
      const tex = this.loadTexture(mem.src);
      const photoMat = new THREE.MeshBasicMaterial({ map: tex });
      const photoMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.05, 2.75), photoMat);
      photoMesh.position.z = 0.05;
      photoMesh.userData = { memory: mem, parentGroup: frameGroup };
      frameGroup.add(photoMesh);

      // Subtle indicator badge for reels
      if (mem.type === 'video') {
        const badgeGeo = new THREE.CircleGeometry(0.25, 24);
        const badgeMat = new THREE.MeshBasicMaterial({ color: 0xff3366, transparent: true, opacity: 0.9 });
        const badge = new THREE.Mesh(badgeGeo, badgeMat);
        badge.position.set(0.7, -1.05, 0.06);
        frameGroup.add(badge);
      }

      memoryObjectsGroup.add(frameGroup);
      this.activeObjects.push(photoMesh);
      this.activeObjects.push(frameMesh);
    });

    const dust = this.createParticleDust(280, 24, 0xffffff, 0.14);

    this.animators.push((time) => {
      lightBeam.rotation.z = Math.sin(time * 0.4) * 0.04;
      bg.position.x = Math.sin(time * 0.08) * 0.25;

      // Gentle floating oscillation on memory frames
      memoryObjectsGroup.children.forEach((fg, i) => {
        const base = fg.userData.originalPos;
        fg.position.y = base.y + Math.sin(time * 1.5 + i * 1.2) * 0.06;
      });
    });

    this.engine.cameraController.moveTo(
      new THREE.Vector3(0, 0.4, 7.2),
      new THREE.Vector3(0, 0.4, -6),
      3.2
    );
  }

  /**
   * Focus camera in 3D directly onto a clicked memory item
   */
  focusMemoryItem(memoryData, onComplete = null) {
    const memGroup = this.currentSceneGroup.getObjectByName('memoryObjectsGroup');
    if (!memGroup) {
      if (onComplete) onComplete();
      return;
    }

    let targetMeshGroup = null;
    memGroup.children.forEach(fg => {
      if (fg.userData.memory && fg.userData.memory.id === memoryData.id) {
        targetMeshGroup = fg;
      }
    });

    if (targetMeshGroup) {
      const worldPos = new THREE.Vector3();
      targetMeshGroup.getWorldPosition(worldPos);

      // Dim non-focused objects
      memGroup.children.forEach(fg => {
        if (fg !== targetMeshGroup) {
          gsap.to(fg.scale, { x: 0.85, y: 0.85, z: 0.85, duration: 0.6 });
        }
      });

      this.engine.cameraController.focusOn(worldPos, { x: 0, y: 0, z: 2.8 }, 1.8, onComplete);
    } else {
      if (onComplete) onComplete();
    }
  }

  unfocusMemoryItem(onComplete = null) {
    const memGroup = this.currentSceneGroup.getObjectByName('memoryObjectsGroup');
    if (memGroup) {
      memGroup.children.forEach(fg => {
        gsap.to(fg.scale, { x: 1.0, y: 1.0, z: 1.0, duration: 0.8 });
      });
    }
    this.engine.cameraController.restoreSaved(2.0, onComplete);
  }

  // ====================================================
  // SCENE 4 — LOVE JOURNEY (Continuous Multi-Destination)
  // ====================================================
  buildScene4LoveJourney(destinationIndex = 0) {
    const destinations = window.PROPOSAL_CONFIG.scenes.scene4.destinations;
    const dest = destinations[destinationIndex] || destinations[0];

    // If already in scene 4, perform smooth crossfade transition
    if (this.currentSceneGroup.userData.sceneId === 'scene4' && this.activeBackdrop) {
      this.transitionDestination(dest, destinationIndex);
      return;
    }

    this.clearCurrentScene();
    this.currentSceneGroup.userData.sceneId = 'scene4';
    this.engine.setAtmosphere({ fogColor: 0x090d16, fogDensity: 0.02, skyColor: 0x05070d });

    const bg = this.createPhotoBackdrop(dest.bg, {
      width: 46,
      height: 27,
      z: -15,
      y: 1.0
    });

    // Destination Accent Light
    const accentLight = new THREE.PointLight(0xffbe6b, 2.2, 16);
    accentLight.position.set(0, 1.5, -5);
    accentLight.name = 'destAccentLight';
    this.currentSceneGroup.add(accentLight);

    const dust = this.createParticleDust(300, 26, 0xffd580, 0.15);
    dust.name = 'destDust';

    this.animators.push((time) => {
      bg.position.x = Math.sin(time * 0.08) * 0.35;
      bg.position.y = 1.0 + Math.cos(time * 0.06) * 0.15;
      dust.rotation.y = time * 0.015;
    });

    this.engine.cameraController.moveTo(
      new THREE.Vector3(0, 0.5, 7.5),
      new THREE.Vector3(0, 0.5, -15),
      3.2
    );
  }

  transitionDestination(dest, index) {
    const newTex = this.loadTexture(dest.bg);
    const light = this.currentSceneGroup.getObjectByName('destAccentLight');

    // Pan camera subtly across the horizon
    const targetX = (index % 2 === 0 ? -0.8 : 0.8);
    gsap.to(this.engine.camera.position, {
      x: targetX,
      duration: 1.8,
      ease: 'power2.inOut',
      onComplete: () => {
        gsap.to(this.engine.camera.position, { x: 0, duration: 2.2, ease: 'power2.out' });
      }
    });

    // Fade backdrop texture
    if (this.activeBackdrop) {
      gsap.to(this.activeBackdrop.material, {
        opacity: 0.25,
        duration: 0.6,
        onComplete: () => {
          this.activeBackdrop.material.map = newTex;
          this.activeBackdrop.material.needsUpdate = true;
          gsap.to(this.activeBackdrop.material, { opacity: 1.0, duration: 1.0 });
        }
      });
    }

    // Adjust lighting atmosphere based on destination
    if (light) {
      const colors = [0xffbe6b, 0x5c8aff, 0xff9429, 0xffa726]; // Rome, Amsterdam, Dinner, Rajasthan
      const targetColor = new THREE.Color(colors[index % colors.length]);
      gsap.to(light.color, { r: targetColor.r, g: targetColor.g, b: targetColor.b, duration: 1.5 });
    }
  }

  // ====================================================
  // SCENE 5 — FINAL LOCKED CHAMBER
  // ====================================================
  buildScene5LockedChamber(isUnlocked = false) {
    this.clearCurrentScene();
    this.currentSceneGroup.userData.sceneId = 'scene5';
    this.engine.setAtmosphere({ fogColor: 0x050914, fogDensity: 0.022, skyColor: 0x020409 });

    const bg = this.createPhotoBackdrop('assets/images/locations/starlit_lake.jpg', {
      width: 46,
      height: 27,
      z: -15,
      y: 1.0
    });

    // 3D Golden Padlock Object
    const lockGroup = new THREE.Group();
    lockGroup.name = 'chamberPadlock';

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x2b1e06,
      emissiveIntensity: 0.4
    });

    // Lock body
    const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 0.4), goldMat);
    lockGroup.add(bodyMesh);

    // Keyhole
    const keyholeMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0f });
    const keyhole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16), keyholeMat);
    keyhole.rotation.x = Math.PI / 2;
    keyhole.position.set(0, 0, 0.21);
    lockGroup.add(keyhole);

    // Shackle
    const shackleGeo = new THREE.TorusGeometry(0.42, 0.1, 16, 32, Math.PI);
    const shackle = new THREE.Mesh(shackleGeo, goldMat);
    shackle.position.set(0, 0.5, 0);
    shackle.name = 'padlockShackle';
    lockGroup.add(shackle);

    lockGroup.position.set(0, isUnlocked ? -10 : 0.6, -4.5);
    this.currentSceneGroup.add(lockGroup);

    // Floating Starlit Particles
    const dust = this.createParticleDust(350, 26, 0x80d8ff, 0.16);

    // Soft glowing light
    const glowLight = new THREE.PointLight(0x40c4ff, 2.5, 12);
    glowLight.position.set(0, 0.8, -3.5);
    glowLight.name = 'chamberGlow';
    this.currentSceneGroup.add(glowLight);

    this.animators.push((time) => {
      if (!isUnlocked && lockGroup.position.y > -5) {
        lockGroup.position.y = 0.6 + Math.sin(time * 2.0) * 0.08;
        lockGroup.rotation.y = Math.sin(time * 0.8) * 0.2;
      }
      bg.position.y = 1.0 + Math.sin(time * 0.1) * 0.15;
      dust.rotation.y = time * 0.018;
    });

    this.engine.cameraController.moveTo(
      new THREE.Vector3(0, 0.5, 6.8),
      new THREE.Vector3(0, 0.5, -15),
      3.2
    );
  }

  unlockChamberAnimation(onComplete = null) {
    const lockGroup = this.currentSceneGroup.getObjectByName('chamberPadlock');
    const shackle = this.currentSceneGroup.getObjectByName('padlockShackle');
    const glow = this.currentSceneGroup.getObjectByName('chamberGlow');

    if (shackle) {
      gsap.to(shackle.position, { y: 0.85, duration: 0.8, ease: 'back.out(2)' });
      gsap.to(shackle.rotation, { z: -0.4, duration: 0.8, ease: 'power2.out' });
    }

    if (glow) {
      gsap.to(glow, { intensity: 4.5, duration: 0.8, yoyo: true, repeat: 1 });
    }

    if (lockGroup) {
      gsap.to(lockGroup.position, {
        y: 2.5,
        z: -6,
        duration: 1.5,
        delay: 0.6,
        ease: 'power2.in'
      });
      gsap.to(lockGroup.scale, {
        x: 0.01,
        y: 0.01,
        z: 0.01,
        duration: 1.5,
        delay: 0.6,
        ease: 'power2.in',
        onComplete: () => {
          lockGroup.visible = false;
          if (onComplete) onComplete();
        }
      });
    } else {
      if (onComplete) onComplete();
    }
  }

  // ====================================================
  // SCENE 6 — PROPOSAL & CELEBRATION
  // ====================================================
  buildScene6Proposal() {
    this.clearCurrentScene();
    this.currentSceneGroup.userData.sceneId = 'scene6';
    this.engine.setAtmosphere({ fogColor: 0x080a14, fogDensity: 0.018, skyColor: 0x04050a });

    const bg = this.createPhotoBackdrop('assets/images/locations/proposal_altar.jpg', {
      width: 46,
      height: 27,
      z: -15,
      y: 1.1
    });

    // 3D Solitaire Diamond Engagement Ring
    const ringGroup = new THREE.Group();
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.15
    });
    const bandGeo = new THREE.TorusGeometry(0.5, 0.07, 16, 32);
    const band = new THREE.Mesh(bandGeo, goldMat);
    ringGroup.add(band);

    // Brilliant Octahedron Diamond
    const diamondGeo = new THREE.OctahedronGeometry(0.24);
    const diamondMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.05,
      metalness: 0.95,
      emissive: 0xe0f7fa,
      emissiveIntensity: 0.7
    });
    const diamond = new THREE.Mesh(diamondGeo, diamondMat);
    diamond.position.set(0, 0.58, 0);
    ringGroup.add(diamond);

    ringGroup.position.set(0, 0.65, -4.5);
    ringGroup.name = 'proposalRing';
    this.currentSceneGroup.add(ringGroup);

    // Glowing Altar Spotlight
    const spotLight = new THREE.SpotLight(0xffecd1, 3.6, 16, Math.PI / 6, 0.35);
    spotLight.position.set(0, 4.5, -2);
    spotLight.target = ringGroup;
    this.currentSceneGroup.add(spotLight);

    const dust = this.createParticleDust(380, 26, 0xffe082, 0.18);

    this.animators.push((time) => {
      ringGroup.rotation.y = time * 0.75;
      ringGroup.position.y = 0.65 + Math.sin(time * 2.2) * 0.06;
      bg.position.x = Math.sin(time * 0.08) * 0.2;
      dust.rotation.y = time * 0.02;
    });

    this.engine.cameraController.moveTo(
      new THREE.Vector3(0, 0.55, 6.5),
      new THREE.Vector3(0, 0.55, -15),
      3.2
    );
  }

  // Grand YES Celebration
  triggerYesCelebration() {
    // 1. Golden Confetti & Sparkler Particles
    const sparkCount = 700;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPos = new Float32Array(sparkCount * 3);
    const sparkVelo = [];

    for (let i = 0; i < sparkCount; i++) {
      sparkPos[i * 3] = (Math.random() - 0.5) * 4;
      sparkPos[i * 3 + 1] = 0.6;
      sparkPos[i * 3 + 2] = -4.5 + (Math.random() - 0.5) * 4;

      sparkVelo.push({
        x: (Math.random() - 0.5) * 0.14,
        y: 0.1 + Math.random() * 0.18,
        z: (Math.random() - 0.5) * 0.14
      });
    }

    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: 0xffd700,
      size: 0.24,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    const sparkPoints = new THREE.Points(sparkGeo, sparkMat);
    this.currentSceneGroup.add(sparkPoints);

    // 2. Soft Falling Flower Petals
    const petalCount = 180;
    const petalGeo = new THREE.BufferGeometry();
    const petalPos = new Float32Array(petalCount * 3);
    for (let i = 0; i < petalCount * 3; i += 3) {
      petalPos[i] = (Math.random() - 0.5) * 16;
      petalPos[i + 1] = 4 + Math.random() * 8;
      petalPos[i + 2] = -3 - Math.random() * 8;
    }
    petalGeo.setAttribute('position', new THREE.BufferAttribute(petalPos, 3));
    const petalMat = new THREE.PointsMaterial({
      color: 0xff80ab,
      size: 0.32,
      transparent: true,
      opacity: 0.85,
      blending: THREE.NormalBlending
    });
    const petals = new THREE.Points(petalGeo, petalMat);
    this.currentSceneGroup.add(petals);

    this.animators.push((time) => {
      // Sparks physics
      const sp = sparkPoints.geometry.attributes.position.array;
      for (let i = 0; i < sparkCount; i++) {
        sp[i * 3] += sparkVelo[i].x;
        sp[i * 3 + 1] += sparkVelo[i].y;
        sp[i * 3 + 2] += sparkVelo[i].z;
        sparkVelo[i].y -= 0.002;
      }
      sparkPoints.geometry.attributes.position.needsUpdate = true;

      // Petals falling
      const pp = petals.geometry.attributes.position.array;
      for (let i = 0; i < petalCount * 3; i += 3) {
        pp[i + 1] -= 0.035;
        pp[i] += Math.sin(time * 2 + i) * 0.012;
        if (pp[i + 1] < -3) {
          pp[i + 1] = 8;
          pp[i] = (Math.random() - 0.5) * 16;
        }
      }
      petals.geometry.attributes.position.needsUpdate = true;
    });

    gsap.to(this.engine.camera.position, {
      x: 1.2,
      y: 0.8,
      z: 5.6,
      duration: 6,
      ease: 'power1.inOut'
    });
  }

  update(delta, time) {
    this.animators.forEach(fn => fn(time, delta));
  }
}

window.SceneManager = SceneManager;
