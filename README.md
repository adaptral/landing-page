# Adaptral

A minimal Next.js landing page with a real-time, perspective-projected numerical weight lattice.

```sh
npm install
npm run dev
```

`npm run build` creates a static production export in `out/`. `npm run typecheck` checks TypeScript.

The animation uses Canvas 2D to project a three-dimensional lattice, sort weights by depth, and animate individual value changes with rainbow pulses. It scales to device pixel density, pauses offscreen and in background tabs, and respects the system's reduced-motion preference.
