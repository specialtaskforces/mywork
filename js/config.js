/**
 * config.js — All personalizable content in one place.
 * Replace the bracketed placeholders with your own content.
 * No other files need to be changed for content customization.
 */

export const CONTENT = {

  /** Names */
  names: {
    mine: '[MY_NAME]',
    hers: '[HER_NAME]',
  },

  /** Opening screen */
  opening: {
    line1: "There's somewhere",
    line2: "I want to take you.",
    cta: "BEGIN THE JOURNEY",
  },

  /** Chapter 1 — Garden of Thoughts */
  chapter1: {
    title: "A Garden of Thoughts",
    thoughts: [
      "[THOUGHT_01] — A memory that never leaves me.",
      "[THOUGHT_02] — The moment I knew.",
      "[THOUGHT_03] — Every quiet evening that felt like home.",
      "[THOUGHT_04] — The way you laugh at the worst jokes.",
    ],
  },

  /** Chapter 2 — The Letter */
  chapter2: {
    title: "A Letter",
    lines: [
      "[LETTER_01] — I've been thinking about how to say this for a long time.",
      "[LETTER_02] — You are the most unexpected beautiful thing that has happened to me.",
      "[LETTER_03] — I want to show you the world, and then come home to you.",
    ],
    signName: '[MY_NAME]',
  },

  /** Chapter 3 — Reaction (no text needed, purely visual) */
  chapter3: {
    title: null,
  },

  /** Travel Destinations */
  rome: {
    label: "Rome",
    message: "[ROME_MESSAGE] — Walking these streets, I kept thinking of you.",
  },

  amsterdam: {
    label: "Amsterdam",
    message: "[AMSTERDAM_MESSAGE] — Even the rain here felt like a song.",
  },

  dinner: {
    label: "An Evening Together",
    message: "[DINNER_MESSAGE] — There is nowhere I'd rather be than across this table from you.",
  },

  rajasthan: {
    label: "Rajasthan",
    message: "[RAJASTHAN_MESSAGE] — The lanterns here burn as warm as you make me feel.",
  },

  moonlake: {
    label: "Under the Stars",
    message: "Every star tonight feels like something we haven't said yet.",
  },

  /** Cinema */
  cinema: {
    title: "A Few Moments",
  },

  /** Playful */
  playful: {
    title: "Remember This?",
  },

  /** Nature */
  nature: {
    title: "A Quiet Walk",
    hint: "Touch the world around you.",
  },

  /** Final Proposal */
  proposal: {
    text: "[FINAL_PROPOSAL_TEXT] — Will you share every journey with me, always?",
    yes: "[YES_MESSAGE] — You've made me the happiest person alive. 🤍",
    no: [
      "[NO_MESSAGE_01] — Are you sure? Maybe reconsider? 😊",
      "[NO_MESSAGE_02] — The fireflies are voting YES, by the way.",
      "[NO_MESSAGE_03] — Fine. But the stars disagree. 🌟",
    ],
  },

};

/** Color palette per scene (used by engine/transitions) */
export const PALETTE = {
  opening:    { bg: 0x0a1628, fog: 0x0a1628, fogDensity: 0.015 },
  chapter1:   { bg: 0x0d1a10, fog: 0x0d1a10, fogDensity: 0.025 },
  chapter2:   { bg: 0x1a0f08, fog: 0x1a0f08, fogDensity: 0.04  },
  chapter3:   { bg: 0x1a0f08, fog: 0x1a0f08, fogDensity: 0.04  },
  rome:       { bg: 0x0c1532, fog: 0x0c1532, fogDensity: 0.018 },
  amsterdam:  { bg: 0x060d1a, fog: 0x060d18, fogDensity: 0.022 },
  dinner:     { bg: 0x0d0805, fog: 0x0d0805, fogDensity: 0.05  },
  rajasthan:  { bg: 0x0a0608, fog: 0x0a0608, fogDensity: 0.02  },
  moonlake:   { bg: 0x060810, fog: 0x060810, fogDensity: 0.012 },
  cinema:     { bg: 0x050505, fog: 0x050505, fogDensity: 0.06  },
  playful:    { bg: 0x0d0a18, fog: 0x0d0a18, fogDensity: 0.03  },
  nature:     { bg: 0x080f0a, fog: 0x080f0a, fogDensity: 0.02  },
  proposal:   { bg: 0x040610, fog: 0x040610, fogDensity: 0.01  },
};

/** Story sequence — order of scenes */
export const STORY_SEQUENCE = [
  { id: 'opening',   transition: null,       chapterLabel: null,                  chapterNum: null },
  { id: 'chapter1',  transition: 'push',     chapterLabel: 'A Garden of Thoughts', chapterNum: '01' },
  { id: 'chapter2',  transition: 'push',     chapterLabel: 'The Letter',           chapterNum: '02' },
  { id: 'chapter3',  transition: 'fade',     chapterLabel: null,                  chapterNum: null  },
  { id: 'rome',      transition: 'travel',   chapterLabel: 'Rome',                chapterNum: '03' },
  { id: 'amsterdam', transition: 'travel',   chapterLabel: 'Amsterdam',           chapterNum: '04' },
  { id: 'dinner',    transition: 'travel',   chapterLabel: 'An Evening Together', chapterNum: '05' },
  { id: 'rajasthan', transition: 'travel',   chapterLabel: 'Rajasthan',           chapterNum: '06' },
  { id: 'moonlake',  transition: 'travel',   chapterLabel: 'Under the Stars',     chapterNum: '07' },
  { id: 'cinema',    transition: 'fade',     chapterLabel: 'A Few Moments',       chapterNum: '08' },
  { id: 'playful',   transition: 'fade',     chapterLabel: 'Remember This?',      chapterNum: '09' },
  { id: 'nature',    transition: 'fade',     chapterLabel: 'A Quiet Walk',        chapterNum: '10' },
  { id: 'proposal',  transition: 'dissolve', chapterLabel: null,                  chapterNum: null  },
];
