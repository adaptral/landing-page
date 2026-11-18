"use client";

import { type RefObject, useEffect, useRef } from "react";
import { matrixGeometry, networkLayers } from "./matrix-geometry";

export type NetworkMode = "home" | "studies";

type Mutation = { from: number; to: number; start: number; hue: number };

type Weight = { value: number; mutation: Mutation | null };

type Neuron = { x: number; y: number; z: number };

type Synapse = Weight & {
  from: number;
  to: number;
  gap: number;
  // Position along the connection where its weight is printed, if it carries one.
  label: number | null;
};

type Projected = { x: number; y: number; z: number; scale: number; opacity: number };

type Scheduled = { at: number; weight: Weight; hue: number; target?: number };

// The case-study network: ports sit on the edges of the cards, wires join them.
type Port = { x: number; y: number; energy: number; hue: number };

type Wire = {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  from: number;
  to: number;
  stage: number;
  label: number | null;
  weight: Weight;
};

type Pulse = { live: boolean; value: number; age: number; progress: number; energy: number; hue: number };

const MUTATION_DURATION = 2.25;
// Matches the loss landscape's cycle, so each arriving dot sets off a pass of updates.
const DESCENT_CYCLE = 18;
const DESCENT_ARRIVAL = 14.7;
// The pull into the network: how long it lasts and how far the camera travels.
const DIVE_DURATION = 2.1;
const DIVE_ZOOM = 14;
const FONT = '"IBM Plex Mono", monospace';

function generator(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function smoothstep(start: number, end: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
}

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function makeNetwork(layers: number[]) {
  const neurons: Neuron[] = [];
  const synapses: Synapse[] = [];
  const layerStart: number[] = [];
  const random = generator(3729);

  layers.forEach((count, layer) => {
    layerStart.push(neurons.length);
    for (let index = 0; index < count; index++) {
      neurons.push({
        x: (layer / (layers.length - 1)) * 2.6 - 1.3,
        y: (index - (count - 1) / 2) * 0.42,
        // Each column bows toward the viewer, giving the network real depth as it turns.
        z: 0.4 - ((index - (count - 1) / 2) * 0.42) ** 2 * 0.62,
      });
    }
  });

  for (let gap = 0; gap < layers.length - 1; gap++) {
    for (let a = 0; a < layers[gap]; a++) {
      for (let b = 0; b < layers[gap + 1]; b++) {
        synapses.push({
          from: layerStart[gap] + a,
          to: layerStart[gap + 1] + b,
          gap,
          value: Math.round((random() * 3.6 - 1.8) * 10) / 10,
          label: null,
          mutation: null,
        });
      }
    }
  }

  // Print weights on a spread-out subset of connections so the numbers never collide.
  const compact = neurons.length < 18;
  const clearX = compact ? 0.52 : 0.4;
  const clearY = compact ? 0.3 : 0.21;
  const placed: { x: number; y: number }[] = [];
  const shuffled = synapses.map((_, index) => index);
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
  }
  for (const index of shuffled) {
    const synapse = synapses[index];
    const a = neurons[synapse.from];
    const b = neurons[synapse.to];
    for (const t of [0.5, 0.36, 0.64]) {
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;
      if (placed.some((other) => Math.abs(other.x - x) < clearX && Math.abs(other.y - y) < clearY)) continue;
      placed.push({ x, y });
      synapse.label = t;
      break;
    }
  }

  return { neurons, synapses, random, gaps: layers.length - 1 };
}

function formatWeight(value: number) {
  // Avoid a distracting negative zero during interpolation.
  return (Math.abs(value) < 0.05 ? 0 : value).toFixed(1);
}

function settle(weight: Weight, time: number) {
  if (weight.mutation && time - weight.mutation.start >= MUTATION_DURATION) {
    weight.value = weight.mutation.to;
    weight.mutation = null;
  }
}

function read(weight: Weight, time: number): Pulse {
  const mutation = weight.mutation;
  if (!mutation) return { live: false, value: weight.value, age: 0, progress: 0, energy: 0, hue: 0 };
  const age = time - mutation.start;
  const progress = Math.min(1, Math.max(0, (age - 0.22) / 1.12));
  return {
    live: true,
    // The value rolls through its intermediate weights before settling.
    value: mutation.from + (mutation.to - mutation.from) * (1 - Math.pow(1 - progress, 3)),
    age,
    progress,
    energy: Math.sin(Math.min(1, Math.max(0, age / MUTATION_DURATION)) * Math.PI),
    hue: (mutation.hue + age * 170) % 360,
  };
}

export function NeuralNetwork({ mode, gridRef }: { mode: NetworkMode; gridRef: RefObject<HTMLElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<NetworkMode>(mode);
  const wakeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const anchor = anchorRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !anchor || !context) return;

    let layers = networkLayers(anchor.getBoundingClientRect().width);
    let { neurons, synapses, random, gaps } = makeNetwork(layers);
    let projected: Projected[] = [];
    let labelPoints: Projected[] = [];
    let charge: { energy: number; hue: number }[] = [];
    let labelOrder: number[] = [];
    let queue: Scheduled[] = [];
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;
    let width = 1;
    let height = 1;
    let frame = 0;
    let running = false;
    let previousTime = 0;
    let elapsed = 0;
    let nextMutation = 0.25;
    let firstMutation = true;
    let lastDescent = -1;
    let inViewport = true;
    let disposed = false;

    // 0 is the landing view, 1 is fully inside the network among the case studies.
    let dive = modeRef.current === "studies" ? 1 : 0;
    const innerRandom = generator(9151);
    const innerWeights: Weight[] = [];
    let ports: Port[] = [];
    let wires: Wire[] = [];
    let stages = 0;
    let gridX = 0;
    let gridY = 0;
    let nextInner = 0;
    let burst = false;

    const allocate = () => {
      const blank = () => ({ x: 0, y: 0, z: 0, scale: 1, opacity: 1 });
      projected = neurons.map(blank);
      labelPoints = synapses.map(blank);
      charge = neurons.map(() => ({ energy: 0, hue: 0 }));
      labelOrder = synapses.flatMap((synapse, index) => (synapse.label === null ? [] : [index]));
      queue = queue.filter((item) => innerWeights.includes(item.weight));
    };
    allocate();

    // Read where the case-study cards sit and wire them up, layer to layer.
    const measure = () => {
      const grid = gridRef.current;
      ports = [];
      wires = [];
      stages = 0;
      if (!grid) return;
      gridX = grid.offsetLeft;
      gridY = grid.offsetTop;
      const columns: { x: number; y: number; w: number; h: number }[][] = [];
      grid.querySelectorAll<HTMLElement>("[data-study]").forEach((card) => {
        const layer = Number(card.dataset.layer) || 0;
        (columns[layer] ??= []).push({ x: gridX + card.offsetLeft, y: gridY + card.offsetTop, w: card.offsetWidth, h: card.offsetHeight });
      });
      const groups = columns.filter(Boolean);
      if (groups.length < 2 || !groups[0][0].w) return;

      const first = groups[0][0];
      const last = groups[groups.length - 1][0];
      // Layers run left to right on wide screens and top to bottom on narrow ones.
      const horizontal = Math.abs(last.x - first.x) >= Math.abs(last.y - first.y);
      const clearance = 9;
      const port = (x: number, y: number) => ports.push({ x, y, energy: 0, hue: 0 }) - 1;
      const entries = groups.map((group) => group.map((box) => (horizontal ? port(box.x - clearance, box.y + box.h / 2) : port(box.x + box.w / 2, box.y - clearance))));
      const exits = groups.map((group) => group.map((box) => (horizontal ? port(box.x + box.w + clearance, box.y + box.h / 2) : port(box.x + box.w / 2, box.y + box.h + clearance))));

      let count = 0;
      const add = (ax: number, ay: number, bx: number, by: number, from: number, to: number, stage: number, label: number | null) => {
        const weight = (innerWeights[count++] ??= { value: Math.round((innerRandom() * 3.6 - 1.8) * 10) / 10, mutation: null });
        wires.push({ ax, ay, bx, by, from, to, stage, label, weight });
      };
      // Connections arrive from, and leave to, the rest of the network beyond the screen.
      const spread = horizontal ? height * 0.17 : width * 0.21;
      const beyond = 90;
      for (const index of entries[0]) {
        const { x, y } = ports[index];
        for (const side of [-1, 1]) {
          if (horizontal) add(-beyond, y + side * spread, x, y, -1, index, 0, null);
          else add(x + side * spread, -beyond, x, y, -1, index, 0, null);
        }
      }
      for (let gap = 0; gap < groups.length - 1; gap++) {
        exits[gap].forEach((a, i) => entries[gap + 1].forEach((b, j) => {
          // Straight connections label at their middle; crossing ones step aside.
          add(ports[a].x, ports[a].y, ports[b].x, ports[b].y, a, b, gap + 1, i === j ? 0.5 : 0.3);
        }));
      }
      for (const index of exits[groups.length - 1]) {
        const { x, y } = ports[index];
        for (const side of [-1, 1]) {
          if (horizontal) add(x, y, width + beyond, y + side * spread, index, -1, groups.length, null);
          else add(x, y, x + side * spread, height + beyond, index, -1, groups.length, null);
        }
      }
      stages = groups.length + 1;
    };

    const mutate = (weight: Weight, time: number, hue: number, target?: number, rng = random) => {
      if (weight.mutation) return;
      let to = target ?? Math.round((rng() * 5.6 - 2.4) * 10) / 10;
      if (Math.abs(to - weight.value) < 0.5) to = Math.round((to + (to > 1.5 ? -1.1 : 1.1)) * 10) / 10;
      weight.mutation = { from: weight.value, to, start: time, hue };
    };

    const pick = <T,>(candidates: T[], rng = random) => candidates[Math.floor(rng() * candidates.length)];

    const schedule = (time: number) => {
      const outside = dive < 0.5;

      // The descending dot lands on the input layer: update a few weights per layer, front to back.
      const descent = Math.floor((time - DESCENT_ARRIVAL) / DESCENT_CYCLE);
      if (descent > lastDescent) {
        lastDescent = descent;
        if (descent >= 0 && outside) {
          const hue = random() * 360;
          for (let gap = 0; gap < gaps; gap++) {
            const idle = synapses.filter((synapse) => synapse.gap === gap && !synapse.mutation);
            const labelled = idle.filter((synapse) => synapse.label !== null);
            const chosen = new Set<Synapse>();
            if (labelled.length) chosen.add(pick(labelled));
            for (let attempt = 0; attempt < 8 && chosen.size < (neurons.length < 18 ? 2 : 3) && idle.length; attempt++) chosen.add(pick(idle));
            [...chosen].forEach((weight, order) => queue.push({ at: time + gap * 0.5 + order * 0.14, weight, hue: hue + gap * 70 + order * 25 }));
          }
          nextMutation = time + gaps * 0.5 + 1.7;
        }
      }

      if (outside && time >= nextMutation) {
        const idle = synapses.filter((synapse) => !synapse.mutation);
        const labelled = idle.filter((synapse) => synapse.label !== null);
        // Mostly change weights whose numbers are on show, so each update is readable.
        const weight = pick(labelled.length && (firstMutation || random() < 0.75) ? labelled : idle);
        if (weight) {
          if (firstMutation) weight.value = -1.2;
          queue.push({ at: time, weight, hue: random() * 360, target: firstMutation ? 3 : undefined });
          firstMutation = false;
        }
        nextMutation = time + 0.95 + random() * 0.9;
      }

      // Arriving among the case studies sends one pass of updates through them.
      if (dive < 0.25) burst = false;
      if (dive > 0.75 && !burst && wires.length) {
        burst = true;
        const hue = innerRandom() * 360;
        for (let stage = 0; stage < stages; stage++) {
          const idle = wires.filter((wire) => wire.stage === stage && !wire.weight.mutation);
          const chosen = new Set<Wire>();
          for (let attempt = 0; attempt < 6 && chosen.size < 2 && idle.length; attempt++) chosen.add(pick(idle, innerRandom));
          [...chosen].forEach((wire, order) => queue.push({ at: time + 0.25 + stage * 0.4 + order * 0.12, weight: wire.weight, hue: hue + stage * 80 + order * 140 }));
        }
        nextInner = time + stages * 0.4 + 1.5;
      }
      if (dive > 0.75 && time >= nextInner && wires.length) {
        const idle = wires.filter((wire) => !wire.weight.mutation);
        const labelled = idle.filter((wire) => wire.label !== null);
        const wire = pick(labelled.length && innerRandom() < 0.7 ? labelled : idle, innerRandom);
        if (wire) queue.push({ at: time, weight: wire.weight, hue: innerRandom() * 360 });
        nextInner = time + 0.8 + innerRandom() * 0.9;
      }

      queue = queue.filter((item) => {
        if (item.at > time) return true;
        mutate(item.weight, item.at, item.hue, item.target, innerWeights.includes(item.weight) ? innerRandom : random);
        return false;
      });
    };

    // A connection: weight magnitude sets the thickness, updates travel as rainbow light.
    const strokeWire = (ax: number, ay: number, bx: number, by: number, pulse: Pulse, opacity: number, thickness: number) => {
      const magnitude = Math.min(3, Math.abs(pulse.value));
      const base = (0.45 + magnitude * 0.3) * thickness;
      context.strokeStyle = `rgba(205,221,248,${Math.min(1, opacity * (0.07 + magnitude * 0.075))})`;
      context.lineWidth = base;
      context.beginPath();
      context.moveTo(ax, ay);
      context.lineTo(bx, by);
      context.stroke();
      if (!pulse.live) return 0;

      // A bright head runs from the source to the target, then the whole edge settles.
      const { energy, hue } = pulse;
      const head = Math.min(1, Math.max(0, pulse.age / 0.85));
      const gradient = context.createLinearGradient(ax, ay, bx, by);
      gradient.addColorStop(0, `hsla(${hue},100%,72%,${energy * 0.5})`);
      gradient.addColorStop(Math.max(0, head - 0.3), `hsla(${hue + 60},100%,72%,${energy * 0.55})`);
      gradient.addColorStop(head, `hsla(${hue + 130},100%,82%,${Math.min(1, energy * 1.5)})`);
      gradient.addColorStop(Math.min(1, head + 0.08), `hsla(${hue + 220},100%,70%,${energy * 0.16})`);
      gradient.addColorStop(1, `hsla(${hue + 220},100%,70%,${energy * 0.16})`);
      context.strokeStyle = gradient;
      context.lineWidth = base + 0.7 * energy * thickness;
      context.shadowColor = `hsla(${hue + 80},100%,68%,${energy * 0.6})`;
      context.shadowBlur = 7 * energy;
      context.beginPath();
      context.moveTo(ax, ay);
      context.lineTo(bx, by);
      context.stroke();
      context.shadowBlur = 0;
      return head;
    };

    // A neuron: a quiet ring that lights up while one of its weights is being updated.
    const paintNode = (x: number, y: number, radius: number, energy: number, hue: number, opacity: number) => {
      if (energy > 0.01) {
        const reach = radius * (3 + energy * 2.5);
        const glow = context.createRadialGradient(x, y, 0, x, y, reach);
        glow.addColorStop(0, `hsla(${hue},100%,68%,${energy * 0.3})`);
        glow.addColorStop(0.5, `hsla(${hue + 90},100%,60%,${energy * 0.09})`);
        glow.addColorStop(1, `hsla(${hue + 180},100%,60%,0)`);
        context.fillStyle = glow;
        context.fillRect(x - reach, y - reach, reach * 2, reach * 2);
      }

      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fillStyle = "#000";
      context.fill();
      context.lineWidth = 1;
      context.strokeStyle = energy > 0.01
        ? `hsla(${hue + 40},100%,${92 - energy * 18}%,${Math.min(1, opacity * 0.6 + energy)})`
        : `rgba(226,236,255,${opacity * 0.6})`;
      context.shadowColor = `hsla(${hue + 40},100%,70%,${energy * 0.8})`;
      context.shadowBlur = 9 * energy;
      context.stroke();
      context.shadowBlur = 0;

      context.beginPath();
      context.arc(x, y, radius * (0.32 + energy * 0.22), 0, Math.PI * 2);
      context.fillStyle = energy > 0.01
        ? `hsla(${hue + 100},100%,${96 - energy * 18}%,${Math.min(1, opacity * 0.8 + energy)})`
        : `rgba(239,246,255,${opacity * 0.8})`;
      context.fill();
    };

    // A weight, on a dark chip so it stays legible over the wiring.
    const paintLabel = (x: number, y: number, fontSize: number, pulse: Pulse, opacity: number) => {
      const boxWidth = fontSize * 2.65;
      const boxHeight = fontSize * 1.3;
      context.fillStyle = "rgba(0,0,0,0.8)";
      context.beginPath();
      if (context.roundRect) context.roundRect(x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight, boxHeight / 2);
      else context.rect(x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight);
      context.fill();

      if (!pulse.live) {
        context.font = `400 ${fontSize.toFixed(2)}px ${FONT}`;
        context.fillStyle = `rgba(239,246,255,${Math.min(1, opacity + 0.1)})`;
        context.fillText(formatWeight(pulse.value), x, y);
        return;
      }

      const { energy, hue } = pulse;
      const radius = fontSize * (1.6 + energy * 0.95);
      const glow = context.createRadialGradient(x, y, 0, x, y, radius);
      glow.addColorStop(0, `hsla(${hue},100%,68%,${energy * 0.22})`);
      glow.addColorStop(0.5, `hsla(${hue + 90},100%,60%,${energy * 0.07})`);
      glow.addColorStop(1, `hsla(${hue + 180},100%,60%,0)`);
      context.fillStyle = glow;
      context.fillRect(x - radius, y - radius, radius * 2, radius * 2);

      const rainbow = context.createLinearGradient(x - boxWidth / 2, y - 5, x + boxWidth / 2, y + 5);
      for (let stop = 0; stop <= 4; stop++) {
        rainbow.addColorStop(stop / 4, `hsl(${hue + stop * 75},100%,${71 + (1 - energy) * 25}%)`);
      }
      context.fillStyle = rainbow;
      context.shadowColor = `hsla(${hue + 65},100%,70%,${energy})`;
      context.shadowBlur = 10 * energy;
      context.font = `400 ${(fontSize * (1 + energy * 0.08)).toFixed(2)}px ${FONT}`;
      context.fillText(formatWeight(pulse.value), x, y - Math.sin(pulse.progress * Math.PI));
      context.shadowBlur = 0;
    };

    const drawOuter = (time: number, unit: number, labelUnit: number, centerX: number, centerY: number, zoom: number) => {
      // Sway rather than spin, so the layers always read left to right.
      const yaw = -0.3 + Math.sin(time * 0.17) * 0.44;
      const pitch = -0.2 + Math.sin(time * 0.11 + 1) * 0.07;
      const roll = -0.05;
      const cy = Math.cos(yaw);
      const sy = Math.sin(yaw);
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      const cr = Math.cos(roll);
      const sr = Math.sin(roll);
      const thickness = Math.sqrt(zoom);

      const project = (x: number, y: number, z: number, out: Projected) => {
        const rx = x * cy + z * sy;
        const rz = -x * sy + z * cy;
        const ry = y * cp - rz * sp;
        const depth = y * sp + rz * cp;
        const perspective = 4.8 / (4.8 - depth);
        out.x = centerX + (rx * cr - ry * sr) * unit * perspective;
        out.y = centerY + (rx * sr + ry * cr) * unit * perspective;
        out.z = depth;
        out.scale = perspective;
        out.opacity = Math.max(0.3, Math.min(1, 0.68 + depth * 0.36));
      };

      neurons.forEach((neuron, index) => {
        project(neuron.x, neuron.y, neuron.z, projected[index]);
        charge[index].energy = 0;
      });

      context.lineCap = "round";
      synapses.forEach((synapse, index) => {
        settle(synapse, time);
        const start = projected[synapse.from];
        const end = projected[synapse.to];
        const pulse = read(synapse, time);
        const head = strokeWire(start.x, start.y, end.x, end.y, pulse, (start.opacity + end.opacity) / 2, thickness);

        if (synapse.label !== null) {
          const a = neurons[synapse.from];
          const b = neurons[synapse.to];
          const t = synapse.label;
          project(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t, labelPoints[index]);
        }
        if (!pulse.live) return;
        const source = charge[synapse.from];
        const target = charge[synapse.to];
        if (pulse.energy > source.energy) { source.energy = pulse.energy; source.hue = pulse.hue; }
        if (pulse.energy * head > target.energy) { target.energy = pulse.energy * head; target.hue = pulse.hue + 130; }
      });

      neurons.forEach((_, index) => {
        const point = projected[index];
        paintNode(point.x, point.y, Math.max(2.6, unit * 0.03) * point.scale, charge[index].energy, charge[index].hue, point.opacity);
      });

      // Weights, painted back to front.
      labelOrder.sort((a, b) => labelPoints[a].z - labelPoints[b].z);
      const fontScale = Math.pow(zoom, 0.7);
      for (const index of labelOrder) {
        const point = labelPoints[index];
        const fontSize = Math.max(9, Math.min(13.5, labelUnit * 0.072)) * point.scale * fontScale;
        paintLabel(point.x, point.y, fontSize, read(synapses[index], time), point.opacity);
      }
    };

    const drawInner = (time: number, mapX: (x: number) => number, mapY: (y: number) => number, scale: number) => {
      const thickness = Math.max(0.35, scale) * 1.15;
      for (const port of ports) port.energy = 0;

      context.lineCap = "round";
      for (const wire of wires) {
        settle(wire.weight, time);
        const pulse = read(wire.weight, time);
        const head = strokeWire(mapX(wire.ax), mapY(wire.ay), mapX(wire.bx), mapY(wire.by), pulse, 1.25, thickness);
        if (!pulse.live) continue;
        const source = ports[wire.from];
        const target = ports[wire.to];
        if (source && pulse.energy > source.energy) { source.energy = pulse.energy; source.hue = pulse.hue; }
        if (target && pulse.energy * head > target.energy) { target.energy = pulse.energy * head; target.hue = pulse.hue + 130; }
      }

      for (const port of ports) paintNode(mapX(port.x), mapY(port.y), 4.2 * scale, port.energy, port.hue, 0.9);

      const fontSize = Math.max(10.5, Math.min(13.5, width * 0.0095)) * scale;
      for (const wire of wires) {
        if (wire.label === null) continue;
        const x = wire.ax + (wire.bx - wire.ax) * wire.label;
        const y = wire.ay + (wire.by - wire.ay) * wire.label;
        paintLabel(mapX(x), mapY(y), fontSize, read(wire.weight, time), 0.9);
      }
    };

    const render = (time: number) => {
      const bounds = anchor.getBoundingClientRect();
      const { unit, labelUnit, centerX, centerY } = matrixGeometry(bounds.width, bounds.height);
      const eased = easeInOut(dive);
      // Exponential zoom reads as constant speed: the outer network rushes past as the inner one grows.
      const zoom = Math.pow(DIVE_ZOOM, eased);
      const scale = zoom / DIVE_ZOOM;
      const middleX = width / 2;
      const middleY = height / 2;
      const focusX = bounds.left + centerX + (middleX - bounds.left - centerX) * eased;
      const focusY = bounds.top + centerY + (middleY - bounds.top - centerY) * eased;
      const outerAlpha = 1 - smoothstep(0.38, 0.86, eased);
      const innerAlpha = smoothstep(0.3, 0.78, eased);

      context.clearRect(0, 0, width, height);
      context.textAlign = "center";
      context.textBaseline = "middle";
      if (!reducedMotion) schedule(time);

      if (outerAlpha > 0.003) {
        context.globalAlpha = outerAlpha;
        drawOuter(time, unit * zoom, labelUnit, focusX, focusY, zoom);
      }

      // The cards are real elements; they ride the same zoom as the wiring drawn beneath them.
      const grid = gridRef.current;
      const scroll = grid?.offsetParent?.scrollTop ?? 0;
      if (grid) {
        const left = gridX;
        const top = gridY - scroll;
        grid.style.transform = `translate(${(focusX - left - (middleX - left) * scale).toFixed(2)}px,${(focusY - top - (middleY - top) * scale).toFixed(2)}px) scale(${scale.toFixed(5)})`;
        grid.style.opacity = innerAlpha.toFixed(3);
        grid.style.visibility = innerAlpha > 0.003 ? "visible" : "hidden";
      }
      if (innerAlpha > 0.003) {
        context.globalAlpha = innerAlpha;
        drawInner(time, (x) => focusX + (x - middleX) * scale, (y) => focusY + (y - scroll - middleY) * scale, scale);
      }
      context.globalAlpha = 1;
    };

    const destination = () => (modeRef.current === "studies" ? 1 : 0);

    const shouldPlay = () => !disposed && !reducedMotion && !document.hidden && (inViewport || dive > 0 || destination() === 1);

    const tick = (timestamp: number) => {
      if (disposed) return;
      const delta = previousTime ? Math.min((timestamp - previousTime) / 1000, 0.05) : 0;
      previousTime = timestamp;
      elapsed += delta;
      const target = destination();
      if (dive < target) dive = Math.min(1, dive + delta / DIVE_DURATION);
      else if (dive > target) dive = Math.max(0, dive - delta / DIVE_DURATION);
      render(elapsed);
      if (shouldPlay()) frame = window.requestAnimationFrame(tick);
      else running = false;
    };

    const syncPlayback = () => {
      window.cancelAnimationFrame(frame);
      running = false;
      previousTime = 0;
      if (reducedMotion) {
        for (const synapse of synapses) synapse.mutation = null;
        for (const weight of innerWeights) weight.mutation = null;
        queue = [];
        dive = destination();
      }
      if (shouldPlay()) {
        running = true;
        frame = window.requestAnimationFrame(tick);
      } else {
        render(elapsed);
      }
    };
    wakeRef.current = syncPlayback;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const nextLayers = networkLayers(anchor.getBoundingClientRect().width);
      if (nextLayers.join() !== layers.join()) {
        layers = nextLayers;
        ({ neurons, synapses, random, gaps } = makeNetwork(layers));
        allocate();
      }
      measure();
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

    // The canvas is pinned to the viewport, so a paused network must follow the page by hand.
    const onScroll = () => {
      if (!running) render(elapsed);
    };

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting;
      syncPlayback();
    });
    resizeObserver.observe(canvas);
    resizeObserver.observe(anchor);
    if (gridRef.current) resizeObserver.observe(gridRef.current);
    intersectionObserver.observe(anchor);
    motionQuery.addEventListener("change", onMotionChange);
    document.addEventListener("visibilitychange", syncPlayback);
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    resize();
    syncPlayback();
    // Redraw once the locally hosted numerical font is available.
    void document.fonts.ready.then(() => { if (!disposed) resize(); });

    return () => {
      disposed = true;
      wakeRef.current = null;
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      motionQuery.removeEventListener("change", onMotionChange);
      document.removeEventListener("visibilitychange", syncPlayback);
      document.removeEventListener("scroll", onScroll, { capture: true });
    };
  }, [gridRef]);

  useEffect(() => {
    modeRef.current = mode;
    wakeRef.current?.();
  }, [mode]);

  return (
    <>
      <div ref={anchorRef} className="matrix" role="img" aria-label="A small neural network gently turning in three dimensions, with the weights on its connections changing in fluorescent rainbow light.">
        <span className="sr-only">Layers of neurons joined by weighted connections; individual weights update as light travels along them.</span>
      </div>
      <div className="network-stage" aria-hidden="true"><canvas ref={canvasRef} /></div>
    </>
  );
}
