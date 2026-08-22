/**
 * transitions.js — Scene-to-scene cinematic transitions.
 * Works with the DOM overlay element and GSAP.
 */

const overlay = document.getElementById('transition-overlay');

/** Show location title card then hide */
async function showLocationCard(name, duration = 2800) {
  const card  = document.getElementById('location-card');
  const label = document.getElementById('location-name-text');
  label.textContent = name;

  return new Promise(resolve => {
    // Reveal card
    card.style.opacity = '0';
    card.style.visibility = 'visible';
    card.classList.remove('ui-hidden');

    gsap.fromTo(card, { opacity: 0, y: 20 }, {
      opacity: 1, y: 0, duration: 0.9, ease: 'power2.out',
      onComplete() {
        setTimeout(() => {
          gsap.to(card, {
            opacity: 0, y: -10, duration: 0.7, ease: 'power2.in',
            onComplete() {
              card.classList.add('ui-hidden');
              card.style.visibility = 'hidden';
              resolve();
            }
          });
        }, duration);
      }
    });
  });
}

/** Crossfade with warm amber overlay */
export async function fadeTransition(onMidpoint) {
  overlay.style.background = '#0a0808';
  return new Promise(resolve => {
    gsap.fromTo(overlay, { opacity: 0 }, {
      opacity: 1, duration: 0.9, ease: 'power2.inOut',
      onComplete: async () => {
        if (onMidpoint) await onMidpoint();
        gsap.to(overlay, {
          opacity: 0, duration: 1.1, ease: 'power2.out',
          onComplete: resolve,
          delay: 0.1,
        });
      }
    });
  });
}

/** Push-forward transition (warm amber) */
export async function pushTransition(onMidpoint) {
  overlay.style.background = 'radial-gradient(ellipse at center, #1a0f06 0%, #050505 100%)';
  return new Promise(resolve => {
    gsap.fromTo(overlay, { opacity: 0 }, {
      opacity: 1, duration: 0.7, ease: 'power2.in',
      onComplete: async () => {
        if (onMidpoint) await onMidpoint();
        gsap.to(overlay, {
          opacity: 0, duration: 1.2, ease: 'power2.out',
          onComplete: resolve,
          delay: 0.15,
        });
      }
    });
  });
}

/** Travel transition — dark with location title card */
export async function travelTransition(locationName, onMidpoint) {
  overlay.style.background = '#060810';
  return new Promise(resolve => {
    // Fade to dark
    gsap.fromTo(overlay, { opacity: 0 }, {
      opacity: 1, duration: 0.8, ease: 'power2.in',
      onComplete: async () => {
        if (onMidpoint) await onMidpoint();
        // Show location card while overlay is opaque
        await showLocationCard(locationName);
        // Fade out overlay
        gsap.to(overlay, {
          opacity: 0, duration: 1.5, ease: 'power2.out',
          onComplete: resolve,
        });
      }
    });
  });
}

/** Dissolve — very slow cinematic fade with near-white flash */
export async function dissolveTransition(onMidpoint) {
  overlay.style.background = 'radial-gradient(ellipse at center, #1a1a2e 0%, #040610 100%)';
  return new Promise(resolve => {
    gsap.fromTo(overlay, { opacity: 0 }, {
      opacity: 1, duration: 1.4, ease: 'power1.inOut',
      onComplete: async () => {
        if (onMidpoint) await onMidpoint();
        gsap.to(overlay, {
          opacity: 0, duration: 2, ease: 'power1.out',
          delay: 0.2, onComplete: resolve,
        });
      }
    });
  });
}

/** Dispatch the right transition based on type string */
export async function runTransition(type, locationName, onMidpoint) {
  switch (type) {
    case 'travel':   return travelTransition(locationName, onMidpoint);
    case 'push':     return pushTransition(onMidpoint);
    case 'dissolve': return dissolveTransition(onMidpoint);
    case 'fade':
    default:         return fadeTransition(onMidpoint);
  }
}
