"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildSlides } from "./slides";

// The pitch deck: one slide on screen at a time, sized to fill the window at 16:9.
// Arrow keys, space, Page Up/Down (what presentation clickers send) and the two
// buttons move between slides; F toggles full screen. The address keeps the slide
// number (#4) so a reload or a shared link lands on the same slide.

export function Deck({ calendlyUrl, initial = 0 }: { calendlyUrl: string; initial?: number }) {
  const slides = useMemo(() => buildSlides(calendlyUrl), [calendlyUrl]);
  const last = slides.length - 1;
  const [index, setIndex] = useState(Math.max(0, Math.min(last, initial)));
  const rootRef = useRef<HTMLDivElement>(null);
  // The address is only rewritten after the presenter has moved, never on load.
  const moved = useRef(false);

  const go = useCallback((to: number) => setIndex(Math.max(0, Math.min(last, to))), [last]);
  const step = useCallback((by: number) => {
    moved.current = true;
    setIndex((current) => Math.max(0, Math.min(last, current + by)));
  }, [last]);

  useEffect(() => {
    const fromHash = () => {
      const wanted = Number.parseInt(window.location.hash.slice(1), 10);
      if (Number.isFinite(wanted)) go(wanted - 1);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [go]);

  useEffect(() => {
    if (!moved.current) return;
    window.history.replaceState(null, "", `#${index + 1}`);
  }, [index]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key;
      if (key === "ArrowRight" || key === "ArrowDown" || key === "PageDown" || key === " " || key === "Enter") {
        // Leave space and enter alone when a link or button has focus.
        if ((key === " " || key === "Enter") && event.target instanceof HTMLElement && event.target.closest("a, button")) return;
        event.preventDefault();
        step(1);
      } else if (key === "ArrowLeft" || key === "ArrowUp" || key === "PageUp" || key === "Backspace") {
        event.preventDefault();
        step(-1);
      } else if (key === "Home") {
        step(-last);
      } else if (key === "End") {
        step(last);
      } else if (key === "f" || key === "F") {
        if (document.fullscreenElement) void document.exitFullscreen();
        else void rootRef.current?.requestFullscreen?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [last, step]);

  return (
    <main ref={rootRef} className="deck">
      <div className="deck-stage">
        {slides.map((slide, position) => (
          <section
            key={slide.id}
            className="deck-slide"
            data-slide={slide.id}
            data-active={position === index ? "" : undefined}
            aria-label={slide.title}
            aria-hidden={position !== index}
            inert={position !== index}
          >
            {slide.body}
          </section>
        ))}
        <div className="deck-footer">
          <span className="deck-footer-brand">Adaptral</span>
          <span className="deck-progress" aria-hidden="true"><i style={{ transform: `scaleX(${(index + 1) / slides.length})` }} /></span>
          <span className="deck-count">{index + 1} / {slides.length}</span>
          <button type="button" onClick={() => step(-1)} disabled={index === 0} aria-label="Previous slide">‹</button>
          <button type="button" onClick={() => step(1)} disabled={index === last} aria-label="Next slide">›</button>
        </div>
      </div>
    </main>
  );
}
