// The "one frontier beam splits into small models" scene. Everything here is a
// pure function of time, so any moment can be painted on its own (reduced
// motion, jumping between beats, offline renders).

export const LOOP = 20;
// Today → Audit → Split → Improve.
export const BEAT_STARTS = [0, 4, 8, 12] as const;

function wrap(time: number) {
  return ((time % LOOP) + LOOP) % LOOP;
}

export function beatAt(time: number) {
  const u = wrap(time);
  return u < BEAT_STARTS[1] ? 0 : u < BEAT_STARTS[2] ? 1 : u < BEAT_STARTS[3] ? 2 : 3;
}

// How far through each beat the loop is, 0 to 1: finished beats stay full.
export function beatProgress(time: number) {
  const u = wrap(time);
  return BEAT_STARTS.map((start, index) => {
    const end = index < 3 ? BEAT_STARTS[index + 1] : LOOP;
    return Math.max(0, Math.min(1, (u - start) / (end - start)));
  });
}

type RGB = readonly [number, number, number];
type Point = { x: number; y: number };

// Example tasks, each moved to a small open-source model fine-tuned for it.
const TASKS: { name: string; model: string; mark: string; logo: string; rgb: RGB }[] = [
  { name: "Summarise", model: "Qwen3 0.6B", mark: "Q", logo: "qwen", rgb: [255, 122, 184] },
  { name: "Classify", model: "ModernBERT", mark: "M", logo: "modernbert", rgb: [104, 240, 200] },
  { name: "Extract", model: "Gemma 3 270M", mark: "G", logo: "gemma", rgb: [142, 152, 255] },
];
// Each model's logo is read from /public/models/<name>.svg (or .png); until a
// file is there, its node shows a letter instead.
export const MODEL_LOGOS = TASKS.map((task) => task.logo);
const EMBER: RGB = [255, 160, 52];
const PLAIN: RGB = [226, 236, 255];
const WHITE: RGB = [255, 255, 255];
const RED: RGB = [255, 45, 85];
const YELLOW: RGB = [255, 226, 50];
const GREEN: RGB = [57, 255, 136];
// The beam's colours: deep blue through violet, pink, gold and teal.
const BRIDGE: RGB[] = [[66, 92, 255], [150, 82, 255], [255, 92, 204], [255, 196, 112], [84, 232, 212], [66, 92, 255]];
const STAGES = ["data", "evals", "retrain"];
const STATUS = [
  { from: 4.6, text: "Finding high-volume, narrow tasks" },
  { from: 8.3, text: "Splitting traffic" },
  { from: 12.2, text: "Improving models, continuously" },
];
const FONT = '"IBM Plex Mono", monospace';

const DOT_INTERVAL = 0.17;
const TO_HUB = 1.1;
const TO_MODEL = 1.5;
const COLOUR_FROM = 4.7;
const ROUTE_FROM = 8.9;
const IMPROVE_CYCLE = 2.2;

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const rgba = (c: RGB, a: number) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${clamp(a).toFixed(3)})`;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mix = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const fract = (value: number) => value - Math.floor(value);

function smoothstep(start: number, end: number, value: number) {
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
}

function hash(index: number) {
  let x = Math.imul(Math.floor(index) + 1, 2654435761);
  x ^= x >>> 15;
  x = Math.imul(x, 2246822519);
  x ^= x >>> 13;
  return (x >>> 0) / 4294967296;
}

function bridgeColour(position: number): RGB {
  const scaled = fract(position) * (BRIDGE.length - 1);
  const index = Math.floor(scaled);
  return mix(BRIDGE[index], BRIDGE[index + 1], scaled - index);
}

function curve(a: Point, b: Point, t: number): Point {
  const mid = a.x + (b.x - a.x) * 0.5;
  const u = 1 - t;
  return {
    x: u ** 3 * a.x + 3 * u * u * t * mid + 3 * u * t * t * mid + t ** 3 * b.x,
    y: u ** 3 * a.y + 3 * u * u * t * a.y + 3 * u * t * t * b.y + t ** 3 * b.y,
  };
}

// A point on the curve with the unit tangent there.
function along(a: Point, b: Point, t: number) {
  const point = curve(a, b, t);
  const before = curve(a, b, Math.max(0, t - 0.01));
  const after = curve(a, b, Math.min(1, t + 0.01));
  const length = Math.hypot(after.x - before.x, after.y - before.y) || 1;
  return { ...point, tx: (after.x - before.x) / length, ty: (after.y - before.y) / length };
}

export function drawWorkflow(context: CanvasRenderingContext2D, width: number, height: number, time: number, logos: (CanvasImageSource | null)[] = []) {
  const u = wrap(time);
  const compact = width < 620;
  const fade = smoothstep(0, 0.6, u) * (1 - smoothstep(LOOP - 0.7, LOOP, u));
  const audit = smoothstep(4, 5.2, u);
  const split = smoothstep(8, 10.6, u);
  const branches = smoothstep(8, ROUTE_FROM, u);
  const improve = smoothstep(12, 13, u);
  const matured = smoothstep(12, 18, u);

  const small = compact ? 9.5 : 11;
  const midY = height * 0.44;
  const app = { x: width * (compact ? 0.12 : 0.1), y: midY };
  const hub = { x: width * (compact ? 0.4 : 0.38), y: midY };
  const targetX = width * (compact ? 0.68 : 0.7);
  const bigRadius = Math.min(width * 0.1, height * 0.19);
  const frontier = { x: targetX, y: lerp(midY, height * 0.15, split) };
  const frontierRadius = lerp(bigRadius, bigRadius * 0.48, split);
  const modelRadius = Math.max(8, bigRadius * 0.19);
  const models = TASKS.map((task, index) => ({
    ...task,
    x: targetX,
    y: height * (0.44 + index * 0.2),
    shown: smoothstep(8.2 + index * 0.35, 9.4 + index * 0.35, u),
  }));
  const appWidth = compact ? 58 : 96;
  const appHeight = compact ? 38 : 54;
  const appEdge = { x: app.x + appWidth / 2, y: app.y };
  const trunk = compact ? 15 : 24;

  context.clearRect(0, 0, width, height);
  context.save();
  context.globalAlpha = fade;
  context.textBaseline = "middle";

  // A beam of light: a rainbow band, shifting along its length, full of sparkle.
  const beam = (a: Point, b: Point, weight: number, opacity: number, seed: number, tint: RGB | null, sparkles: number) => {
    if (opacity <= 0.01) return;
    const mid = a.x + (b.x - a.x) * 0.5;
    const gradient = context.createLinearGradient(a.x, a.y, b.x, b.y);
    for (let stop = 0; stop <= 10; stop++) {
      const at = stop / 10;
      const colour = bridgeColour(at * 1.3 - u * 0.11 + seed * 0.37);
      gradient.addColorStop(at, rgba(tint ? mix(colour, tint, 0.25 + at * 0.75) : colour, 1));
    }
    context.globalCompositeOperation = "lighter";
    context.lineCap = "butt";
    context.strokeStyle = gradient;
    for (const [scale, alpha] of [[1, 0.2], [0.62, 0.26], [0.14, 0.5]] as const) {
      context.beginPath();
      context.moveTo(a.x, a.y);
      context.bezierCurveTo(mid, a.y, mid, b.y, b.x, b.y);
      context.globalAlpha = fade * opacity * alpha;
      context.lineWidth = Math.max(1.2, weight * scale);
      context.stroke();
    }
    // Streaks racing along the band, like light catching its tiles.
    context.lineCap = "round";
    const streaks = Math.round(sparkles / 3);
    for (let index = 0; index < streaks; index++) {
      const key = seed * 1000 + index;
      const at = fract(hash(key) + u * (0.1 + hash(key + 31) * 0.14));
      const spot = along(a, b, at);
      const lateral = (hash(key + 71) - 0.5) * weight * 0.86;
      const reach = 4 + hash(key + 13) * 9;
      const x = spot.x - spot.ty * lateral;
      const y = spot.y + spot.tx * lateral;
      const colour = bridgeColour(hash(key + 5) + at);
      context.beginPath();
      context.moveTo(x - spot.tx * reach, y - spot.ty * reach);
      context.lineTo(x, y);
      context.globalAlpha = fade * opacity * 0.6 * Math.sin(Math.PI * at);
      context.strokeStyle = rgba(tint ? mix(colour, tint, 0.6) : colour, 1);
      context.lineWidth = 1;
      context.stroke();
    }
    for (let index = 0; index < sparkles; index++) {
      const key = seed * 2000 + index;
      const at = fract(hash(key) + u * (0.02 + hash(key + 31) * 0.05));
      const spot = along(a, b, at);
      const lateral = (hash(key + 71) - 0.5) * weight * 0.95;
      const twinkle = Math.max(0, Math.sin(u * (2 + hash(key + 5) * 5) + index)) ** 2;
      const size = 0.8 + hash(key + 9) * 1.2;
      context.globalAlpha = fade * opacity * twinkle;
      context.fillStyle = index % 3 === 0 ? "#fff" : rgba(bridgeColour(hash(key + 3) + at), 1);
      context.fillRect(spot.x - spot.ty * lateral - size / 2, spot.y + spot.tx * lateral - size / 2, size, size);
    }
    context.globalCompositeOperation = "source-over";
    context.globalAlpha = fade;
  };

  const frontierEdge = { x: frontier.x - frontierRadius * 0.55, y: frontier.y };
  beam(appEdge, hub, trunk, 1, 1, null, compact ? 34 : 70);
  beam(hub, frontierEdge, lerp(trunk, trunk * 0.3, split), lerp(1, 0.75, split), 2, null, Math.round(lerp(compact ? 34 : 70, 14, split)));
  models.forEach((model, index) => beam(hub, { x: model.x - modelRadius, y: model.y }, trunk * 0.36, branches, 3 + index, model.rgb, compact ? 12 : 22));

  // The calls themselves.
  const first = Math.max(0, Math.floor((u - TO_HUB - TO_MODEL) / DOT_INTERVAL));
  const last = Math.floor(u / DOT_INTERVAL);
  for (let index = first; index <= last; index++) {
    const age = u - index * DOT_INTERVAL;
    if (age < 0 || age > TO_HUB + TO_MODEL) continue;
    const reachesHub = index * DOT_INTERVAL + TO_HUB;
    const kind = Math.floor(hash(index) * 7);
    const hard = kind === 0;
    const task = (kind + 2) % 3;
    const lane = (hash(index + 977) - 0.5) * trunk * 0.62;
    let point: Point;
    let colour: RGB = WHITE;
    let opacity = 1;
    if (age < TO_HUB) {
      const t = age / TO_HUB;
      point = { x: lerp(appEdge.x, hub.x, t), y: appEdge.y + lane * Math.sin(Math.PI * Math.min(1, t * 1.15)) * (1 - t * 0.6) };
      opacity = smoothstep(0, 0.12, t);
    } else {
      const t = (age - TO_HUB) / TO_MODEL;
      const routed = !hard && reachesHub >= ROUTE_FROM;
      const end = routed
        ? { x: models[task].x - modelRadius, y: models[task].y }
        : { x: frontierEdge.x, y: frontier.y + lane * (1 - split) * 0.6 };
      point = curve(hub, end, t);
      if (reachesHub >= COLOUR_FROM) colour = hard ? EMBER : TASKS[task].rgb;
      opacity = 1 - smoothstep(0.86, 1, t);
    }
    context.beginPath();
    context.arc(point.x, point.y, compact ? 2.3 : 3, 0, Math.PI * 2);
    context.shadowColor = rgba(colour, 1);
    context.shadowBlur = 12;
    context.fillStyle = rgba(mix(colour, WHITE, 0.25), opacity);
    context.fill();
  }
  context.shadowBlur = 0;

  // The customer's application.
  context.beginPath();
  context.roundRect(app.x - appWidth / 2, app.y - appHeight / 2, appWidth, appHeight, 11);
  context.fillStyle = "#07090e";
  context.fill();
  context.strokeStyle = rgba(PLAIN, 0.5);
  context.lineWidth = 1;
  context.stroke();
  context.font = `${small}px ${FONT}`;
  context.textAlign = "center";
  context.fillStyle = rgba(PLAIN, 0.94);
  context.fillText("Your app", app.x, app.y + 0.5);

  // The audit: Adaptral sits on the line, sorting calls by task and saying what it is doing.
  if (audit <= 0.01) {
    context.beginPath();
    context.arc(hub.x, hub.y, 3, 0, Math.PI * 2);
    context.fillStyle = rgba(PLAIN, 0.6);
    context.fill();
  } else {
    const badge = (compact ? 13 : 17) * (0.6 + audit * 0.4);
    const orbit = compact ? 25 : 35;
    const scan = ((u - 4) % 1.8) / 1.8;
    context.beginPath();
    context.arc(hub.x, hub.y, badge + scan * (orbit - badge) * 1.1, 0, Math.PI * 2);
    context.strokeStyle = rgba(PLAIN, audit * (1 - scan) * 0.55);
    context.lineWidth = 1;
    context.stroke();
    for (let agent = 0; agent < 3; agent++) {
      const angle = u * 0.6 + (agent * Math.PI * 2) / 3 - Math.PI / 2;
      context.beginPath();
      context.arc(hub.x + Math.cos(angle) * orbit, hub.y + Math.sin(angle) * orbit * 0.82, compact ? 1.7 : 2.2, 0, Math.PI * 2);
      context.fillStyle = rgba(WHITE, audit * 0.9);
      context.fill();
    }
    context.beginPath();
    context.arc(hub.x, hub.y, badge, 0, Math.PI * 2);
    context.fillStyle = rgba([5, 7, 11], audit);
    context.fill();
    context.strokeStyle = rgba(PLAIN, audit * 0.85);
    context.lineWidth = 1.2;
    context.stroke();
    // The Adaptral mark, drawn from the same path as the wordmark's symbol (36 × 46).
    const unit = (badge * 1.08) / 46;
    const mark = (x: number, y: number): [number, number] => [hub.x + (x - 17.5) * unit, hub.y + (y - 22.5) * unit];
    context.beginPath();
    context.moveTo(...mark(29, 6));
    context.bezierCurveTo(...mark(15, -3), ...mark(20, 49), ...mark(6, 39));
    context.lineCap = "round";
    context.strokeStyle = rgba(WHITE, audit);
    context.lineWidth = 6.5 * unit;
    context.stroke();

    const status = [...STATUS].reverse().find((entry) => u >= entry.from);
    const lift = orbit + (compact ? 22 : 15);
    if (status) {
      // Typed out from a fixed left edge, so the line does not shuffle as it grows.
      const typed = status.text.slice(0, Math.floor((u - status.from) * 30));
      const caret = typed.length < status.text.length || Math.floor(u * 2.4) % 2 === 0 ? "_" : "";
      const full = context.measureText(status.text).width;
      if (compact) {
        // On a narrow canvas the beam to the frontier model passes behind this line; keep it readable.
        context.beginPath();
        context.roundRect(hub.x - full / 2 - 5, hub.y - lift - small * 0.85, full + 10, small * 1.7, 4);
        context.fillStyle = rgba([0, 0, 0], audit * 0.72);
        context.fill();
      }
      context.textAlign = "left";
      context.fillStyle = rgba(WHITE, audit * 0.96);
      context.fillText(typed + caret, hub.x - full / 2, hub.y - lift);
    }
    context.textAlign = "center";
    context.fillStyle = rgba(PLAIN, audit * 0.55);
    context.fillText("Adaptral agents", hub.x, hub.y - lift - small * 1.6);
  }

  // The frontier model: an orb of orange light, large at first, then left with only the hard calls.
  const orb = (cx: number, cy: number, r: number, power: number) => {
    context.globalCompositeOperation = "lighter";
    const haze = context.createRadialGradient(cx, cy, 0, cx, cy, r * 2.1);
    haze.addColorStop(0, rgba([255, 150, 40], 0.36 * power));
    haze.addColorStop(0.45, rgba([255, 110, 20], 0.12 * power));
    haze.addColorStop(1, rgba([255, 90, 0], 0));
    context.fillStyle = haze;
    context.fillRect(cx - r * 2.2, cy - r * 2.2, r * 4.4, r * 4.4);
    const core = context.createRadialGradient(cx, cy, 0, cx, cy, r * 0.5);
    core.addColorStop(0, rgba([255, 240, 200], 0.95 * power));
    core.addColorStop(0.35, rgba([255, 180, 70], 0.5 * power));
    core.addColorStop(1, rgba([255, 120, 20], 0));
    context.fillStyle = core;
    context.fillRect(cx - r * 0.5, cy - r * 0.5, r, r);

    // Broken rings turning at their own speeds.
    context.lineCap = "butt";
    for (let ring = 0; ring < 11; ring++) {
      const radius = r * (0.3 + ring * 0.068);
      const speed = (0.18 + hash(ring + 40) * 0.7) * (ring % 2 ? -1 : 1);
      const pieces = 1 + Math.floor(hash(ring + 80) * 3);
      for (let piece = 0; piece < pieces; piece++) {
        const start = hash(ring * 7 + piece) * Math.PI * 2 + u * speed + (piece * Math.PI * 2) / pieces;
        const sweep = 0.35 + hash(ring * 11 + piece + 3) * (1.9 / pieces + 0.5);
        context.beginPath();
        context.arc(cx, cy, radius, start, start + sweep);
        context.strokeStyle = rgba([255, 150 + hash(ring + piece) * 70, 40 + hash(ring + 9) * 60], (0.3 + hash(ring * 3 + piece) * 0.5) * power);
        context.lineWidth = hash(ring + piece * 5 + 2) > 0.72 ? Math.max(1.6, r * 0.04) : 1;
        context.stroke();
      }
    }
    // Instrument ticks around the rim.
    for (let tick = 0; tick < 56; tick++) {
      if (hash(tick + 300) < 0.3) continue;
      const angle = (tick / 56) * Math.PI * 2 + u * 0.07;
      const inner = r * (hash(tick + 500) > 0.8 ? 0.9 : 0.96);
      context.beginPath();
      context.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
      context.lineTo(cx + Math.cos(angle) * r * 1.03, cy + Math.sin(angle) * r * 1.03);
      context.strokeStyle = rgba([255, 176, 80], 0.5 * power);
      context.lineWidth = 1;
      context.stroke();
    }
    // Two arms of sparks spiralling into the core.
    const count = Math.round(Math.max(40, Math.min(150, r * 1.7)));
    for (let index = 0; index < count; index++) {
      const depth = fract(hash(index + 700) - u * (0.025 + hash(index + 900) * 0.035));
      const radius = r * (0.12 + depth * 0.95);
      const angle = (index % 2) * Math.PI + depth * 5.2 + u * 0.35 + (hash(index + 1100) - 0.5) * 0.9;
      const twinkle = 0.45 + 0.55 * Math.sin(u * (2 + hash(index + 1300) * 4) + index);
      const size = 0.9 + hash(index + 1500) * 1.3;
      context.fillStyle = rgba([255, 170 + hash(index + 1700) * 70, 70 + hash(index + 1900) * 90], twinkle * power * 0.9);
      context.fillRect(cx + Math.cos(angle) * radius - size / 2, cy + Math.sin(angle) * radius * 0.94 - size / 2, size, size);
    }
    context.globalCompositeOperation = "source-over";
  };
  orb(frontier.x, frontier.y, frontierRadius, lerp(1, 0.8, split));

  // Its label sits underneath while it is alone, then beside it like the others.
  const below = 1 - smoothstep(0, 0.5, split);
  const beside = smoothstep(0.5, 1, split);
  const labelX = targetX + modelRadius + (compact ? 11 : 18);
  if (below > 0.01) {
    context.textAlign = "center";
    context.fillStyle = rgba(PLAIN, below * 0.94);
    context.fillText("Frontier LLM", frontier.x, frontier.y + frontierRadius + 20);
    context.fillStyle = rgba(PLAIN, below * 0.5);
    context.fillText("every call", frontier.x, frontier.y + frontierRadius + 20 + small * 1.5);
  }
  if (beside > 0.01) {
    const x = Math.max(labelX, frontier.x + frontierRadius + (compact ? 9 : 16));
    context.textAlign = "left";
    context.fillStyle = rgba(PLAIN, beside * 0.94);
    context.fillText("Frontier LLM", x, frontier.y - (compact ? 0 : small * 0.75));
    if (!compact) {
      context.fillStyle = rgba(PLAIN, beside * 0.5);
      context.fillText("hard calls only", x, frontier.y + small * 0.75);
    }
  }

  // The small models, each with its own data → evals → retrain loop.
  models.forEach((model, index) => {
    if (model.shown <= 0.01) return;
    const since = u - 12 - index * 0.5;
    const cycles = Math.max(0, Math.floor(since / IMPROVE_CYCLE));
    const phase = since > 0 ? (since % IMPROVE_CYCLE) / IMPROVE_CYCLE : 0;
    const pulse = cycles > 0 ? Math.exp(-phase * IMPROVE_CYCLE * 2.4) : 0;
    const r = modelRadius * (0.5 + model.shown * 0.5) * (1 + pulse * 0.2);

    const halo = context.createRadialGradient(model.x, model.y, 0, model.x, model.y, r * 3.4);
    halo.addColorStop(0, rgba(model.rgb, model.shown * (0.34 + pulse * 0.4)));
    halo.addColorStop(1, rgba(model.rgb, 0));
    context.fillStyle = halo;
    context.fillRect(model.x - r * 3.5, model.y - r * 3.5, r * 7, r * 7);
    const logo = logos[index];
    context.beginPath();
    context.arc(model.x, model.y, r, 0, Math.PI * 2);
    if (logo) {
      // A white disc ringed in the task's colour, so any logo reads on the dark page.
      context.fillStyle = rgba(WHITE, model.shown);
      context.fill();
      context.strokeStyle = rgba(model.rgb, model.shown);
      context.lineWidth = 1.6;
      context.stroke();
      const size = r * 1.24;
      context.globalAlpha = fade * model.shown;
      context.drawImage(logo, model.x - size / 2, model.y - size / 2, size, size);
      context.globalAlpha = fade;
    } else {
      context.fillStyle = rgba(model.rgb, model.shown);
      context.fill();
      context.font = `600 ${Math.round(r * 1.05)}px ${FONT}`;
      context.textAlign = "center";
      context.fillStyle = rgba([5, 7, 11], model.shown * 0.9);
      context.fillText(model.mark, model.x, model.y + 0.5);
      context.font = `${small}px ${FONT}`;
    }

    if (improve > 0.01 && since > 0) {
      const ring = modelRadius + (compact ? 5 : 7);
      const head = phase * Math.PI * 2 - Math.PI / 2;
      context.lineCap = "round";
      context.beginPath();
      context.arc(model.x, model.y, ring, 0, Math.PI * 2);
      context.strokeStyle = rgba(model.rgb, improve * 0.2);
      context.lineWidth = 1;
      context.stroke();
      context.beginPath();
      context.arc(model.x, model.y, ring, head - 1.5, head);
      context.strokeStyle = rgba(model.rgb, improve * 0.95);
      context.lineWidth = 1.8;
      context.stroke();
    }

    // Task and version, the model underneath, then (when there is room) the loop it is in.
    context.textAlign = "left";
    const line = small * 1.5;
    const top = model.y - line * (compact ? 0.5 : lerp(0.5, 1, improve));
    context.fillStyle = rgba(PLAIN, model.shown * 0.95);
    context.fillText(model.name, labelX, top);
    if (improve > 0.01) {
      context.fillStyle = rgba(model.rgb, improve * (0.75 + pulse * 0.25));
      context.fillText(`v${cycles + 1}`, labelX + context.measureText(model.name + " ").width, top);
    }
    context.fillStyle = rgba(PLAIN, model.shown * 0.55);
    context.fillText(compact ? model.model : `fine-tuned ${model.model}`, labelX, top + line);
    if (improve > 0.01 && !compact) {
      const stage = since > 0 ? Math.min(2, Math.floor(phase * 3)) : -1;
      let x = labelX;
      STAGES.forEach((word, order) => {
        context.fillStyle = order === stage ? rgba(model.rgb, improve) : rgba(PLAIN, improve * 0.4);
        context.fillText(word, x, top + line * 2);
        x += context.measureText(word).width;
        if (order < 2) {
          context.fillStyle = rgba(PLAIN, improve * 0.3);
          context.fillText(" → ", x, top + line * 2);
          x += context.measureText(" → ").width;
        }
      });
    }
  });

  // What it buys: fluorescent bars, red while high and green once they fall. No invented numbers.
  const heat = (value: number) => {
    const level = clamp((value - 0.34) / 0.56);
    return level < 0.5 ? mix(GREEN, YELLOW, level * 2) : mix(YELLOW, RED, level * 2 - 1);
  };
  const cost = 1 - 0.6 * split - 0.1 * matured;
  const latency = 1 - 0.5 * split - 0.1 * matured;
  const meters = [
    { label: "Cost", value: cost, colour: heat(cost) },
    { label: "Latency", value: latency, colour: heat(latency) },
    { label: "Accuracy", value: 0.8 + 0.15 * matured, colour: GREEN },
  ];
  const meterX = width * (compact ? 0.05 : 0.045);
  const meterWidth = Math.min(180, width * 0.3);
  const rowGap = compact ? 23 : 28;
  const meterY = height - (compact ? 16 : 24) - rowGap * 2.4;
  context.textAlign = "left";
  meters.forEach((meter, row) => {
    const y = meterY + row * rowGap;
    context.fillStyle = rgba(PLAIN, 0.7);
    context.fillText(meter.label, meterX, y);
    context.beginPath();
    context.roundRect(meterX, y + 9, meterWidth, 4, 2);
    context.fillStyle = rgba(PLAIN, 0.12);
    context.fill();
    context.beginPath();
    context.roundRect(meterX, y + 9, meterWidth * meter.value, 4, 2);
    context.shadowColor = rgba(meter.colour, 1);
    context.shadowBlur = 14;
    context.fillStyle = rgba(meter.colour, 1);
    context.fill();
    context.shadowBlur = 0;
  });

  context.restore();
}
