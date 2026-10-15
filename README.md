# RESHAPE

An interactive generative sculpture about control, memory, and the traces we leave.

Thousands of silver-white particles form a floating, folded surface. It breathes on its own, responds to your gestures, and retains subtle impressions of your presence.

## Experience

- **Move slowly** — nearby particles gently follow.
- **Move quickly and repeatedly** — the sculpture resists and fragments.
- **Step away** — it gradually recovers, keeping traces of your interaction.
- **Stay still** — a fleeting formation emerges after 15 seconds.
- **Enable sound** — microphone input creates smooth, sound-driven swells.

Bass expands the folds, midrange sends waves through the surface, and treble adds delicate tremors. Audio is processed locally, never recorded or uploaded.

## Controls

| Control | Action |
| --- | --- |
| R | Reset the sculpture and clear its memory |
| H | Hide or show text |
| Escape | Exit exhibition mode |
| Enable sound / Sound on | Start or stop microphone input |
| Guide | Show interaction instructions |

On touch displays, drag to interact. Double-tap the bottom-right corner to restore hidden controls.

## Run locally

Requires Node.js 22.12 or newer.

npm install
npm run dev

Open the local address printed in your terminal.

## Build

npm run build

The production website is generated in `dist/`.

npm run preview

Preview the production build locally.

## Publish with GitHub Pages

1. Upload this project to `anniejguo2002/RESHAPE`, including `.github/workflows/pages.yml`.
2. Open the repository’s **Settings → Pages**.
3. Set **Source** to **GitHub Actions**.
4. Push changes to `main`, or manually run the workflow from the **Actions** tab.

After a successful deployment, the artwork is available at:

https://anniejguo2002.github.io/RESHAPE/

Microphone input requires HTTPS or localhost and permission from the visitor.

## Customize

Edit `src/config.js`:

| Parameter | Controls |
| --- | --- |
| particleCount | Desktop particle density |
| mobileParticleCount | Particle density on narrow screens |
| filamentCount | Number of fine surface contours |
| motionSpeed | Ambient movement speed |
| sensitivity | Cursor disturbance sensitivity |
| interactionRadius | Cursor influence radius |
| memoryHalfLife | How slowly recent disturbance fades |
| memoryResidue | Amount of lasting interaction residue |
| memoryStrength | Visible deformation from memory |
| audioSensitivity | Microphone sensitivity |
| audioMotion | Sound-driven movement strength |

Memory lasts for the current page session. Resetting or reloading restores the original form.

## Technology

Built with Vite, Three.js, WebGL shaders, and the Web Audio API.

- 100,000 particles on desktop; 55,000 on narrow screens
- Deterministic seeded geometry
- GPU-based particle and filament deformation
- Spatial disturbance memory
- Mouse and touch interaction
- Responsive framing and capped pixel density
- Reduced-motion support
- No external visual assets or paid APIs

## Tests

npm test
