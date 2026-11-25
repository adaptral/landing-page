/*
 * Chart specs: what a ```chart (or ```table, ```stats) fence in a post holds, as JSON.
 * The full authoring reference, with an example of each, is .claude/skills/adaptral-blog/charts.md.
 *
 * A spec that does not parse or misses a field throws, which fails the build with the post's name:
 * a typo should never ship as a blank figure.
 */

export type Better = "higher" | "lower";

type Frame = {
  /** Small caps line above the title: the benchmark or dataset name. */
  eyebrow?: string;
  /** States the finding, not the topic: "Fine-tuned Qwen3-4B matches GPT-5 on extraction". */
  title: string;
  /** Metric, unit and direction: "Exact match on 500 held-out invoices, higher is better". */
  subtitle?: string;
  /** One sentence under the chart: what to take away. */
  takeaway?: string;
  /** Where the numbers come from, with n, trials and date: "Adaptral eval, n=500, 3 runs, Nov 2026". */
  source?: string;
  sourceUrl?: string;
  /** Value formatting: "$" + 1.25 + "/1M", decimals fixed per chart. */
  prefix?: string;
  unit?: string;
  decimals?: number;
};

export type BarDatum = { label: string; value: number; error?: number };
export type BarSpec = Frame & {
  type: "bar";
  /** One series: one bar per label. */
  data?: BarDatum[];
  /** Several series: one row per category, one thin bar per series. */
  categories?: string[];
  series?: { name: string; values: number[] }[];
  /** Labels drawn in the accent; every other bar is muted. Use for "our model". */
  highlight?: string[];
  better?: Better;
  sort?: "desc" | "asc" | "none";
};

export type LineSpec = Frame & {
  type: "line";
  xLabel?: string;
  yLabel?: string;
  /** Formats x values the same way prefix/unit/decimals format y. */
  xPrefix?: string;
  xUnit?: string;
  xScale?: "linear" | "log";
  /** "log" when values span orders of magnitude, e.g. monthly cost from $20 to $1M. */
  yScale?: "linear" | "log";
  yMin?: number;
  yMax?: number;
  series: { name: string; points: [number, number][] }[];
  better?: Better;
};

export type ScatterSpec = Frame & {
  type: "scatter";
  xLabel: string;
  yLabel: string;
  xPrefix?: string;
  xUnit?: string;
  xDecimals?: number;
  xScale?: "linear" | "log";
  yMin?: number;
  yMax?: number;
  points: { label: string; x: number; y: number; group?: string }[];
  highlight?: string[];
  /** Which corner is best. Cost on x and quality on y: "up-left". */
  better?: "up-left" | "up-right" | "down-left" | "down-right";
  /** Draw the Pareto frontier through the points nothing beats on both axes. */
  frontier?: boolean;
  /** Shade the best quarter and label it, e.g. "Most attractive". */
  quadrant?: string;
  labels?: "all" | "highlight" | "none";
};

export type TableColumn = { key: string; label: string; better?: Better; prefix?: string; unit?: string; decimals?: number };
export type TableCell = string | number | { value: number; error?: number } | null;
export type TableSpec = Omit<Frame, "prefix" | "unit" | "decimals"> & {
  type: "table";
  columns: TableColumn[];
  rows: Record<string, TableCell>[];
  /** Values in the first column whose row is "ours": accent bar on the left. */
  highlight?: string[];
};

export type StatsSpec = {
  type: "stats";
  items: { label: string; value: string; note?: string }[];
};

export type ChartSpec = BarSpec | LineSpec | ScatterSpec | TableSpec | StatsSpec;

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/** Parses and checks a fence body. `lang` is the fence language: chart, table or stats. */
export function parseSpec(raw: string, lang: string): ChartSpec {
  let s: Record<string, unknown>;
  try {
    s = JSON.parse(raw);
  } catch (e) {
    throw new Error(`[chart] a \`\`\`${lang} block is not valid JSON: ${(e as Error).message}`);
  }
  const type = lang === "chart" ? s.type : lang;
  const where = `[chart] ${String(s.title ?? type)}`;
  const need = (ok: unknown, why: string) => {
    if (!ok) throw new Error(`${where}: ${why}`);
  };
  need(["bar", "line", "scatter", "table", "stats"].includes(String(type)), "`type` must be bar, line or scatter");
  if (type !== "stats") need(typeof s.title === "string" && s.title, "needs a `title` that states the finding");

  if (type === "bar") {
    const b = s as BarSpec;
    need(b.data || (b.categories && b.series), "needs `data`, or `categories` with `series`");
    if (b.data) need(b.data.every((d) => d.label && isNum(d.value) && d.value >= 0), "every `data` item needs a label and a value of 0 or more");
    if (b.series) {
      need(b.series.length <= 8, "8 series at most; fold the rest into Other or split the chart");
      need(b.series.every((x) => x.values?.length === b.categories!.length && x.values.every(isNum)), "each series needs one number per category");
    }
  }
  if (type === "line") {
    const l = s as LineSpec;
    need(Array.isArray(l.series) && l.series.length > 0 && l.series.length <= 8, "needs 1-8 `series`");
    need(l.series.every((x) => x.name && x.points?.length > 1 && x.points.every((p) => isNum(p[0]) && isNum(p[1]))), "each series needs a name and [x, y] points");
    if (l.xScale === "log") need(l.series.every((x) => x.points.every((p) => p[0] > 0)), "a log x axis needs every x above 0");
    if (l.yScale === "log") need(l.series.every((x) => x.points.every((p) => p[1] > 0)), "a log y axis needs every y above 0");
  }
  if (type === "scatter") {
    const p = s as ScatterSpec;
    need(p.xLabel && p.yLabel, "needs `xLabel` and `yLabel`");
    need(Array.isArray(p.points) && p.points.every((d) => d.label && isNum(d.x) && isNum(d.y)), "every point needs a label, x and y");
    need(new Set(p.points.map((d) => d.group).filter(Boolean)).size <= 3, "3 groups at most on a scatter (colour-blind safety); facet or use `highlight`");
    if (p.xScale === "log") need(p.points.every((d) => d.x > 0), "a log x axis needs every x above 0");
  }
  if (type === "table") {
    const t = s as TableSpec;
    need(t.columns?.length && t.rows?.length, "needs `columns` and `rows`");
  }
  if (type === "stats") need(Array.isArray(s.items) && (s.items as unknown[]).length > 0, "needs `items`");
  return { ...s, type } as ChartSpec;
}

/** 1234.5 -> "1,234.5"; 25000 -> "25K". Decimals are fixed per chart so a column of values lines up. */
export function format(v: number, o: { prefix?: string; unit?: string; decimals?: number; compact?: boolean } = {}): string {
  const abs = o.compact === false ? 0 : Math.abs(v);
  let body: string;
  if (abs >= 1e9) body = `${trim(v / 1e9)}B`;
  else if (abs >= 1e6) body = `${trim(v / 1e6)}M`;
  else if (abs >= 1e4) body = `${trim(v / 1e3)}K`;
  else body = v.toLocaleString("en-US", { minimumFractionDigits: o.decimals ?? auto(v), maximumFractionDigits: o.decimals ?? auto(v) });
  return `${o.prefix ?? ""}${body}${o.unit ?? ""}`;
}
const trim = (n: number) => String(Number(n.toFixed(1)));
const auto = (v: number) => (Number.isInteger(v) ? 0 : Math.abs(v) < 1 ? 3 : Math.abs(v) < 10 ? 2 : 1);

/** A scale maps a value to 0..1 along an axis and lists the round ticks to label. */
export type Scale = { at: (v: number) => number; ticks: number[] };

export function linearScale(min: number, max: number, count = 5): Scale {
  if (min === max) [min, max] = [min - 1, max + 1];
  const raw = (max - min) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let t = lo; t <= hi + step / 2; t += step) ticks.push(Number(t.toPrecision(12)));
  return { at: (v) => (v - lo) / (hi - lo), ticks };
}

export function logScale(min: number, max: number): Scale {
  // The domain hugs the data (a fifth of a decade of air each side), not the surrounding decades,
  // so a $30-$1,600 range does not leave a blank $1,600-$10,000 band.
  const lo = Math.log10(min) - 0.2;
  const hi = Math.log10(max) + 0.2;
  const steps = hi - lo <= 3 ? [1, 2, 5] : [1];
  const ticks: number[] = [];
  for (let e = Math.floor(lo); e <= Math.ceil(hi); e++)
    for (const m of steps) {
      const t = m * 10 ** e;
      if (Math.log10(t) >= lo && Math.log10(t) <= hi) ticks.push(t);
    }
  return { at: (v) => (Math.log10(v) - lo) / (hi - lo), ticks };
}

/** The domain for an axis: the data range, padded, never cut off at the extremes. */
export function extent(values: number[], opts: { min?: number; max?: number; zero?: boolean; percent?: boolean } = {}): [number, number] {
  let lo = Math.min(...values);
  const hi = Math.max(...values);
  if (opts.zero) lo = Math.min(0, lo);
  const pad = (hi - lo || Math.abs(hi) || 1) * 0.06;
  // A percentage that never passes 100 gets an axis that stops at 100.
  const top = opts.percent && hi <= 100 ? Math.min(100, hi + pad) : hi + pad;
  return [opts.min ?? (opts.zero && lo >= 0 ? 0 : lo - pad), opts.max ?? top];
}
