"use client";

import { useEffect, useRef } from "react";

type Point = { x: number; y: number };

// A smooth loss surface with a hill and a basin, rather than a flat decorative grid.
function loss(x: number, z: number) {
  const basin = Math.exp(-((x - 0.9) ** 2 * 0.5 + (z - 0.3) ** 2 * 0.8));
  const hill = Math.exp(-((x + 1.6) ** 2 * 0.65 + (z + 0.7) ** 2 * 0.8));
  return 0.055 * (x * x + z * z) - 1.6 * basin + 0.9 * hill;
}

function descent() {
  const points: { x: number; z: number }[] = [];
  let x = 2.9;
  let z = -2.3;
  const step = 0.002;
  for (let index = 0; index < 150; index++) {
    points.push({ x, z });
    const dx = (loss(x + step, z) - loss(x - step, z)) / (2 * step);
    const dz = (loss(x, z + step) - loss(x, z - step)) / (2 * step);
    x -= dx * 0.065;
    z -= dz * 0.065;
  }
  return points;
}

export function LossLandscape() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const trajectory = descent();
    let width = 1;
    let height = 1;
    let paths: Path2D[] = [];
    let path: Point[] = [];
    let frame = 0;
    let previousTime = 0;
    let elapsed = 0;
    let lastPaint = 0;
    let inViewport = true;
    let disposed = false;

    const project = (x: number, z: number): Point => {
      const unit = Math.max(width * 0.116, height * 0.16);
      const rx = x * 0.97 + z * 0.243;
      const depth = -x * 0.243 + z * 0.97;
      const perspective = 10 / (10 + depth);
      return {
        x: width * 0.49 + rx * unit * perspective,
        y: height * 0.68 + (depth * 0.46 - loss(x, z) * 0.72) * unit * perspective,
      };
    };

    const render = (time: number) => {
      context.clearRect(0, 0, width, height);

      // A wide, quiet spectral wave moves across the wireframe.
      const sweep = ((time / 23) % 1) * 1.6 - 0.3;
      const gradient = context.createLinearGradient(0, height * 0.25, width, height * 0.85);
      const stops: [number, string][] = [
        [0, "rgba(178,198,231,0.035)"],
        [sweep - 0.18, "rgba(178,198,231,0.035)"],
        [sweep - 0.11, "rgba(255,145,179,0.09)"],
        [sweep - 0.04, "rgba(245,197,130,0.085)"],
        [sweep + 0.03, "rgba(139,232,215,0.09)"],
        [sweep + 0.1, "rgba(152,155,255,0.11)"],
        [sweep + 0.18, "rgba(178,198,231,0.035)"],
        [1, "rgba(178,198,231,0.035)"],
      ];
      stops.filter(([position]) => position >= 0 && position <= 1)
        .sort(([a], [b]) => a - b)
        .forEach(([position, color]) => gradient.addColorStop(position, color));
      context.strokeStyle = gradient;
      context.lineWidth = 0.75;
      for (const meshLine of paths) context.stroke(meshLine);

      // This trace is computed with gradient descent on the surface above.
      if (path.length < 2) return;
      context.strokeStyle = "rgba(178,180,245,0.06)";
      context.lineWidth = 1;
      context.beginPath();
      path.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
      context.stroke();

      if (motion.matches) return;
      const position = ((time / 14) % 1) * (path.length - 1);
      const head = Math.floor(position);
      const fraction = position - head;
      const a = path[head];
      const b = path[Math.min(head + 1, path.length - 1)];
      const point = { x: a.x + (b.x - a.x) * fraction, y: a.y + (b.y - a.y) * fraction };
      const hue = 180 + Math.sin(time * 0.3) * 100;

      for (let index = Math.max(1, head - 26); index <= head; index++) {
        const energy = 1 - (head - index) / 27;
        context.strokeStyle = `hsla(${hue + index * 3},100%,75%,${energy * 0.22})`;
        context.lineWidth = 1.15;
        context.beginPath();
        context.moveTo(path[index - 1].x, path[index - 1].y);
        context.lineTo(path[index].x, path[index].y);
        context.stroke();
      }

      const halo = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, 34);
      halo.addColorStop(0, `hsla(${hue},100%,70%,0.1)`);
      halo.addColorStop(1, `hsla(${hue + 70},100%,70%,0)`);
      context.fillStyle = halo;
      context.fillRect(point.x - 34, point.y - 34, 68, 68);
      context.fillStyle = `hsla(${hue},100%,83%,0.45)`;
      context.shadowColor = `hsla(${hue},100%,70%,0.4)`;
      context.shadowBlur = 8;
      context.beginPath();
      context.arc(point.x, point.y, 1.5, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const density = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * density);
      canvas.height = Math.round(height * density);
      context.setTransform(density, 0, 0, density, 0, 0);
      paths = [];
      const divisions = width < 700 ? 22 : 34;
      for (let direction = 0; direction < 2; direction++) {
        for (let line = 0; line <= divisions; line++) {
          const meshLine = new Path2D();
          const fixed = -5 + (line / divisions) * 10;
          for (let segment = 0; segment <= 85; segment++) {
            const variable = -5 + (segment / 85) * 10;
            const point = direction ? project(variable, fixed) : project(fixed, variable);
            if (segment === 0) meshLine.moveTo(point.x, point.y);
            else meshLine.lineTo(point.x, point.y);
          }
          paths.push(meshLine);
        }
      }
      path = trajectory.map(({ x, z }) => project(x, z));
      render(elapsed);
    };

    const tick = (timestamp: number) => {
      if (disposed) return;
      if (previousTime) elapsed += Math.min((timestamp - previousTime) / 1000, 0.05);
      previousTime = timestamp;
      // The background only needs 30fps; the foreground weights run independently.
      if (timestamp - lastPaint > 32) {
        render(elapsed);
        lastPaint = timestamp;
      }
      frame = window.requestAnimationFrame(tick);
    };

    const syncPlayback = () => {
      window.cancelAnimationFrame(frame);
      previousTime = 0;
      if (motion.matches) render(elapsed);
      else if (!document.hidden && inViewport && !disposed) frame = window.requestAnimationFrame(tick);
    };

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting;
      syncPlayback();
    });
    resizeObserver.observe(canvas);
    intersectionObserver.observe(canvas);
    motion.addEventListener("change", syncPlayback);
    document.addEventListener("visibilitychange", syncPlayback);
    resize();
    syncPlayback();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      motion.removeEventListener("change", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
    };
  }, []);

  return <div className="loss-landscape" aria-hidden="true"><canvas ref={canvasRef} /></div>;
}
