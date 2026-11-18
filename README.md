# Adaptral

A minimal Next.js landing page with a real-time, perspective-projected numerical weight lattice.

```sh
npm install
npm run dev
```

`npm run build` creates a static production export in `out/`. `npm run typecheck` checks TypeScript.

The foreground uses a transparent Canvas 2D to project a three-dimensional lattice of floating weights and animate individual value changes with rainbow pulses. A second canvas draws a subtle loss surface and a numerically computed gradient descent trajectory behind the page. The headline carries a slow spectral sweep. All animations respect the system's reduced-motion preference; canvases pause offscreen and in background tabs.

The Entrepreneurs First backing badge uses the user-provided artwork, stored locally in `public/ef-backing.png`.
