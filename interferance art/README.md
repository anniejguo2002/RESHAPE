# The Shape of Interference

A browser-based sculpture about control, memory, and the traces people leave.
An open folded manifold rendered as 100,000 luminous grains and 180 contour
filaments. All geometry is seeded; there are no images, remote APIs, or assets.

## Run

Use Node.js 22.12+ (or Node 20.19+).

```sh
npm install
npm run dev
```

Open the local URL Vite prints. `npm run build` creates `dist/`;
`npm run preview` serves that production build. `npm test` checks field locality,
residue, time-independent decay, and deterministic initialization.

## Encounter

- Move slowly near the sculpture: folds and grains lean toward your hand.
- Repeated fast passes accumulate resistance: folds split and repel your hand.
- Every gesture deposits a local dent in a 48 × 48 spatial memory field.
- After five seconds without movement, resistance begins to dissipate.
- After fifteen seconds, the surface briefly unfurls into a brighter pleated veil.
  It recurs only after another long quiet interval.
- **R** / Reset restores the initial form and clears all memory.
- **H** / Hide text enters exhibition mode; **H** or **Escape** restores text.
  On touch displays, double-tap the bottom-right 90px corner to restore text.
- Guide replays the introductory text. Touch dragging uses the same interaction.

Memory lasts for the current page session. Reloading starts a fresh encounter.
The original shape is stable: deformations are sampled from it, never accumulated
into particle positions. Hidden tabs suspend rendering; elapsed frame time is
clamped on return. Reduced-motion preferences slow ambient animation.

## Artistic controls

Edit `src/config.js`:

| Parameter | Default | Effect |
| --- | --- | --- |
| `particleCount` | 100000 | Desktop grain density |
| `mobileParticleCount` | 55000 | Density on narrow screens |
| `filamentCount` | 180 | Number of fine surface contours |
| `memoryHalfLife` | 180 | Seconds for transient disturbance to halve |
| `memoryResidue` | 0.23 | Amount left as permanent session sediment |
| `memoryStrength` | 0.78 | Visible depth and shear of remembered gestures |
| `sensitivity` | 1 | Resistance and memory accumulation rate |
| `interactionRadius` | 0.95 | Cursor influence radius in sculpture units |
| `motionSpeed` | 0.24 | Ambient breathing and reorganization speed |
| `pixelRatioCap` | 1.7 | High-DPI rendering cost limit |
| `recoveryDelay` | 5 | Quiet seconds before resistance subsides |
| `stillnessDelay` | 15 | Quiet seconds before the first emergence |

`src/sculpture.js` defines the asymmetric folded surface. `src/shaders.js`
deforms grains and filaments together on the GPU. `src/memory.js` owns the
bounded transient/residual field; `src/main.js` handles timing and interaction.
Two draw calls render the sculpture. Field updates touch only 2,304 cells.

## Sound

Click **Enable sound**, then allow microphone access. Bass expands and twists the
folds, midrange sends waves along the surface, and treble adds restrained edge tremors
and light. Click **Sound on** to stop listening and release the microphone.
Audio is analysed locally, never recorded, transmitted, or played through speakers.
Use a microphone near music or your voice; this does not capture system audio directly.
The sculpture still works if permission is declined. Microphone access needs
localhost or HTTPS. `audioSensitivity` controls input gain; `audioMotion` controls
deformation strength in `src/config.js`. Sound complements cursor memory and
does not reset the stillness timer.

Sound envelopes use a slow attack and lingering release so beats swell smoothly;
reduced displacement keeps the folds close to their original structure.

## GitHub Pages

This project is configured for `anniejguo2002/RESHAPE`.
In the repository's **Settings → Pages**, choose **GitHub Actions** as the source.
Every push to `main` runs tests, builds the artwork, and publishes `dist/`.
The expected address after a successful deployment is:
https://anniejguo2002.github.io/RESHAPE/

The production workflow sets Vite's base path to `/RESHAPE/`. Local development
continues to use `/`. Microphone access works on the HTTPS Pages address.
