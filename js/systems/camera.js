/**
 * camera.js — Cinematic camera move utilities.
 * All functions return a GSAP tween/timeline so callers can .then() or sequence.
 */

/** Smoothly move camera to a new position + lookAt target */
export function moveTo(camera, pos, lookAt, duration = 2.5, ease = 'power2.inOut') {
  return new Promise(resolve => {
    const tl = gsap.timeline({ onComplete: resolve });
    tl.to(camera.position, { x: pos.x, y: pos.y, z: pos.z, duration, ease }, 0);
    if (lookAt) {
      // Animate lookAt by tweening a proxy object
      const proxy = { x: camera.rotation.x, y: camera.rotation.y, z: camera.rotation.z };
      const dummy = new (camera.constructor)();
      dummy.position.copy(camera.position);
      dummy.lookAt(lookAt.x, lookAt.y, lookAt.z);
      tl.to(camera.rotation, {
        x: dummy.rotation.x,
        y: dummy.rotation.y,
        z: dummy.rotation.z,
        duration,
        ease,
      }, 0);
    }
  });
}

/** Push camera forward (positive z negative) */
export function pushForward(camera, distance = 10, duration = 2.5, ease = 'power2.inOut') {
  return new Promise(resolve => {
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const target = {
      x: camera.position.x + dir.x * distance,
      y: camera.position.y + dir.y * distance,
      z: camera.position.z + dir.z * distance,
    };
    gsap.to(camera.position, {
      x: target.x, y: target.y, z: target.z,
      duration, ease, onComplete: resolve
    });
  });
}

/** Gentle slow orbit: rotate camera around a point */
export function startOrbit(camera, center, radius, speed = 0.003) {
  let angle = Math.atan2(
    camera.position.x - center.x,
    camera.position.z - center.z
  );
  let active = true;

  function tick() {
    if (!active) return;
    angle += speed;
    camera.position.x = center.x + Math.sin(angle) * radius;
    camera.position.z = center.z + Math.cos(angle) * radius;
    camera.lookAt(center.x, center.y, center.z);
    requestAnimationFrame(tick);
  }
  tick();

  return { stop() { active = false; } };
}

/** Gentle bob (up/down breathing motion) */
export function startBob(camera, baseY, amplitude = 0.15, period = 4) {
  const tl = gsap.timeline({ repeat: -1, yoyo: true });
  tl.to(camera.position, {
    y: baseY + amplitude,
    duration: period / 2,
    ease: 'sine.inOut',
  });
  return tl;
}

/** Lift camera upward (for travel transition start) */
export function liftUp(camera, targetY = 40, duration = 1.8, ease = 'power2.in') {
  return new Promise(resolve => {
    gsap.to(camera.position, { y: targetY, duration, ease, onComplete: resolve });
    gsap.to(camera.rotation, { x: -0.3, duration, ease });
  });
}

/** Descend into scene */
export function descend(camera, targetPos, duration = 2, ease = 'power2.out') {
  return new Promise(resolve => {
    gsap.to(camera.position, {
      x: targetPos.x, y: targetPos.y, z: targetPos.z,
      duration, ease, onComplete: resolve
    });
    gsap.to(camera.rotation, { x: 0, duration: duration * 0.8, ease });
  });
}

// THREE must be available as a global or imported. 
// Since this module is loaded in the context where three is an ES module,
// we import it here for the dummy camera trick.
import * as THREE from 'three';
