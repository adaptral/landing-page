import type { CSSProperties, ReactNode } from "react";
import {
  extent,
  format,
  linearScale,
  logScale,
  parseSpec,
  type BarSpec,
  type ChartSpec,
  type LineSpec,
  type Scale,
  type ScatterSpec,
  type StatsSpec,
  type TableCell,
  type TableSpec,
} from "./spec";

/*
 * Server-rendered charts for posts. Every number is in the HTML (crawlers and AI answer engines read
 * it), every chart has a "View data" table, and the hover tooltips are CSS, so no chart ships JavaScript.
 * Marks follow the data-viz rules: categorical colours in fixed slot order (tokens.css), 2px lines,
 * bars at most 24px thick with rounded data ends, recessive hairline grid, text in ink, never in the
 * series colour. Text is HTML laid over an SVG plot, so it stays readable at phone width.
 */

const slot = (i: number) => `var(--series-${(i % 8) + 1})`;
const MUTED = "var(--series-muted)";
const pct = (v: number) => `${(v * 100).toFixed(3)}%`;

export function Chart({ raw, lang }: { raw: string; lang: string }) {
  const spec = parseSpec(raw, lang);
  switch (spec.type) {
    case "bar":
      return <Bars spec={spec} />;
    case "line":
      return <Line spec={spec} />;
    case "scatter":
      return <Scatter spec={spec} />;
    case "table":
      return <BenchTable spec={spec} />;
    case "stats":
      return <Stats spec={spec} />;
  }
}

/* ── Frame: eyebrow, title, subtitle, legend, plot, takeaway, source, data table ────────────────── */

type Legend = { name: string; color: string }[];

function Frame({
  spec,
  better,
  legend,
  data,
  children,
}: {
  spec: Exclude<ChartSpec, StatsSpec>;
  better?: string;
  legend?: Legend;
  data?: { head: string[]; rows: (string | number)[][] };
  children: ReactNode;
}) {
  return (
    <figure className="viz" data-type={spec.type}>
      <div className="viz-head">
        {(spec.eyebrow || better) && (
          <p className="viz-eyebrow">
            {spec.eyebrow && <span>{spec.eyebrow}</span>}
            {better && <span className="viz-better">{better}</span>}
          </p>
        )}
        <p className="viz-title">{spec.title}</p>
        {spec.subtitle && <p className="viz-subtitle">{spec.subtitle}</p>}
      </div>
      {legend && legend.length > 1 && (
        <ul className="viz-legend" aria-label="Legend">
          {legend.map((l) => (
            <li key={l.name}>
              <i style={{ background: l.color }} aria-hidden="true" />
              {l.name}
            </li>
          ))}
        </ul>
      )}
      <div className="viz-body">{children}</div>
      {(spec.takeaway || spec.source) && (
        <figcaption className="viz-caption">
          {spec.takeaway && <p className="viz-takeaway">{spec.takeaway}</p>}
          {spec.source && (
            <p className="viz-source">
              Source:{" "}
              {spec.sourceUrl ? (
                <a href={spec.sourceUrl} rel="noopener">
                  {spec.source}
                </a>
              ) : (
                spec.source
              )}
            </p>
          )}
        </figcaption>
      )}
      {data && (
        <details className="viz-data">
          <summary>View data</summary>
          <div className="viz-table-wrap">
            <table className="viz-table">
              <thead>
                <tr>
                  {data.head.map((h) => (
                    <th key={h} scope="col">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r, i) => (
                  <tr key={i}>
                    {r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </figure>
  );
}

const direction = (b?: string) =>
  b === "higher" ? "↑ Higher is better" : b === "lower" ? "↓ Lower is better" : undefined;

/* ── Bars: horizontal, one series or grouped ───────────────────────────────────────────────────── */

function Bars({ spec }: { spec: BarSpec }) {
  const fmt = (v: number) => format(v, spec);
  const hl = new Set(spec.highlight ?? []);

  if (spec.data) {
    const sort = spec.sort ?? (spec.better === "lower" ? "asc" : "desc");
    const data = sort === "none" ? spec.data : [...spec.data].sort((a, b) => (sort === "asc" ? a.value - b.value : b.value - a.value));
    // The longest bar ends at 80% of the track, so its value label still fits after it.
    const max = Math.max(...data.map((d) => d.value + (d.error ?? 0))) / 0.8 || 1;
    return (
      <Frame
        spec={spec}
        better={direction(spec.better)}
        data={{ head: ["", spec.unit ? `Value (${spec.unit.trim()})` : "Value", ...(data.some((d) => d.error) ? ["±"] : [])], rows: data.map((d) => [d.label, fmt(d.value), ...(d.error ? [fmt(d.error)] : [])]) }}
      >
        <div className="viz-bars">
          {data.map((d) => {
            const on = hl.size === 0 || hl.has(d.label);
            return (
              <div className="viz-bar-row" key={d.label} data-hl={hl.has(d.label) || undefined}>
                <span className="viz-bar-label">{d.label}</span>
                <span className="viz-bar-track">
                  <span className="viz-bar" style={{ width: pct(d.value / max), background: on ? slot(0) : MUTED }} />
                  {d.error ? (
                    <span className="viz-err" style={{ left: pct((d.value - d.error) / max), width: pct((2 * d.error) / max) }} aria-hidden="true" />
                  ) : null}
                  <span className="viz-bar-value" style={{ left: pct((d.value + (d.error ?? 0)) / max) }}>
                    {fmt(d.value)}
                    {d.error ? <small> ±{fmt(d.error)}</small> : null}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </Frame>
    );
  }

  const series = spec.series!;
  const cats = spec.categories!;
  const max = Math.max(...series.flatMap((s) => s.values)) / 0.8 || 1;
  return (
    <Frame
      spec={spec}
      better={direction(spec.better)}
      legend={series.map((s, i) => ({ name: s.name, color: slot(i) }))}
      data={{ head: ["", ...series.map((s) => s.name)], rows: cats.map((c, ci) => [c, ...series.map((s) => fmt(s.values[ci]))]) }}
    >
      <div className="viz-bars viz-bars-grouped">
        {cats.map((c, ci) => (
          <div className="viz-bar-row" key={c}>
            <span className="viz-bar-label">{c}</span>
            <span className="viz-bar-group">
              {series.map((s, si) => (
                <span className="viz-bar-track" key={s.name} title={`${s.name}: ${fmt(s.values[ci])}`}>
                  <span className="viz-bar" style={{ width: pct(s.values[ci] / max), background: slot(si) }} />
                  <span className="viz-bar-value" style={{ left: pct(s.values[ci] / max) }}>
                    {fmt(s.values[ci])}
                  </span>
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* ── Plot: the shared x/y frame for line and scatter ───────────────────────────────────────────── */

function Plot({
  x,
  y,
  xFmt,
  yFmt,
  xLabel,
  yLabel,
  svg,
  children,
  wide,
}: {
  x: Scale;
  y: Scale;
  xFmt: (v: number) => string;
  yFmt: (v: number) => string;
  xLabel?: string;
  yLabel?: string;
  svg: ReactNode;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="viz-plot" data-endlabels={wide || undefined}>
      {yLabel && <p className="viz-axis-title viz-axis-y">{yLabel}</p>}
      <div className="viz-area">
        <svg className="viz-svg" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
          {y.ticks.map((t) => (
            <line key={`y${t}`} className={t === y.ticks[0] ? "viz-baseline" : "viz-grid"} x1="0" x2="1000" y1={(1 - y.at(t)) * 1000} y2={(1 - y.at(t)) * 1000} />
          ))}
          {svg}
        </svg>
        {y.ticks.map((t) => (
          <span key={`yt${t}`} className="viz-ytick" style={{ top: pct(1 - y.at(t)) }}>
            {yFmt(t)}
          </span>
        ))}
        {x.ticks.map((t) => (
          <span key={`xt${t}`} className="viz-xtick" data-minor={!/^1(0*)$/.test(String(t)) && x.ticks.length > 6 ? true : undefined} style={{ left: pct(x.at(t)) }}>
            {xFmt(t)}
          </span>
        ))}
        {children}
      </div>
      {xLabel && <p className="viz-axis-title viz-axis-x">{xLabel}</p>}
    </div>
  );
}

function Dot({ left, top, color, tip, label, side, minor }: { left: number; top: number; color: string; tip: string; label?: string; side?: "left" | "right"; minor?: boolean }) {
  // Focusable, so a tap on a phone or Tab on a keyboard opens the tooltip too.
  return (
    <span className="viz-dot" tabIndex={0} aria-label={tip} style={{ left: pct(left), top: pct(top), "--c": color } as CSSProperties}>
      <span className="viz-tip" aria-hidden="true">
        {tip}
      </span>
      {label && (
        <span className="viz-dot-label" data-side={side} data-minor={minor || undefined}>
          {label}
        </span>
      )}
    </span>
  );
}

/* ── Line: change over a continuous x (training steps, data size, time) ────────────────────────── */

function Line({ spec }: { spec: LineSpec }) {
  const xs = spec.series.flatMap((s) => s.points.map((p) => p[0]));
  const ys = spec.series.flatMap((s) => s.points.map((p) => p[1]));
  const x = spec.xScale === "log" ? logScale(Math.min(...xs), Math.max(...xs)) : linearScale(Math.min(...xs), Math.max(...xs));
  const y =
    spec.yScale === "log"
      ? logScale(Math.min(...ys), Math.max(...ys))
      : linearScale(...extent(ys, { min: spec.yMin, max: spec.yMax, percent: spec.unit === "%" }));
  const yFmt = (v: number) => format(v, spec);
  const xFmt = (v: number) => format(v, { prefix: spec.xPrefix, unit: spec.xUnit });
  const markers = spec.series.every((s) => s.points.length <= 24);

  // Name the line at its end when the ends are far enough apart; otherwise the legend carries it.
  const ends = spec.series.map((s) => 1 - y.at(s.points[s.points.length - 1][1])).sort((a, b) => a - b);
  const endLabels = spec.series.length <= 4 && ends.every((e, i) => i === 0 || e - ends[i - 1] > 0.07);

  return (
    <Frame
      spec={spec}
      better={direction(spec.better)}
      legend={spec.series.map((s, i) => ({ name: s.name, color: slot(i) }))}
      data={{
        head: [spec.xLabel ?? "x", ...spec.series.map((s) => s.name)],
        rows: [...new Set(xs)].sort((a, b) => a - b).map((xv) => [xFmt(xv), ...spec.series.map((s) => {
          const p = s.points.find((q) => q[0] === xv);
          return p ? yFmt(p[1]) : "";
        })]),
      }}
    >
      <Plot
        x={x}
        y={y}
        xFmt={xFmt}
        yFmt={yFmt}
        xLabel={spec.xLabel}
        yLabel={spec.yLabel}
        wide={endLabels && spec.series.length > 1}
        svg={spec.series.map((s, i) => (
          <polyline
            key={s.name}
            className="viz-line"
            style={{ stroke: slot(i) }}
            points={s.points.map((p) => `${x.at(p[0]) * 1000},${(1 - y.at(p[1])) * 1000}`).join(" ")}
          />
        ))}
      >
        {spec.series.flatMap((s, i) =>
          s.points.map((p, j) => {
            const last = j === s.points.length - 1;
            if (!markers && !last) return null;
            return (
              <Dot
                key={`${s.name}${j}`}
                left={x.at(p[0])}
                top={1 - y.at(p[1])}
                color={slot(i)}
                tip={`${s.name} · ${xFmt(p[0])}: ${yFmt(p[1])}`}
                label={last && endLabels && spec.series.length > 1 ? s.name : undefined}
                side="right"
              />
            );
          }),
        )}
      </Plot>
    </Frame>
  );
}

/* ── Scatter: two measures per model, e.g. cost against quality ────────────────────────────────── */

function Scatter({ spec }: { spec: ScatterSpec }) {
  const pts = spec.points;
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const log = spec.xScale === "log";
  const x = log ? logScale(Math.min(...xs), Math.max(...xs)) : linearScale(...extent(xs));
  const y = linearScale(...extent(ys, { min: spec.yMin, max: spec.yMax, percent: spec.unit === "%" }));
  const xFmt = (v: number) => format(v, { prefix: spec.xPrefix, unit: spec.xUnit, decimals: spec.xDecimals });
  const yFmt = (v: number) => format(v, spec);

  const groups = [...new Set(pts.map((p) => p.group).filter(Boolean))] as string[];
  const hl = new Set(spec.highlight ?? []);
  const color = (p: (typeof pts)[number]) =>
    groups.length ? slot(groups.indexOf(p.group!)) : hl.size === 0 || hl.has(p.label) ? slot(0) : MUTED;
  const labelled = (p: (typeof pts)[number]) =>
    spec.labels === "none" ? false : spec.labels === "highlight" ? hl.has(p.label) : spec.labels === "all" || pts.length <= 12 || hl.has(p.label);

  const better = spec.better ?? "up-left";
  const left = better.endsWith("left");
  const up = better.startsWith("up");

  // Pareto frontier: walk from the best x, keep each point that beats every earlier one on y.
  let frontier: typeof pts = [];
  if (spec.frontier) {
    const sorted = [...pts].sort((a, b) => (left ? a.x - b.x : b.x - a.x));
    let bestY = -Infinity;
    for (const p of sorted) {
      const score = up ? p.y : -p.y;
      if (score > bestY) {
        frontier.push(p);
        bestY = score;
      }
    }
    frontier = frontier.sort((a, b) => a.x - b.x);
  }

  const qx = left ? [0, 500] : [500, 1000];
  const qy = up ? [0, 500] : [500, 1000];

  return (
    <Frame
      spec={spec}
      legend={groups.map((g, i) => ({ name: g, color: slot(i) }))}
      data={{
        head: ["", ...(groups.length ? ["Group"] : []), spec.xLabel, spec.yLabel],
        rows: pts.map((p) => [p.label, ...(groups.length ? [p.group ?? ""] : []), xFmt(p.x), yFmt(p.y)]),
      }}
    >
      <Plot
        x={x}
        y={y}
        xFmt={xFmt}
        yFmt={yFmt}
        xLabel={spec.xLabel}
        yLabel={spec.yLabel}
        svg={
          <>
            {spec.quadrant && <rect className="viz-quadrant" x={qx[0]} y={qy[0]} width="500" height="500" />}
            {x.ticks.map((t) => (
              <line key={`x${t}`} className="viz-grid" y1="0" y2="1000" x1={x.at(t) * 1000} x2={x.at(t) * 1000} />
            ))}
            {frontier.length > 1 && (
              <polyline className="viz-frontier" points={frontier.map((p) => `${x.at(p.x) * 1000},${(1 - y.at(p.y)) * 1000}`).join(" ")} />
            )}
          </>
        }
      >
        {spec.quadrant && (
          <span className="viz-quadrant-label" data-left={left || undefined} data-up={up || undefined}>
            {spec.quadrant}
          </span>
        )}
        {placeLabels(pts.map((p) => ({ ...p, left: x.at(p.x), top: 1 - y.at(p.y), show: labelled(p), first: hl.has(p.label) }))).map((p) => (
          <Dot
            key={p.label}
            left={p.left}
            top={p.top}
            color={color(p)}
            tip={`${p.label} · ${xFmt(p.x)}, ${yFmt(p.y)}`}
            label={p.side ? p.label : undefined}
            side={p.side}
            minor={!hl.has(p.label)}
          />
        ))}
      </Plot>
    </Frame>
  );
}

/**
 * Puts each label beside its dot without overlapping another label. Highlighted points go first.
 * A label tries the right side, then the left; if both collide it is dropped, and the point keeps
 * its tooltip and its row in the data table. Sizes are estimates in plot fractions (about 0.9% of
 * the width per character, 4.5% of the height per line), good enough at blog widths.
 */
function placeLabels<T extends { label: string; left: number; top: number; show: boolean; first: boolean }>(pts: T[]) {
  const boxes: [number, number, number, number][] = [];
  const hit = (b: [number, number, number, number]) =>
    b[0] < 0 || b[2] > 1.02 || boxes.some((o) => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]);
  const order = [...pts].sort((a, b) => Number(b.first) - Number(a.first));
  const side = new Map<string, "left" | "right">();
  for (const p of order) {
    if (!p.show) continue;
    const w = p.label.length * 0.009 + 0.02;
    const h = 0.045;
    const sides: ["right" | "left", [number, number, number, number]][] = [
      ["right", [p.left + 0.012, p.top - h / 2, p.left + 0.012 + w, p.top + h / 2]],
      ["left", [p.left - 0.012 - w, p.top - h / 2, p.left - 0.012, p.top + h / 2]],
    ];
    if (p.left > 0.72) sides.reverse();
    const fit = sides.find(([, b]) => !hit(b));
    if (fit) {
      boxes.push(fit[1]);
      side.set(p.label, fit[0]);
    }
  }
  return pts.map((p) => ({ ...p, side: side.get(p.label) }));
}

/* ── Benchmark table: real rows, best value per column in bold, ± error ───────────────────────── */

function cellValue(c: TableCell): number | null {
  if (typeof c === "number") return c;
  if (c && typeof c === "object") return c.value;
  return null;
}

function BenchTable({ spec }: { spec: TableSpec }) {
  const hl = new Set(spec.highlight ?? []);
  const first = spec.columns[0].key;
  const best: Record<string, number> = {};
  for (const col of spec.columns) {
    if (!col.better) continue;
    const vals = spec.rows.map((r) => cellValue(r[col.key])).filter((v): v is number => v !== null);
    if (vals.length) best[col.key] = col.better === "higher" ? Math.max(...vals) : Math.min(...vals);
  }
  return (
    <Frame spec={{ ...spec }}>
      <div className="viz-table-wrap">
        <table className="viz-table viz-bench">
          <thead>
            <tr>
              {spec.columns.map((c) => (
                <th key={c.key} scope="col">
                  {c.label}
                  {c.better && <span className="viz-th-dir">{c.better === "higher" ? " ↑" : " ↓"}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {spec.rows.map((r, i) => (
              <tr key={i} data-hl={hl.has(String(r[first])) || undefined}>
                {spec.columns.map((c, j) => {
                  const cell = r[c.key];
                  const v = cellValue(cell);
                  const text =
                    v === null
                      ? String(cell ?? "–")
                      : format(v, { ...c, compact: false }) + (typeof cell === "object" && cell?.error ? ` ± ${format(cell.error, { decimals: c.decimals })}` : "");
                  const isBest = v !== null && best[c.key] === v;
                  return j === 0 ? (
                    <th key={c.key} scope="row">
                      {text}
                    </th>
                  ) : (
                    <td key={c.key} data-best={isBest || undefined}>
                      {text}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Frame>
  );
}

/* ── Stats: when the answer is a number, not a chart ───────────────────────────────────────────── */

function Stats({ spec }: { spec: StatsSpec }) {
  return (
    <dl className="viz-stats">
      {spec.items.map((s) => (
        <div key={s.label}>
          <dt>{s.label}</dt>
          <dd>{s.value}</dd>
          {s.note && <dd className="viz-stat-note">{s.note}</dd>}
        </div>
      ))}
    </dl>
  );
}
