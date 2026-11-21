"use client";

import { useEffect, useRef } from "react";
import { BEAT_STARTS, MODEL_LOGOS, beatAt, beatProgress, drawWorkflow } from "./workflow-scene";

const BEATS = [
  { title: "Today", body: "Every call your app makes goes to one frontier model." },
  { title: "Audit", body: "Our agents study your traffic and find the narrow, repeated tasks inside it." },
  { title: "Split", body: "Each task moves to a small model fine-tuned for you. Only the hard calls stay." },
  { title: "Improve", body: "We run the data, the evals and the retraining, continuously." },
];

// Where a paused (reduced motion) scene rests: split done, improvement under way.
const STILL_FRAME = 16.6;

export function WorkflowSplit() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beatRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const seekRef = useRef<((beat: number) => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let elapsed = motion.matches ? STILL_FRAME : 0;
    let previous = 0;
    let frame = 0;
    let inViewport = false;
    let disposed = false;
    let shownBeat = -1;

    const logos: (HTMLImageElement | null)[] = MODEL_LOGOS.map(() => null);

    const render = () => {
      drawWorkflow(context, width, height, elapsed, logos);
      const beat = beatAt(elapsed);
      if (beat !== shownBeat) {
        shownBeat = beat;
        beatRefs.current.forEach((element, index) => element?.toggleAttribute("data-active", index === beat));
      }
      // Each caption's top line fills as its beat plays, so the sequence reads as moving on its own.
      beatProgress(elapsed).forEach((value, index) => beatRefs.current[index]?.style.setProperty("--progress", value.toFixed(3)));
    };

    const tick = (timestamp: number) => {
      if (disposed) return;
      if (previous) elapsed += Math.min((timestamp - previous) / 1000, 0.05);
      previous = timestamp;
      render();
      frame = window.requestAnimationFrame(tick);
    };

    const syncPlayback = () => {
      window.cancelAnimationFrame(frame);
      previous = 0;
      if (motion.matches) render();
      else if (!document.hidden && inViewport && !disposed) frame = window.requestAnimationFrame(tick);
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const density = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * density);
      canvas.height = Math.round(height * density);
      context.setTransform(density, 0, 0, density, 0, 0);
      render();
    };

    // Jump to a beat; a little past its start so the change is already visible.
    seekRef.current = (beat) => {
      elapsed = BEAT_STARTS[beat] + (motion.matches ? 3.6 : 0.4);
      render();
    };

    // Use a model's real logo when its file exists in /public/models: SVG first, then PNG.
    MODEL_LOGOS.forEach((name, index) => {
      const attempt = (extensions: string[]) => {
        const [extension, ...rest] = extensions;
        if (!extension) return;
        const image = new Image();
        image.onload = () => {
          if (disposed) return;
          logos[index] = image;
          render();
        };
        image.onerror = () => attempt(rest);
        image.src = `/models/${name}.${extension}`;
      };
      attempt(["svg", "png"]);
    });

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting;
      syncPlayback();
    }, { threshold: 0.25 });
    resizeObserver.observe(canvas);
    intersectionObserver.observe(canvas);
    motion.addEventListener("change", syncPlayback);
    document.addEventListener("visibilitychange", syncPlayback);
    resize();
    syncPlayback();
    void document.fonts.ready.then(() => { if (!disposed) resize(); });

    return () => {
      disposed = true;
      seekRef.current = null;
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      motion.removeEventListener("change", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
    };
  }, []);

  return (
    <section className="workflow" aria-labelledby="workflow-title">
      <p className="workflow-eyebrow">How it works</p>
      <h2 id="workflow-title">Not every workflow in your app<br />needs a frontier LLM.</h2>
      <p className="workflow-lede">Most of your calls are narrow, repeated tasks. Our agents find them and move each one to a small model tuned for it.</p>
      <div
        className="workflow-stage"
        role="img"
        aria-label="Calls from your app flow along a beam of light to a single frontier model. Adaptral agents audit the stream, find the high-volume narrow tasks and split the traffic, so each task goes to its own small fine-tuned open-source model that keeps improving through a loop of data, evals and retraining, while cost and latency fall from red to green."
      >
        <canvas ref={canvasRef} />
      </div>
      <ol className="workflow-beats">
        {BEATS.map((beat, index) => (
          <li key={beat.title}>
            <button ref={(element) => { beatRefs.current[index] = element; }} type="button" onClick={() => seekRef.current?.(index)}>
              <span className="workflow-beat-index">0{index + 1}</span>
              <span className="workflow-beat-title">{beat.title}</span>
              <span className="workflow-beat-body">{beat.body}</span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
