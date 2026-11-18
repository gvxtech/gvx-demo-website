# GVX TECH — Beyond the Surface

Updated cinematic GVX Tech website using HTML, CSS, JavaScript, Three.js and GSAP.

## Visible 3D object
The hero contains a custom-built Three.js deep-sea exploration craft with a metallic pressure hull, glass command dome, nose canopy, portholes, stabilising fins, side thrusters, spinning rear propeller, blue light strips and working spotlights. It is generated from real 3D meshes in `main.js` (not a flat image or CSS illustration).

## Camera experience
- ScrollTrigger pins the hero for a long cinematic sequence.
- Camera dollies toward the craft, sweeps around it, then pulls back.
- Craft orientation changes with the camera journey.
- Pointer movement adds subtle parallax.

## Run locally
Run from this folder:

```bash
python3 -m http.server 8000
```

Open http://localhost:8000. Use a modern browser with WebGL enabled and an internet connection for CDN modules and fonts.

## Deploy
Upload `index.html`, `style.css`, and `main.js` to your hosting `public_html` directory.
