"use client";

import { useEffect, useRef } from "react";

type Weight = {
  x: number;
  y: number;
  z: number;
  value: number;
  mutation: { from: number; to: number; start: number; hue: number } | null;
};

type ProjectedWeight = {
  x: number;
  y: number;
  z: number;
  scale: number;
  opacity: number;
};

const MUTATION_DURATION = 2.25;
const TAU = Math.PI * 2;

function makeLattice(side: number) {
  const weights: Weight[] = [];
  const edges: [number, number][] = [];
  let seed = 3729;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let x = 0; x < side; x++) {
    for (let y = 0; y < side; y++) {
      for (let z = 0; z < side; z++) {
        const index = weights.length;
        weights.push({
          x: (x / (side - 1)) * 2 - 1,
          y: (y / (side - 1)) * 2 - 1,
          z: (z / (side - 1)) * 2 - 1,
          value: Math.round((random() * 3.6 - 1.8) * 10) / 10,
          mutation: null,
        });
        if (x > 0) edges.push([index - side * side, index]);
        if (y > 0) edges.push([index - side, index]);
        if (z > 0) edges.push([index - 1, index]);
      }
    }
  }

  return { weights, edges, random };
}

function formatWeight(value: number) {
  // Avoid a distracting negative zero during interpolation.
  return (Math.abs(value) < 0.05 ? 0 : value).toFixed(1);
}

export function WeightMatrix() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !context) return;

    let side = canvas.getBoundingClientRect().width < 480 ? 6 : 8;
    let { weights, edges, random } = makeLattice(side);
    let projected: ProjectedWeight[] = weights.map(() => ({ x: 0, y: 0, z: 0, scale: 1, opacity: 1 }));
    let order = weights.map((_, index) => index);
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;
    let width = 1;
    let height = 1;
    let frame = 0;
    let previousTime = 0;
    let elapsed = 0;
    let nextMutation = 0.25;
    let firstMutation = true;
    let inViewport = true;
    let disposed = false;

    const render = (time: number) => {
      const unit = Math.min(width * 0.258, height * 0.285);
      const yaw = -0.56 + time * 0.055;
      const pitch = -0.23 + Math.sin(time * 0.065) * 0.055;
      const roll = -0.085;
      const cy = Math.cos(yaw);
      const sy = Math.sin(yaw);
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      const cr = Math.cos(roll);
      const sr = Math.sin(roll);

      context.fillStyle = "#000";
      context.fillRect(0, 0, width, height);

      for (let index = 0; index < weights.length; index++) {
        const weight = weights[index];
        // A gentle twist across successive planes gives the tensor volume depth.
        const twist = weight.z * 0.14 + Math.sin(time * 0.08) * 0.045;
        const ct = Math.cos(twist);
        const st = Math.sin(twist);
        const wx = weight.x * ct - weight.y * st;
        const wy = weight.x * st + weight.y * ct;
        const rx = wx * cy + weight.z * sy;
        const rz = -wx * sy + weight.z * cy;
        const ry = wy * cp - rz * sp;
        const depth = wy * sp + rz * cp;
        const perspective = 4.8 / (4.8 - depth);

        projected[index] = {
          x: width * 0.5 + (rx * cr - ry * sr) * unit * perspective,
          y: height * 0.51 + (rx * sr + ry * cr) * unit * perspective,
          z: depth,
          scale: perspective,
          opacity: Math.max(0.25, Math.min(1, 0.62 + depth * 0.27)),
        };

        if (weight.mutation && time - weight.mutation.start >= MUTATION_DURATION) {
          weight.value = weight.mutation.to;
          weight.mutation = null;
        }
      }

      if (!reducedMotion && time >= nextMutation) {
        // Pick visible weights so mutations remain readable as the volume turns.
        const candidates = order.filter((index) => projected[index].z > 0.1 && !weights[index].mutation);
        const index = candidates[Math.floor(random() * candidates.length)];
        if (index !== undefined) {
          const weight = weights[index];
          if (firstMutation) weight.value = -1.2;
          let target = firstMutation ? 3 : Math.round((random() * 5.6 - 2.4) * 10) / 10;
          if (Math.abs(target - weight.value) < 0.5) target += 1.1;
          weight.mutation = { from: weight.value, to: target, start: time, hue: random() * 360 };
          firstMutation = false;
        }
        nextMutation = time + 0.38 + random() * 0.42;
      }

      // Keep the connective web quiet, with only the active synapses in color.
      context.lineWidth = 0.65;
      for (const [a, b] of edges) {
        const start = projected[a];
        const end = projected[b];
        context.strokeStyle = `rgba(205,221,248,${(start.opacity + end.opacity) * 0.065})`;
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.stroke();

        const mutation = weights[a].mutation || weights[b].mutation;
        if (!mutation) continue;
        const age = time - mutation.start;
        const energy = Math.sin(Math.min(1, age / MUTATION_DURATION) * Math.PI);
        const hue = (mutation.hue + age * 170) % 360;
        const gradient = context.createLinearGradient(start.x, start.y, end.x, end.y);
        gradient.addColorStop(0, `hsla(${hue},100%,68%,${energy})`);
        gradient.addColorStop(0.5, `hsla(${hue + 100},100%,75%,${energy * 0.85})`);
        gradient.addColorStop(1, `hsla(${hue + 220},100%,70%,${energy * 0.35})`);
        context.strokeStyle = gradient;
        context.lineWidth = 1.1;
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.stroke();
        context.lineWidth = 0.65;
      }

      // Paint from back to front; each number occupies a point in the volume.
      order.sort((a, b) => projected[a].z - projected[b].z);
      context.textAlign = "center";
      context.textBaseline = "middle";

      for (const index of order) {
        const weight = weights[index];
        const point = projected[index];
        const fontSize = Math.max(7.5, Math.min(13.5, unit * 0.059)) * point.scale;
        context.font = `400 ${fontSize.toFixed(2)}px "IBM Plex Mono", monospace`;
        const mutation = weight.mutation;
        const boxWidth = fontSize * 2.65;

        context.fillStyle = "#000";
        context.fillRect(point.x - boxWidth / 2, point.y - fontSize * 0.57, boxWidth, fontSize * 1.14);

        if (mutation) {
          const age = time - mutation.start;
          const progress = Math.min(1, Math.max(0, (age - 0.12) / 0.95));
          const eased = 1 - Math.pow(1 - progress, 3);
          const energy = Math.sin((age / MUTATION_DURATION) * Math.PI);
          const hue = (mutation.hue + age * 170) % 360;
          const radius = fontSize * (1.7 + energy * 1.5);

          const glow = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
          glow.addColorStop(0, `hsla(${hue},100%,68%,${energy * 0.36})`);
          glow.addColorStop(0.5, `hsla(${hue + 90},100%,60%,${energy * 0.13})`);
          glow.addColorStop(1, `hsla(${hue + 180},100%,60%,0)`);
          context.fillStyle = glow;
          context.fillRect(point.x - radius, point.y - radius, radius * 2, radius * 2);

          // The value rolls through its intermediate weights before settling.
          const value = mutation.from + (mutation.to - mutation.from) * eased;
          const rainbow = context.createLinearGradient(point.x - boxWidth / 2, point.y - 5, point.x + boxWidth / 2, point.y + 5);
          for (let stop = 0; stop <= 4; stop++) {
            rainbow.addColorStop(stop / 4, `hsl(${hue + stop * 75},100%,${76 + (1 - energy) * 20}%)`);
          }
          context.fillStyle = rainbow;
          context.shadowColor = `hsla(${hue + 65},100%,70%,${energy})`;
          context.shadowBlur = 12 * energy;
          context.fillText(formatWeight(value), point.x, point.y - Math.sin(progress * Math.PI) * 2);
          context.shadowBlur = 0;

          // A fine spectral ripple marks the moment the new weight takes hold.
          if (age > 0.65 && age < 1.65) {
            const ripple = (age - 0.65) / 1;
            context.strokeStyle = `hsla(${hue + 150},100%,76%,${(1 - ripple) * 0.38})`;
            context.lineWidth = 0.7;
            context.beginPath();
            context.ellipse(point.x, point.y, fontSize * (1.8 + ripple * 2), fontSize * (0.8 + ripple * 1.5), -0.3, 0, TAU);
            context.stroke();
          }
        } else {
          context.fillStyle = `rgba(239,246,255,${point.opacity})`;
          context.fillText(formatWeight(weight.value), point.x, point.y);
        }
      }
    };

    const tick = (timestamp: number) => {
      if (disposed) return;
      if (previousTime) elapsed += Math.min((timestamp - previousTime) / 1000, 0.05);
      previousTime = timestamp;
      render(elapsed);
      frame = window.requestAnimationFrame(tick);
    };

    const syncPlayback = () => {
      window.cancelAnimationFrame(frame);
      previousTime = 0;
      if (reducedMotion) {
        for (const weight of weights) weight.mutation = null;
        render(elapsed);
      } else if (!document.hidden && inViewport && !disposed) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const nextSide = width < 480 ? 6 : 8;
      if (nextSide !== side) {
        side = nextSide;
        ({ weights, edges, random } = makeLattice(side));
        projected = weights.map(() => ({ x: 0, y: 0, z: 0, scale: 1, opacity: 1 }));
        order = weights.map((_, index) => index);
      }
      const density = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * density);
      canvas.height = Math.round(height * density);
      context.setTransform(density, 0, 0, density, 0, 0);
      render(elapsed);
    };

    const onMotionChange = () => {
      reducedMotion = motionQuery.matches;
      syncPlayback();
    };

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting;
      syncPlayback();
    });
    resizeObserver.observe(canvas);
    intersectionObserver.observe(canvas);
    motionQuery.addEventListener("change", onMotionChange);
    document.addEventListener("visibilitychange", syncPlayback);
    resize();
    syncPlayback();
    // Redraw once the locally hosted numerical font is available.
    void document.fonts.ready.then(() => { if (!disposed) render(elapsed); });

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      motionQuery.removeEventListener("change", onMotionChange);
      document.removeEventListener("visibilitychange", syncPlayback);
    };
  }, []);

  return (
    <div className="matrix" role="img" aria-label="A slowly rotating three-dimensional lattice of numerical weights, with individual values changing in fluorescent rainbow light.">
      <canvas ref={canvasRef} aria-hidden="true" />
      <span className="sr-only">Hundreds of connected numerical weights form a three-dimensional matrix.</span>
    </div>
  );
}
