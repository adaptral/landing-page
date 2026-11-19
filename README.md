# Adaptral

A minimal Next.js landing page with a real-time, perspective-projected neural network whose weights visibly update.

```sh
npm install
npm run dev
```

`npm run build` creates a static production export in `out/`. `npm run typecheck` checks TypeScript.

The foreground projects a small fully connected network in three dimensions (4-6-6-3 neurons on desktop, 3-5-5-2 on mobile) that sways gently. Connection thickness follows weight magnitude, a spread-out subset of connections print their weight, and individual updates travel along a connection as a rainbow pulse while the number rolls to its new value. A second canvas draws the loss surface, fading it out before the network. Its moving dot carries a shared spectrum across the grid and headline, then fades into the input layer, setting off a layer-by-layer pass of weight updates. Both use one animation clock. The canvas for the network is pinned to the viewport (`.network-stage`); the `.matrix` box only marks where the network sits in the layout.

"See our work" pulls the camera into the network: the outer network zooms past while a second network of case-study cards grows into place, joined by the same weighted, updating connections. The cards are real buttons laid out by CSS (`.studies-grid`); the canvas reads their positions and draws the wiring beneath them, and both ride one zoom transform. Selecting a card opens its case study. Case-study content is placeholder data in `src/components/case-studies.ts`; the "Book a call" link is `BOOK_CALL_URL` in `src/components/landing.tsx` and is empty for now.

All animations respect the system's reduced-motion preference; canvases pause offscreen and in background tabs.

The Entrepreneurs First backing badge uses the user-provided artwork, stored locally in `public/ef-backing.png`.

## Pitch deck (`/deck`)

A 16-slide deck for enterprise meetings, light-themed for projectors, built from pictures more than text (`art.tsx` holds the logos, icons and illustrations). Arrow keys, space or a clicker move between slides, `F` goes full screen, and printing gives one slide per page. The text you are likely to change (the CRM's placeholder name, the cost example's inputs, the five case studies (Prorated and Bayvis are real names, the other three are placeholders) and cost and speed figures, the list of agent uses, the build-it-yourself table and the founders) is in `src/components/deck/content.ts`; the rest of the slides are in `slides.tsx`, and the styles in `src/app/deck/deck.css`. The cost and speed figures are estimates from public price lists, and each slide says so.
