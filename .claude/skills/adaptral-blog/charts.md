# Charts, tables and headline numbers

Every figure in a post is a fenced JSON block. It renders on the server as HTML and SVG, with a
"View data" table under each chart, so every number is in the page for readers, crawlers and AI
answer engines. A block that is not valid JSON or misses a field **fails the build** with the
chart's title in the error. The live reference is the draft post
`src/content/blog/chart-kit-reference.md` (open `/blog/chart-kit-reference` in `npm run dev`).

Code: `src/components/charts/` (spec.ts parses and checks, chart.tsx renders). Colours: the
`--series-*` tokens in `src/design/tokens.css`.

## Pick the form first

| The question the figure answers | Use |
| --- | --- |
| "What is the number?" (one to four headline results) | ```stats |
| "Which model is best on one measure?" | ```chart bar, one series, `highlight` the model under test |
| "How do they compare on several measures?" | ```table (exact values) or bar with `series` (shape) |
| "Which model gives the best quality for the money?" | ```chart scatter, cost on a log x axis, `frontier` |
| "How does it change with training data, steps or time?" | ```chart line |

Never a pie, a donut, a 3D chart, or two y axes. Two measures of different scale are two charts.

## The frame every chart shares

```json
{
  "eyebrow": "Invoice extraction · 500 held-out documents",
  "title": "A fine-tuned 4B model lands within a point of the frontier model",
  "subtitle": "Exact-match accuracy, %",
  "better": "higher",
  "takeaway": "Fine-tuning closes a 27-point gap; the rest is inside the error bars.",
  "source": "Adaptral eval, n=500, 3 runs, Nov 2026",
  "sourceUrl": "https://github.com/...",
  "prefix": "$", "unit": "%", "decimals": 1
}
```

- **title states the finding**, not the topic. "Fine-tuned Qwen3 4B matches GPT-5 mini" beats
  "Accuracy comparison".
- **subtitle names the metric, the unit and the direction.** `better` adds "↑ Higher is better".
- **source is required in spirit**: n, runs and date for our numbers; the publisher and date for
  outside numbers. Link it with `sourceUrl` when there is a page.
- **takeaway** is one sentence. It is what a skimmer remembers.
- **decimals** is fixed per chart so values line up. Pick the precision the error bars justify.

## bar

One series. Sorted by value (best first) unless `"sort": "none"`. Values must be 0 or more.

```json
{
  "type": "bar",
  "title": "...",
  "unit": "%",
  "better": "higher",
  "highlight": ["Qwen3 4B, fine-tuned"],
  "data": [
    { "label": "Frontier model", "value": 98.1, "error": 0.6 },
    { "label": "Qwen3 4B, fine-tuned", "value": 97.8, "error": 0.7 }
  ]
}
```

`highlight` draws those bars in the accent and mutes the rest: use it for the model the post is
about. `error` draws a ± whisker and prints the ±. For lower-is-better measures (cost, latency) set
`"better": "lower"`: the sort flips so the best is on top.

Several series: replace `data` with `categories` and `series` (8 series at most, colours in fixed
order, legend added automatically).

```json
{ "type": "bar", "title": "...", "unit": "%",
  "categories": ["Extraction", "Classification"],
  "series": [
    { "name": "Frontier model", "values": [98.1, 94.0] },
    { "name": "Fine-tuned 4B", "values": [97.8, 95.2] }
  ] }
```

## scatter (the signature chart)

Cost against quality, one dot per model.

```json
{
  "type": "scatter",
  "title": "...",
  "xLabel": "Cost per 1M requests, USD (log)",
  "yLabel": "Exact match, %",
  "xScale": "log", "xPrefix": "$", "unit": "%",
  "better": "up-left",
  "frontier": true,
  "quadrant": "Most attractive",
  "highlight": ["Qwen3 4B FT"],
  "points": [
    { "label": "Frontier A", "x": 1620, "y": 98.1 },
    { "label": "Qwen3 4B FT", "x": 41, "y": 97.8 }
  ]
}
```

- `xScale: "log"` whenever cost spans more than 10x (it almost always does). Every x must be above 0.
- `better` names the best corner; `frontier` draws the Pareto line through the models nothing beats
  on both axes; `quadrant` shades the best quarter with that label.
- Colour: `highlight` (accent vs muted), or `group` on each point (at most 3 groups, e.g. "Frontier
  API", "Open base", "Fine-tuned"). More than 3 groups fails: colour-blind readers cannot separate them.
- Labels are placed to avoid overlap; a label that cannot fit is dropped and the point keeps its
  tooltip and table row. On phones only highlighted points are labelled. Keep labels short.

## line

```json
{
  "type": "line",
  "title": "...",
  "xLabel": "Training examples", "yLabel": "Exact match, %", "unit": "%",
  "series": [
    { "name": "Qwen3 4B", "points": [[250, 78.0], [500, 86.5], [1000, 92.8]] }
  ]
}
```

Up to 8 series; 4 or fewer get their names at the line ends when the ends do not crowd. Points get
markers (with tooltips) when every series has 24 points or fewer. `xScale: "log"` for data size,
`yScale: "log"` when values span orders of magnitude (monthly cost at 100K vs 100M requests).
`yMin`/`yMax` pin the axis; percentages stop at 100 automatically.

## table (benchmark table)

Exact numbers. The best value in each column with `better` is bold; `{ "value", "error" }` cells print
"98.1 ± 0.6"; `highlight` marks a row by its first-column value.

```json
{
  "type": "table",
  "title": "Same accuracy, 40x cheaper, 16x faster",
  "columns": [
    { "key": "model", "label": "Model" },
    { "key": "acc", "label": "Exact match", "better": "higher", "unit": "%", "decimals": 1 },
    { "key": "cost", "label": "$ / 1M req", "better": "lower", "prefix": "$", "decimals": 0 }
  ],
  "rows": [
    { "model": "Frontier model", "acc": { "value": 98.1, "error": 0.6 }, "cost": 1620 },
    { "model": "Qwen3 4B, fine-tuned", "acc": { "value": 97.8, "error": 0.7 }, "cost": 41 }
  ],
  "highlight": ["Qwen3 4B, fine-tuned"],
  "source": "Adaptral eval · 500 documents · 3 runs"
}
```

(In a ```table fence `"type"` can be left out.)

## stats

When the answer is a number. Values are pre-formatted strings.

```json
{ "items": [
  { "label": "Cost per 1M requests", "value": "$41", "note": "vs $1,620 on the frontier model" },
  { "label": "p50 latency", "value": "38 ms", "note": "vs 610 ms" }
] }
```

## Rules every figure follows

- Colours come in fixed slot order and follow the entity, never its rank. Never set colours by hand.
- A model keeps the same name everywhere in a post: chart labels, table rows and prose.
- Numbers in the chart, the table, the TL;DR and the Method section match exactly.
- Status colours (green pass, red fail) are not series colours and never appear in charts.
