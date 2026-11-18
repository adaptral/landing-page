"use client";

import { useEffect, useRef } from "react";
import { matrixGeometry } from "./matrix-geometry";

type Point = { x: number; y: number };

const SPECTRUM = [
  { offset: -0.18, rgb: [178, 198, 231], alpha: 0.085, tint: 0 },
  { offset: -0.11, rgb: [255, 145, 179], alpha: 0.25, tint: 0.36 },
  { offset: -0.04, rgb: [245, 197, 130], alpha: 0.23, tint: 0.36 },
  { offset: 0.03, rgb: [139, 232, 215], alpha: 0.25, tint: 0.36 },
  { offset: 0.1, rgb: [152, 155, 255], alpha: 0.28, tint: 0.36 },
  { offset: 0.18, rgb: [178, 198, 231], alpha: 0.085, tint: 0 },
];

function smoothstep(start: number, end: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
}

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
    const root = canvas.closest<HTMLElement>(".landing");
    const headline = root?.querySelector<HTMLElement>("h1");
    const matrix = root?.querySelector<HTMLElement>(".matrix");

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const trajectory = descent();
    let width = 1;
    let height = 1;
    let paths: Path2D[] = [];
    let path: Point[] = [];
    let sweepPath: Point[] = [];
    let headlineX = 0;
    let gridLimit = 0;
    let gridAxis: "x" | "y" = "x";
    let frame = 0;
    let previousTime = 0;
    let elapsed = 0;
    let lastPaint = 0;
    let inViewport = true;
    let disposed = false;

    const project = (x: number, z: number): Point => {
      const mobile = width < 700;
      const unit = mobile ? width * 0.21 : Math.max(width * 0.116, height * 0.16);
      const rx = x * 0.97 + z * 0.243;
      const depth = -x * 0.243 + z * 0.97;
      const perspective = 10 / (10 + depth);
      return {
        x: width * (mobile ? 0.16 : 0.28) + rx * unit * perspective,
        y: height * (mobile ? 0.43 : 0.65) + (depth * 0.46 - loss(x, z) * 0.72) * unit * perspective,
      };
    };

    const render = (time: number) => {
      context.clearRect(0, 0, width, height);
      if (sweepPath.length < 2) return;

      const cycle = (time / 18) % 1;
      const travel = Math.min(1, cycle / 0.86);
      const strength = motion.matches ? 0 : 1 - smoothstep(0.88, 1, travel);
      const position = travel * (sweepPath.length - 1);
      const head = Math.floor(position);
      const fraction = position - head;
      const a = sweepPath[head];
      const b = sweepPath[Math.min(head + 1, sweepPath.length - 1)];
      const point = { x: a.x + (b.x - a.x) * fraction, y: a.y + (b.y - a.y) * fraction };

      // The broad wave and its surface-hugging beam both travel left to right.
      const sweep = point.x / width;
      const gradient = context.createLinearGradient(0, 0, width, 0);
      const stops: [number, string][] = [
        [0, "rgba(178,198,231,0.085)"],
        ...SPECTRUM.map(({ offset, rgb, alpha }): [number, string] => [
          sweep + offset,
          `rgba(${rgb.join(",")},${0.085 + (alpha - 0.085) * strength})`,
        ]),
        [1, "rgba(178,198,231,0.085)"],
      ];
      stops.filter(([position]) => position >= 0 && position <= 1)
        .sort(([a], [b]) => a - b)
        .forEach(([position, color]) => gradient.addColorStop(position, color));
      context.strokeStyle = gradient;
      context.lineWidth = 0.85;
      for (const meshLine of paths) context.stroke(meshLine);

      // This trace is computed with gradient descent on the surface above.
      if (path.length < 2) return;
      context.strokeStyle = "rgba(178,180,245,0.09)";
      context.lineWidth = 1;
      context.beginPath();
      path.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
      context.stroke();

      // End the landscape before the rotating volume, leaving the dot free to enter it.
      const fade = gridAxis === "x"
        ? context.createLinearGradient(Math.max(0, gridLimit - 65), 0, gridLimit, 0)
        : context.createLinearGradient(0, Math.max(0, gridLimit - 45), 0, gridLimit);
      fade.addColorStop(0, "#fff");
      fade.addColorStop(1, "rgba(255,255,255,0)");
      context.globalCompositeOperation = "destination-in";
      context.fillStyle = fade;
      context.fillRect(0, 0, width, height);
      context.globalCompositeOperation = "source-over";

      // One moving light supplies the exact same positions and hues to the text.
      if (headline) {
        const white = [245, 248, 255];
        const colors = SPECTRUM.map(({ offset, rgb, tint }) => {
          const color = white.map((base, channel) => Math.round(base + (rgb[channel] - base) * tint * strength));
          return `rgb(${color.join(",")}) ${(point.x - headlineX + offset * width).toFixed(1)}px`;
        });
        headline.style.backgroundImage = `linear-gradient(90deg,${colors.join(",")})`;
      }

      if (motion.matches || strength <= 0) return;
      const hue = 180;
      context.globalAlpha = strength;

      for (let index = Math.max(1, head - 26); index <= head; index++) {
        const energy = 1 - (head - index) / 27;
        context.strokeStyle = `hsla(${hue + index * 3},100%,75%,${energy * 0.32})`;
        context.lineWidth = 1.25;
        context.beginPath();
        context.moveTo(sweepPath[index - 1].x, sweepPath[index - 1].y);
        context.lineTo(sweepPath[index].x, sweepPath[index].y);
        context.stroke();
      }

      const halo = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, 42);
      halo.addColorStop(0, `hsla(${hue},100%,70%,0.14)`);
      halo.addColorStop(1, `hsla(${hue + 70},100%,70%,0)`);
      context.fillStyle = halo;
      context.fillRect(point.x - 42, point.y - 42, 84, 84);
      context.fillStyle = `hsla(${hue},100%,83%,0.65)`;
      context.shadowColor = `hsla(${hue},100%,70%,0.4)`;
      context.shadowBlur = 12;
      context.beginPath();
      context.arc(point.x, point.y, 1.5, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;
      context.globalAlpha = 1;
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const mobile = width < 700;
      const matrixBounds = matrix?.getBoundingClientRect();
      const headlineBounds = headline?.getBoundingClientRect();
      headlineX = (headlineBounds?.left ?? bounds.left) - bounds.left;
      const geometry = matrixGeometry(matrixBounds?.width ?? width * 0.56, matrixBounds?.height ?? height * 0.88);
      const matrixX = (matrixBounds?.left ?? width * 0.44) - bounds.left;
      const matrixY = (matrixBounds?.top ?? height * 0.55) - bounds.top;
      gridAxis = mobile ? "y" : "x";
      gridLimit = mobile
        ? matrixY + geometry.centerY - geometry.radius - 22
        : matrixX + geometry.centerX - geometry.radius - 24;
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
      const arrival = {
        x: matrixX + geometry.centerX + geometry.unit * (mobile ? 0.7 : -0.75),
        y: matrixY + geometry.centerY - geometry.unit * 0.1,
      };
      const surfaceEndX = mobile ? width * 0.51 : arrival.x;
      const surfacePath = Array.from({ length: 240 }, (_, index) => {
        const x = -5.5 + (index / 239) * 12.5;
        const z = 0.1 + Math.sin((x - 0.9) * 0.5) * 0.5;
        return project(x, z);
      });
      sweepPath = [];
      for (let index = 1; index < surfacePath.length; index++) {
        const a = surfacePath[index - 1];
        const b = surfacePath[index];
        const atX = (x: number) => ({ x, y: a.y + (b.y - a.y) * ((x - a.x) / (b.x - a.x)) });
        if (a.x <= -24 && b.x > -24) sweepPath.push(atX(-24));
        if (b.x > -24 && b.x < surfaceEndX) sweepPath.push(b);
        if (a.x <= surfaceEndX && b.x >= surfaceEndX) {
          sweepPath.push(atX(surfaceEndX));
          break;
        }
      }
      if (mobile && sweepPath.length) {
        const from = sweepPath[sweepPath.length - 1];
        for (let index = 1; index <= 35; index++) {
          const t = index / 35;
          const u = 1 - t;
          sweepPath.push({
            x: u ** 3 * from.x + 3 * u * u * t * (from.x + 25) + 3 * u * t * t * (arrival.x - 20) + t ** 3 * arrival.x,
            y: u ** 3 * from.y + 3 * u * u * t * (from.y + 30) + 3 * u * t * t * (arrival.y - 65) + t ** 3 * arrival.y,
          });
        }
      }
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
    if (headline) resizeObserver.observe(headline);
    if (matrix) resizeObserver.observe(matrix);
    intersectionObserver.observe(canvas);
    motion.addEventListener("change", syncPlayback);
    document.addEventListener("visibilitychange", syncPlayback);
    resize();
    syncPlayback();
    void document.fonts.ready.then(() => { if (!disposed) resize(); });

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      motion.removeEventListener("change", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
      headline?.style.removeProperty("background-image");
    };
  }, []);

  return <div className="loss-landscape" aria-hidden="true"><canvas ref={canvasRef} /></div>;
}
