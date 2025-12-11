FEATURES ROADMAP - Themes & Previews

Overview

This document captures theme ideas we discussed, implementation notes and a short plan for small animated preview canvases (Aurora, Snow realistic, Minimal Glass).

1) Themes added to `src/utils/constants.js`

- Aurora
- Paper Notebook
- Cinematic
- Synthwave
- Nebula
- Frosted Glass
- Seasons (Auto)
- High Contrast
- Focus Mode
- Energy Mode
- Calm Mode
- Arcade (Gamified)
- Audio Reactive
- Developer (debug overlay)
- Colorblind Safe
- Snowfall

2) Additional theme ideas (future)

- Material Nature (per-biome variants + seasonal auto-switch)
- Local/Cultural expanded packs (e.g., more city palettes)
- Theme marketplace / import-export
- Per-room / per-timer theme overrides
- Smart adaptive themes (reduce eye strain over session)
- Community-shared theme packs (JSON + optional assets)

3) Preview canvases - Draft plan (Aurora, Snow realistic, Minimal Glass)

Goal: provide small animated previews in the Themes picker. Each preview should be a lightweight canvas (e.g., 120x70px) that runs an optimized loop and is paused when offscreen.

Aurora preview
- Visual: slow, smooth gradient bands that drift horizontally with alpha blending.
- Assets: generated gradient only (no heavy particles). Use 2-3 layered canvas passes with different speeds and opacities.
- Controls: `animationSpeed`, `opacity`.

Snow realistic preview
- Visual: small white circular particles in 2-3 depth layers. Foreground larger/fast, mid smaller/slower and blurred background dots.
- Implementation: three particle layers; draw circles with radial gradient for soft edges; apply slight parallax movement for depth.
- Controls: `flakeSize`, `layerCount`, `windStrength`.

Minimal Glass preview
- Visual: frosted panels with subtle blur and sheen. Show a primary translucent card against a muted backdrop.
- Implementation: single canvas compositing: draw backdrop gradient -> draw semi-transparent rect with inner shadow and highlight line; animate subtle sheen movement.
- Controls: `blurStrength`, `frostTint`.

4) Performance & UX notes
- Keep previews tiny and low-FPS (15-24 FPS) and stop animation when the preview is not visible.
- Use `requestAnimationFrame` only while preview visible; otherwise show static render.
- Offer `reducedMotion` setting to disable animated previews.

5) Next steps
- Implement small preview canvas component and wire it into the ThemeManager previews.
- Add per-theme `previewConfig` fields (already added to some themes in constants).
- Create fallback static thumbnails for devices with `prefers-reduced-motion` or low power.

---

If you'd like, I can now:
- implement the tiny preview canvas component and wire previews into `ThemeManager` (one theme at a time), or
- produce ready-to-use preview components for the three favorites (Aurora, Snowfall, Frosted Glass).

Which do you want next?