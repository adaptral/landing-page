# Adaptral

A minimal Next.js landing page with a real-time, perspective-projected numerical weight lattice.

```sh
npm install
npm run dev
```

`npm run build` creates a static production export in `out/`. `npm run typecheck` checks TypeScript.

The foreground projects a sparse three-dimensional lattice of floating weights (125 on desktop, 64 on mobile) and animates individual value changes with rainbow pulses. A second canvas draws the loss surface, fading it out before the matrix. Its moving dot carries a shared spectrum across the grid and headline, then fades into the matrix. Both use one animation clock. All animations respect the system's reduced-motion preference; canvases pause offscreen and in background tabs.

The Entrepreneurs First backing badge uses the user-provided artwork, stored locally in `public/ef-backing.png`.
