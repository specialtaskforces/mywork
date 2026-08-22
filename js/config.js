/**
 * MASTER PERSONALIZED 6-SCENE CONFIGURATION
 * 
 * Central media and narrative configuration for the 6-Scene Cinematic Proposal.
 * Replace asset paths or text here to customize the entire experience.
 */

window.PROPOSAL_CONFIG = {
  // Personal names
  names: {
    me: "Me",
    her: "My Love"
  },

  // Central Media Registry
  media: {
    herPhoto: "assets/personal/her-photo.jpeg",
    myPhoto: "assets/personal/my-photo.jpeg",
    rajasthanResort: "assets/personal/rajasthan-resort.jpg",
    reel01: "assets/personal/reel-01.webp",
    reel02: "assets/personal/reel-02.mp4",
    
    // Future-proof extensible photo and reel collections
    couplePhotos: [
      {
        id: "couple-01",
        title: "Our Sweetest Smile",
        src: "assets/personal/her-photo.jpeg",
        caption: "The radiant smile that changed my entire world."
      },
      {
        id: "couple-02",
        title: "Pure Warmth",
        src: "assets/personal/my-photo.jpeg",
        caption: "Standing beside you is where I always want to be."
      },
      {
        id: "couple-03",
        title: "Royal Heritage Moments",
        src: "assets/personal/rajasthan-resort.jpg",
        caption: "Where dreams of royalty meet tranquil waters."
      }
    ],
    reels: [
      {
        id: "reel-01",
        title: "A Sweet Emotion",
        src: "assets/personal/reel-01.webp",
        type: "image",
        tag: "Emotional / Cute Memory",
        caption: "Every glance of yours fills my heart with an inexplicable peace."
      },
      {
        id: "reel-02",
        title: "Playful Smiles & Teasing",
        src: "assets/personal/reel-02.mp4",
        type: "video",
        tag: "Playful / Funny Surprise",
        caption: "Pure unscripted laughter, silly moments, and endless joy together!"
      }
    ],

    // Audio Assets (Strict single-source configuration)
    audio: {
      mainBgm: "assets/audio/main-song.mp3",
      mainBgmFallback: "assets/audio/terehimerehisab_[cut_19sec].mp3",
      specialSong: "assets/audio/song-for-her.mp3",
      specialSongFallback: "assets/audio/song for her_[cut_25sec].mp3",
      finalVoice: "assets/audio/i-love-you.m4a",
      finalVoiceFallback: "assets/audio/i love you.m4a"
    }
  },

  // 6 MAJOR SCENES CONFIGURATION
  scenes: {
    // ----------------------------------------------------
    // SCENE 1 — ARRIVAL
    // ----------------------------------------------------
    scene1: {
      badge: "SCENE 01 · ARRIVAL",
      title: "An Odyssey For You",
      subtitle: "A Continuous Cinematic Love Story",
      invitation: "Step inside a world crafted entirely from my memories, my feelings, and our timeless journey together.",
      actionText: "START OUR JOURNEY"
    },

    // ----------------------------------------------------
    // SCENE 2 — THE LETTER
    // ----------------------------------------------------
    scene2: {
      badge: "SCENE 02 · THE LETTER",
      title: "Words From My Soul",
      subtitle: "Resting under warm candlelight on parchment paper",
      introText: "A handwritten letter written straight from my heart. Turn through each page to read what I've always wanted to tell you.",
      actionText: "OPEN & READ LETTER",
      letter: {
        heading: "To My Dearest Love,",
        pages: [
          // Page 1
          [
            "Heyy, I have to say something (I love you, I love you so much).",
            "It takes a lot of time to say it directly to you…",
            "Aisa nahi hai maine try nahi kiyaaa, but thoda sa dar lag raha tha aur himmat nahi ho rahi thi….",
            "Aur jab mai sochta tha ke aaj keh du, aaj keh du… lekin dil kaapne lagta haiii… keee zyada zald baazi to nahi kar raha hoon..",
            "Khone ka darrr, kyo keee jab insaan had se zyada close ho jaye aur dil lag jaye aur vo chhootttt jaye, to fir kisi cheez mein mann nahi lagta. Uski har baat, har moment, saari cheezein din-raat aur khayalon mein aane lagti hainnn."
          ],
          // Page 2
          [
            "Aapki baatein saari achhi lagti hain, the way you talk, the way you ask about my day, the way you teach me 😅",
            "I like it, and try to follow it and correct my own thoughts.",
            "And also 😩 dominate me, “do this, do that” (I’m teasing you).",
            "Aur aap jaise bhi hooo, mere hooo…. Aur mujhe …… aapko daily paana hai, ek din nahi.",
            "Aur aapka dance mujhe bahut achha lagta hai, jo aapne ek baar dikhaya tha, fir kabhi dubara dekha nahi 😒"
          ],
          // Page 3
          [
            "Aappp jab bachche ban ke baat karte ho, mann karta hai kisse le loon gaal pe 😘. Koi itna cute kaise ho sakta hai……",
            "But I haven’t expected that a girl like you could exist or have been in my life. Hamesha mai yahi sochta tha imagination mein, lekin vo ab aankhon ke saamneee hai.",
            "Future ka pata nahi kya hoga, aur na kisi ne dekha hai. Present moment mein appp ho, aur aap hi rahogeeee.",
            "Once you enter in my heart, it’s tough to forget you………… and I don’t want to think about you leaving me or not.",
            "Jitne bhi time hai, vo ek-ek time mai beetana chaongaaaa………."
          ],
          // Page 4
          [
            "I never want to control you. Your life has its own path, but you can tell me so I can adjust accordingly…… I like that everyone has their own life to enjoy and express their own thoughts.",
            "It’s all my words….",
            "You are pure unique…. Your own thoughts, and positiveness, no negativity for othersss, you care a lot..",
            "If I were a writer, I could write a whole book… But I can dooo, it’ll take a lot of timeeeee……..",
            "So my sweetheart, my love, my cutieeee…\nYou mean a lottttt.\nI love youuuuuuuu…….😘😘"
          ]
        ],
        presentButtonText: "🎁 I HAVE A PRESENT FOR YOU",
        songTitle: "Song For Her",
        continueButtonText: "CONTINUE TO OUR MEMORIES &rarr;"
      }
    },

    // ----------------------------------------------------
    // SCENE 3 — OUR MEMORIES
    // ----------------------------------------------------
    scene3: {
      badge: "SCENE 03 · OUR MEMORIES",
      title: "The Sanctuary of Memories",
      subtitle: "Framed photographs, captured reels, and moments etched in starlight",
      description: "Each frame holds a piece of our story. Click any physical memory to inspect it up close and relive the feelings.",
      actionText: "CONTINUE TO OUR LOVE JOURNEY",
      items: [
        {
          id: "mem-her",
          title: "Her Radiant Smile",
          type: "image",
          src: "assets/personal/her-photo.jpeg",
          tag: "Her Portrait",
          caption: "The most beautiful face in the universe—my daily inspiration and peace."
        },
        {
          id: "mem-my",
          title: "The One Who Loves You",
          type: "image",
          src: "assets/personal/my-photo.jpeg",
          tag: "My Portrait",
          caption: "Loving you more deeply with every passing heartbeat."
        },
        {
          id: "mem-reel1",
          title: "Sweetest Melody",
          type: "image",
          src: "assets/personal/reel-01.webp",
          tag: "Emotional / Cute Reel",
          caption: "Those sweet, quiet glimpses that make my heart melt every single time."
        },
        {
          id: "mem-reel2",
          title: "Playful Smiles & Teasing",
          type: "video",
          src: "assets/personal/reel-02.mp4",
          tag: "Playful / Funny Surprise",
          caption: "Pure unscripted laughter, silly moments, and endless joy together!"
        }
      ]
    },

    // ----------------------------------------------------
    // SCENE 4 — LOVE JOURNEY (Continuous Multi-Destination)
    // ----------------------------------------------------
    scene4: {
      badge: "SCENE 04 · LOVE JOURNEY",
      title: "Our World Odyssey",
      subtitle: "A continuous visual voyage across destinations of our dreams",
      actionText: "JOURNEY TO THE FINAL CHAMBER",
      destinations: [
        {
          id: "rome",
          title: "Rome & The Vatican",
          tag: "Eternal City",
          bg: "assets/images/locations/rome.jpg",
          quote: "Like ancient arches carved beneath golden skies, some feelings are built to endure for eternity.",
          atmosphere: "Warm travertine courtyards, whispering fountains, and sunset glow."
        },
        {
          id: "amsterdam",
          title: "Amsterdam Canals at Night",
          tag: "Midnight Reflections",
          bg: "assets/images/locations/amsterdam.jpg",
          quote: "Walking along quiet waterways, watching amber lanterns reflect like dancing stars just for us.",
          atmosphere: "Deep indigo twilight, shimmering canals, and gentle evening breeze."
        },
        {
          id: "dinner",
          title: "Intimate Candlelight Dinner",
          tag: "Reserved For Two",
          bg: "assets/images/locations/dinner.jpg",
          quote: "In the warm glow of candlelight, time stands still. Just you, me, and unspoken promises.",
          atmosphere: "Rich mahogany, flickering candle glow, fresh roses, and warm ambient light."
        },
        {
          id: "rajasthan",
          title: "Rajasthan Luxury Heritage Resort",
          tag: "Royal Sanctuary · Hero Destination",
          // User's hero photograph
          bg: "assets/personal/rajasthan-resort.jpg",
          quote: "Where royal heritage meets tranquil waters—a sanctuary as majestic and timeless as our love.",
          atmosphere: "Reflective emerald water, golden haveli sandstone, brass lanterns, and royal peace."
        }
      ]
    },

    // ----------------------------------------------------
    // SCENE 5 — FINAL LOCKED CHAMBER
    // ----------------------------------------------------
    scene5: {
      badge: "SCENE 05 · THE FINAL CHAMBER",
      title: "The Celestial Starlit Sanctuary",
      subtitle: "A sacred stillness under moonlight and floating lanterns",
      lockedHeading: "There's one last thing...",
      lockedSubtext: "A locked chamber that holds the most important words I will ever speak to you.",
      unlockButtonText: "✨ UNLOCK",
      voiceoverPrompt: "Listen closely to what my heart has to say...",
      voiceAudio: "assets/audio/i-love-you.m4a"
    },

    // ----------------------------------------------------
    // SCENE 6 — PROPOSAL & CELEBRATION
    // ----------------------------------------------------
    scene6: {
      badge: "SCENE 06 · FOREVER & ALWAYS",
      title: "The Question of a Lifetime",
      subtitle: "Beneath the glowing diamond starlight",
      proposalQuestion: "Will you walk through all of life's journeys with me, and be mine forever?",
      yes: {
        buttonText: "YES, WITH ALL MY HEART 💍❤️",
        title: "YES! TODAY, TOMORROW & FOREVER! 💍✨",
        message: "You have made me the happiest person in the universe. In this lifetime and all the ones to come, my heart belongs completely to you. I love you endlessly! ❤️"
      },
      no: {
        buttonText: "Let me think...",
        reactions: [
          "Are you sure? Even the stars in Rome and Rajasthan voted YES! 😉✨",
          "Take another look at the ring—it comes with a lifetime guarantee of unlimited hugs, kisses & care! Try again? 💖",
          "There is no escaping my love! Let me ask you one more time with all my soul... 💍✨"
        ]
      }
    }
  }
};
