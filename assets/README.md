# ASSETS & MEDIA GUIDE

This folder is structured so you can seamlessly replace placeholders with your real media.

## Directory Structure

```
assets/
├── images/     <-- Put your photos here (e.g. photo_01.jpg, photo_02.jpg)
├── videos/     <-- Put your MP4 travel / memory videos here (e.g. video_01.mp4)
├── reels/      <-- Put your vertical reels or funny clips here (e.g. reel_01.mp4)
├── stickers/   <-- Put any custom PNG stickers / badges / sketches here
└── audio/      <-- Put your custom background music MP3 here (e.g. soundtrack.mp3)
```

## Configuration
Open `js/config.js` to modify:
1. Names: Replace `[MY_NAME]` and `[HER_NAME]` with your real names.
2. Messages: Replace `[THOUGHT_01]`, `[LETTER_01]`, `[ROME_MESSAGE]`, `[FINAL_PROPOSAL_TEXT]`, etc.
3. Media Paths: Update file paths to point to your files in `assets/images/`, `assets/videos/`, etc.
4. Audio: Place your `soundtrack.mp3` in `assets/audio/`. If omitted, the site automatically generates an atmospheric cinematic ambient soundtrack via Web Audio API!
