/**
 * 6-SCENE CINEMATIC UI & INTERACTION CONTROLLER
 */

class UIController {
  constructor(engine) {
    this.engine = engine;
    this.config = window.PROPOSAL_CONFIG;
    this.currentScene = 0;
    this.totalScenes = 6;
    this.noClickCount = 0;

    // Scene 2: Letter state
    this.letterCurrentPage = 0;
    this.specialSongPlaying = false;

    // Scene 4: Travel Journey destination index
    this.travelDestIndex = 0;

    // Scene 5: Locked Chamber state
    this.isChamberUnlocked = false;

    // Scene Badges
    this.sceneBadges = [
      'SCENE 01 · ARRIVAL',
      'SCENE 02 · THE LETTER',
      'SCENE 03 · OUR MEMORIES',
      'SCENE 04 · LOVE JOURNEY',
      'SCENE 05 · FINAL CHAMBER',
      'SCENE 06 · THE PROPOSAL'
    ];

    // DOM Elements
    this.storyOverlay = document.getElementById('story-overlay');
    this.chapterBadge = document.getElementById('chapter-badge');
    this.storyTitle = document.getElementById('story-title');
    this.storySubtitle = document.getElementById('story-subtitle');
    this.storyBody = document.getElementById('story-body');
    this.actionButton = document.getElementById('action-button');
    this.progressText = document.getElementById('progress-tracker-text');
    this.progressFill = document.getElementById('progress-line-fill');
    this.audioToggleBtn = document.getElementById('audio-toggle-btn');
    this.modalOverlay = document.getElementById('memory-modal');
    this.letterOverlay = document.getElementById('letter-modal');

    this.init();
  }

  init() {
    this.bindEvents();
    this.loadScene(0);
  }

  bindEvents() {
    // Primary Action Button
    this.actionButton.addEventListener('click', () => {
      window.audioEngine.playChime(1.0);
      this.handleActionClick();
    });

    // Mute/Unmute toggle
    this.audioToggleBtn.addEventListener('click', () => {
      const muted = window.audioEngine.toggleMute();
      this.audioToggleBtn.innerHTML = muted ? '🔇' : '🎵';
      this.audioToggleBtn.classList.toggle('muted', muted);
    });

    // Memory Modal Close
    document.getElementById('modal-close-btn')?.addEventListener('click', () => {
      this.closeMemoryModal();
    });

    // Delegated click handler on story-body for dynamic components
    this.storyBody.addEventListener('click', (e) => {
      // Memory Buttons (Scene 3)
      const memBtn = e.target.closest('.memory-cue-btn');
      if (memBtn) {
        const memId = memBtn.getAttribute('data-memory-id');
        this.openMemoryModalById(memId);
        return;
      }

      // Destination Switcher (Scene 4)
      const destTab = e.target.closest('.travel-dest-tab');
      if (destTab) {
        const idx = parseInt(destTab.getAttribute('data-dest-index'), 10);
        if (!isNaN(idx)) {
          this.switchTravelDestination(idx);
        }
        return;
      }

      // Destination Next Button (Scene 4)
      const nextDestBtn = e.target.closest('.travel-next-btn');
      if (nextDestBtn) {
        const destinations = this.config.scenes.scene4.destinations;
        if (this.travelDestIndex < destinations.length - 1) {
          this.switchTravelDestination(this.travelDestIndex + 1);
        } else {
          this.goToNextScene();
        }
        return;
      }
    });

    // Proposal YES / NO
    document.getElementById('btn-proposal-yes')?.addEventListener('click', () => {
      this.handleProposalYes();
    });

    document.getElementById('btn-proposal-no')?.addEventListener('click', () => {
      this.handleProposalNo();
    });
  }

  updateProgressLine(sceneIndex) {
    if (this.progressText) {
      const badge = this.sceneBadges[sceneIndex] || 'CINEMATIC JOURNEY';
      const num = (sceneIndex + 1).toString().padStart(2, '0');
      this.progressText.textContent = `${badge.split('·')[0].trim()} · ${num} / 06`;
    }
    if (this.progressFill) {
      const pct = ((sceneIndex + 1) / this.totalScenes) * 100;
      this.progressFill.style.width = pct + '%';
    }
  }

  handleActionClick() {
    // Scene 1: Start audio loop and advance
    if (this.currentScene === 0) {
      window.audioEngine.start();
      this.goToNextScene();
      return;
    }

    // Scene 2: Open physical letter modal
    if (this.currentScene === 1) {
      this.openLetterExperience();
      return;
    }

    // Scene 5: Unlock final chamber
    if (this.currentScene === 4 && !this.isChamberUnlocked) {
      this.unlockFinalChamber();
      return;
    }

    this.goToNextScene();
  }

  goToNextScene() {
    if (this.currentScene === 1 && this.specialSongPlaying) {
      window.audioEngine.stopSpecialSong();
      this.specialSongPlaying = false;
    }

    if (this.currentScene < this.totalScenes - 1) {
      this.currentScene++;
      this.loadScene(this.currentScene);
    }
  }

  loadScene(sceneIndex) {
    this.currentScene = sceneIndex;
    this.updateProgressLine(sceneIndex);

    // Smooth UI fade transition
    gsap.to(this.storyOverlay, {
      opacity: 0,
      y: 12,
      duration: 0.35,
      onComplete: () => {
        this.renderSceneContent(sceneIndex);
        gsap.to(this.storyOverlay, {
          opacity: 1,
          y: 0,
          duration: 0.65,
          ease: 'power2.out'
        });
      }
    });

    this.triggerScene3DBuild(sceneIndex);
  }

  triggerScene3DBuild(sceneIndex) {
    const sm = this.engine.sceneManager;
    switch (sceneIndex) {
      case 0:
        sm.buildScene1Arrival();
        break;
      case 1:
        sm.buildScene2Letter();
        break;
      case 2:
        sm.buildScene3Memories();
        break;
      case 3:
        this.travelDestIndex = 0;
        sm.buildScene4LoveJourney(0);
        break;
      case 4:
        this.isChamberUnlocked = false;
        sm.buildScene5LockedChamber(false);
        break;
      case 5:
        sm.buildScene6Proposal();
        break;
    }
  }

  renderSceneContent(sceneIndex) {
    const proposalBox = document.getElementById('proposal-controls');
    if (proposalBox) proposalBox.style.display = 'none';
    this.actionButton.style.display = 'inline-flex';

    switch (sceneIndex) {
      // --------------------------------------------------
      // SCENE 1 — ARRIVAL
      // --------------------------------------------------
      case 0: {
        const s1 = this.config.scenes.scene1;
        this.chapterBadge.textContent = s1.badge;
        this.storyTitle.textContent = this.config.names.her !== 'My Love' ? `For ${this.config.names.her}` : s1.title;
        this.storySubtitle.textContent = s1.subtitle;
        this.storyBody.innerHTML = `<p class="opening-quote">"${s1.invitation}"</p>`;
        this.actionButton.innerHTML = `<span>${s1.actionText}</span> &rarr;`;
        break;
      }

      // --------------------------------------------------
      // SCENE 2 — THE LETTER
      // --------------------------------------------------
      case 1: {
        const s2 = this.config.scenes.scene2;
        this.chapterBadge.textContent = s2.badge;
        this.storyTitle.textContent = s2.title;
        this.storySubtitle.textContent = s2.subtitle;
        this.storyBody.innerHTML = `<p class="editorial-body">${s2.introText}</p>`;
        this.actionButton.innerHTML = `<span>${s2.actionText}</span> &rarr;`;
        break;
      }

      // --------------------------------------------------
      // SCENE 3 — OUR MEMORIES
      // --------------------------------------------------
      case 2: {
        const s3 = this.config.scenes.scene3;
        this.chapterBadge.textContent = s3.badge;
        this.storyTitle.textContent = s3.title;
        this.storySubtitle.textContent = s3.subtitle;

        const memoryButtonsHtml = s3.items.map(m => {
          const icon = m.type === 'video' ? '🎬' : (m.id.includes('her') ? '✨' : (m.id.includes('my') ? '💫' : '🎞️'));
          return `<button class="memory-cue-btn" data-memory-id="${m.id}"><span>${icon}</span> ${m.title}</button>`;
        }).join('');

        this.storyBody.innerHTML = `
          <p class="editorial-body">${s3.description}</p>
          <div class="memory-buttons-row">${memoryButtonsHtml}</div>
        `;
        this.actionButton.innerHTML = `<span>${s3.actionText}</span> &rarr;`;
        break;
      }

      // --------------------------------------------------
      // SCENE 4 — LOVE JOURNEY (Continuous Multi-Destination)
      // --------------------------------------------------
      case 3: {
        this.renderTravelDestinationContent();
        break;
      }

      // --------------------------------------------------
      // SCENE 5 — FINAL LOCKED CHAMBER
      // --------------------------------------------------
      case 4: {
        const s5 = this.config.scenes.scene5;
        this.chapterBadge.textContent = s5.badge;
        this.storyTitle.textContent = s5.title;

        if (!this.isChamberUnlocked) {
          this.storySubtitle.textContent = s5.subtitle;
          this.storyBody.innerHTML = `
            <p class="opening-quote">"${s5.lockedHeading}"</p>
            <p class="editorial-body">${s5.lockedSubtext}</p>
          `;
          this.actionButton.innerHTML = `<span>${s5.unlockButtonText}</span>`;
        }
        break;
      }

      // --------------------------------------------------
      // SCENE 6 — PROPOSAL
      // --------------------------------------------------
      case 5: {
        const s6 = this.config.scenes.scene6;
        this.chapterBadge.textContent = s6.badge;
        this.storyTitle.textContent = s6.title;
        this.storySubtitle.textContent = s6.subtitle;
        this.storyBody.innerHTML = `<h2 class="proposal-main-heading">${s6.proposalQuestion}</h2>`;

        this.actionButton.style.display = 'none';
        if (proposalBox) {
          proposalBox.style.display = 'flex';
          const yesBtn = document.getElementById('btn-proposal-yes');
          const noBtn = document.getElementById('btn-proposal-no');
          if (yesBtn) yesBtn.innerHTML = s6.yes.buttonText;
          if (noBtn) noBtn.innerHTML = s6.no.buttonText;
        }
        break;
      }
    }
  }

  // ==========================================
  // SCENE 4: CONTINUOUS TRAVEL NAVIGATION
  // ==========================================
  switchTravelDestination(idx) {
    const destinations = this.config.scenes.scene4.destinations;
    if (idx < 0 || idx >= destinations.length) return;
    this.travelDestIndex = idx;
    this.engine.sceneManager.transitionDestination(destinations[idx], idx);
    window.audioEngine.playChime(1.1);
    this.renderTravelDestinationContent();
  }

  renderTravelDestinationContent() {
    const s4 = this.config.scenes.scene4;
    const destinations = s4.destinations;
    const currentDest = destinations[this.travelDestIndex] || destinations[0];
    const isHero = currentDest.id === 'rajasthan';

    this.chapterBadge.textContent = `${s4.badge} · ${currentDest.tag.toUpperCase()}`;
    this.storyTitle.textContent = currentDest.title;
    this.storySubtitle.textContent = isHero ? '👑 The Hero Sanctuary of Our Dreams' : s4.subtitle;

    // Tabs for destinations
    const tabsHtml = destinations.map((d, i) => {
      const activeClass = i === this.travelDestIndex ? 'active' : '';
      return `<button class="travel-dest-tab ${activeClass}" data-dest-index="${i}">${d.tag.split('·')[0].trim()}</button>`;
    }).join('');

    const isLastDest = this.travelDestIndex === destinations.length - 1;

    this.storyBody.innerHTML = `
      <div class="travel-tabs-bar">${tabsHtml}</div>
      <p class="message-quote">"${currentDest.quote}"</p>
      <p class="scene-atmosphere-tag">✨ Atmosphere: ${currentDest.atmosphere}</p>
      <div class="travel-subnav-row">
        <button class="travel-next-btn">
          ${isLastDest ? '<span>ENTER FINAL CHAMBER</span> &rarr;' : `<span>NEXT: ${destinations[this.travelDestIndex + 1].title}</span> &rarr;`}
        </button>
      </div>
    `;

    this.actionButton.style.display = 'none';
  }

  // ==========================================
  // SCENE 2: PHYSICAL MULTI-PAGE LETTER SYSTEM
  // ==========================================
  openLetterExperience() {
    window.audioEngine.playLetterUnfold();
    if (!this.letterOverlay) return;

    this.letterCurrentPage = 0;
    this.renderLetterPage(0);
    this.letterOverlay.classList.add('visible');
  }

  renderLetterPage(pageIndex) {
    const letterConfig = this.config.scenes.scene2.letter;
    const pages = letterConfig.pages;
    const totalPages = pages.length;
    const currentLines = pages[pageIndex] || [];

    const linesHtml = currentLines.map((line, idx) => {
      const formatted = line.split('\n').join('<br><br>');
      return `<p class="letter-line" style="animation-delay: ${0.15 + idx * 0.25}s">${formatted}</p>`;
    }).join('');

    const letterContent = document.getElementById('letter-inner-content');
    if (!letterContent) return;

    const isLastPage = pageIndex === totalPages - 1;

    let actionControls = '';
    if (!isLastPage) {
      actionControls = `
        <div class="letter-nav-row">
          <span class="letter-page-indicator">Page ${pageIndex + 1} of ${totalPages}</span>
          <button class="letter-page-btn" id="letter-next-page-btn">NEXT PAGE &rarr;</button>
        </div>
      `;
    } else {
      actionControls = `
        <div class="letter-present-wrapper">
          <button class="letter-present-btn" id="letter-present-btn">${letterConfig.presentButtonText}</button>
          <div id="present-audio-controls" class="present-audio-controls" style="display: none;">
            <span class="present-track-title">🎵 ${letterConfig.songTitle}</span>
            <div class="present-btn-group">
              <button id="present-play-btn" class="present-ctrl-btn">▶ Play</button>
              <button id="present-pause-btn" class="present-ctrl-btn">⏸ Pause</button>
              <button id="present-replay-btn" class="present-ctrl-btn">🔄 Replay</button>
            </div>
          </div>
        </div>
        <div class="letter-nav-row" style="margin-top: 24px;">
          <span class="letter-page-indicator">Page ${pageIndex + 1} of ${totalPages}</span>
          <button class="letter-continue-btn" id="letter-finish-btn">${letterConfig.continueButtonText}</button>
        </div>
      `;
    }

    letterContent.innerHTML = `
      <div class="letter-seal-stamp">👑</div>
      <h3 class="letter-heading">${letterConfig.heading}</h3>
      <div class="letter-text-body">${linesHtml}</div>
      ${actionControls}
    `;

    // Bind dynamic buttons
    if (!isLastPage) {
      document.getElementById('letter-next-page-btn')?.addEventListener('click', () => {
        window.audioEngine.playLetterUnfold();
        this.letterCurrentPage++;
        this.renderLetterPage(this.letterCurrentPage);
      });
    } else {
      // Present Song Trigger
      document.getElementById('letter-present-btn')?.addEventListener('click', (e) => {
        const btn = e.currentTarget;
        btn.style.display = 'none';
        const ctrl = document.getElementById('present-audio-controls');
        if (ctrl) ctrl.style.display = 'flex';

        this.specialSongPlaying = true;
        window.audioEngine.playSpecialSong(() => {
          this.specialSongPlaying = false;
        });
      });

      document.getElementById('present-play-btn')?.addEventListener('click', () => {
        window.audioEngine.resumeSpecialSong();
      });
      document.getElementById('present-pause-btn')?.addEventListener('click', () => {
        window.audioEngine.pauseSpecialSong();
      });
      document.getElementById('present-replay-btn')?.addEventListener('click', () => {
        window.audioEngine.replaySpecialSong();
      });

      document.getElementById('letter-finish-btn')?.addEventListener('click', () => {
        this.closeLetterAndAdvance();
      });
    }
  }

  closeLetterAndAdvance() {
    if (this.letterOverlay) {
      this.letterOverlay.classList.remove('visible');
    }
    this.goToNextScene();
  }

  // ==========================================
  // SCENE 3: 3D MEMORY CLOSE-UP & MODAL PREVIEW
  // ==========================================
  openMemoryModalById(id) {
    const mem = this.config.scenes.scene3.items.find(m => m.id === id);
    if (mem) this.openMemoryModal(mem);
  }

  openMemoryModal(mem) {
    if (!this.modalOverlay) return;
    window.audioEngine.playChime(1.2);

    // 3D Camera smoothly zooms into physical object
    this.engine.sceneManager.focusMemoryItem(mem);

    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-media-container');
    const capEl = document.getElementById('modal-caption');

    if (titleEl) titleEl.textContent = `${mem.title} · ${mem.tag || ''}`;
    if (capEl) capEl.textContent = mem.caption;

    if (bodyEl) {
      if (mem.type === 'video') {
        bodyEl.innerHTML = `<video class="modal-video-player" src="${mem.src}" controls autoplay loop playsinline></video>`;
      } else {
        bodyEl.innerHTML = `<img class="modal-image-player" src="${mem.src}" alt="${mem.title}" onerror="this.onerror=null; this.src='assets/personal/her-photo.jpeg';">`;
      }
    }

    this.modalOverlay.classList.add('visible');
  }

  closeMemoryModal() {
    if (this.modalOverlay) {
      const vid = this.modalOverlay.querySelector('video');
      if (vid) vid.pause();
      this.modalOverlay.classList.remove('visible');
    }
    // Return camera smoothly in 3D
    this.engine.sceneManager.unfocusMemoryItem();
  }

  // ==========================================
  // SCENE 5: FINAL LOCKED CHAMBER & VOICEOVER
  // ==========================================
  unlockFinalChamber() {
    this.isChamberUnlocked = true;
    this.actionButton.style.display = 'none';

    // 1. Trigger 3D padlock opening animation
    window.audioEngine.playChime(1.3);
    this.engine.sceneManager.unlockChamberAnimation(() => {
      // 2. Padlock unlocked; show voice wave visualizer
      this.storyBody.innerHTML = `
        <div class="voiceover-status-box">
          <div class="voice-wave-anim">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
          <p class="voice-prompt-text">${this.config.scenes.scene5.voiceoverPrompt}</p>
        </div>
      `;

      // 3. Play voiceover; transition to Scene 6 strictly when audio 'ended' fires
      window.audioEngine.playFinalVoice(() => {
        // Short emotional pause before proposal reveal
        setTimeout(() => {
          this.loadScene(5);
        }, 600);
      });
    });
  }

  // ==========================================
  // SCENE 6: PROPOSAL YES & NO HANDLERS
  // ==========================================
  handleProposalYes() {
    window.audioEngine.playCelebrationChord();
    this.engine.sceneManager.triggerYesCelebration();

    const proposalBox = document.getElementById('proposal-controls');
    if (proposalBox) proposalBox.style.display = 'none';

    const yesData = this.config.scenes.scene6.yes;

    this.storyBody.innerHTML = `
      <div class="celebration-banner">
        <h1 class="celebration-title">${yesData.title}</h1>
        <div class="celebration-couple-portraits">
          <div class="portrait-frame">
            <img src="${this.config.media.herPhoto}" alt="Her">
          </div>
          <span class="heart-connector">&hearts;</span>
          <div class="portrait-frame">
            <img src="${this.config.media.myPhoto}" alt="Me">
          </div>
        </div>
        <p class="celebration-text">${yesData.message}</p>
      </div>
    `;
  }

  handleProposalNo() {
    window.audioEngine.playPlayfulBoing();
    const reactions = this.config.scenes.scene6.no.reactions;
    const currentResp = reactions[this.noClickCount % reactions.length];
    this.noClickCount++;

    const noBtn = document.getElementById('btn-proposal-no');

    let toast = document.getElementById('no-playful-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'no-playful-toast';
      toast.className = 'playful-no-toast';
      noBtn.parentElement.appendChild(toast);
    }
    toast.textContent = currentResp;
    toast.style.opacity = '1';

    // Playful non-trapping button offset
    const randomOffset = (Math.random() - 0.5) * 60;
    gsap.to(noBtn, { x: randomOffset, duration: 0.25, ease: 'back.out(2)' });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const canvasContainer = document.getElementById('webgl-container');
  window.webglEngine = new WebGLEngine(canvasContainer);
  window.uiController = new UIController(window.webglEngine);
});
