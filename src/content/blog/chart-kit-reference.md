---
title: "Chart kit: every block a post can use"
description: "A working reference for the blog's charts, benchmark tables and headline numbers. Draft only: it renders in next dev and never ships. All numbers here are illustrative."
date: "2026-11-21"
author: "The Adaptral team"
tag: "Guide"
draft: true
tldr:
  - "Every chart is a fenced JSON block, rendered on the server, so its numbers are in the HTML."
  - "Each chart gets a title that states the finding, a subtitle with the metric and direction, and a source."
  - "All numbers on this page are made up to show the layout. Never copy them into a real post."
resources:
  - label: "Chart authoring reference"
    url: "https://github.com/adaptral/landing-page/blob/main/.claude/skills/adaptral-blog/charts.md"
---

This page shows each block the blog can render, with the Markdown that produces it. It is a draft, so it only appears in `npm run dev`. **Every number below is illustrative.**

## Headline numbers

Use `stats` when the answer is a number, not a chart.

```stats
{
  "items": [
    { "label": "Cost per 1M requests", "value": "$41", "note": "vs $1,620 on the frontier model" },
    { "label": "p50 latency", "value": "38 ms", "note": "vs 610 ms" },
    { "label": "Exact match", "value": "97.8%", "note": "vs 98.1%" }
  ]
}
```

## Bar chart

One series, sorted, with the model under test highlighted and the others muted.

```chart
{
  "type": "bar",
  "eyebrow": "Invoice extraction · 500 held-out documents",
  "title": "A fine-tuned 4B model lands within a point of the frontier model",
  "subtitle": "Exact-match accuracy, %",
  "better": "higher",
  "unit": "%",
  "decimals": 1,
  "highlight": ["Qwen3 4B, fine-tuned"],
  "data": [
    { "label": "Frontier model A", "value": 98.1, "error": 0.6 },
    { "label": "Qwen3 4B, fine-tuned", "value": 97.8, "error": 0.7 },
    { "label": "Frontier model B", "value": 96.4, "error": 0.8 },
    { "label": "Qwen3 4B, base", "value": 71.2, "error": 1.9 },
    { "label": "Gemma 3 4B, base", "value": 66.0, "error": 2.1 }
  ],
  "takeaway": "Fine-tuning closes a 27-point gap; the remaining difference is inside the error bars.",
  "source": "Illustrative data, not a real run"
}
```

## Grouped bars

Several measures per category. Legend on top, colours in fixed slot order.

```chart
{
  "type": "bar",
  "eyebrow": "Three tasks",
  "title": "The fine-tuned model holds up across all three tasks",
  "subtitle": "Accuracy, %",
  "unit": "%",
  "categories": ["Extraction", "Classification", "Routing"],
  "series": [
    { "name": "Frontier model", "values": [98.1, 94.0, 91.5] },
    { "name": "Fine-tuned 4B", "values": [97.8, 95.2, 90.1] },
    { "name": "Base 4B", "values": [71.2, 80.4, 62.3] }
  ],
  "source": "Illustrative data, not a real run"
}
```

## Cost against quality

The signature chart: cost on a log axis, quality up, the Pareto frontier and the best corner marked.

```chart
{
  "type": "scatter",
  "eyebrow": "Price vs accuracy",
  "title": "Small fine-tuned models sit on the frontier at a fraction of the price",
  "subtitle": "Cost per 1M requests (log scale) against exact-match accuracy",
  "xLabel": "Cost per 1M requests, USD (log)",
  "yLabel": "Exact match, %",
  "xScale": "log",
  "xPrefix": "$",
  "unit": "%",
  "better": "up-left",
  "frontier": true,
  "quadrant": "Most attractive",
  "highlight": ["Qwen3 4B FT", "Gemma 3 4B FT"],
  "points": [
    { "label": "Frontier A", "x": 1620, "y": 98.1 },
    { "label": "Frontier B", "x": 540, "y": 96.4 },
    { "label": "Mid-size API", "x": 180, "y": 91.0 },
    { "label": "Qwen3 4B FT", "x": 41, "y": 97.8 },
    { "label": "Gemma 3 4B FT", "x": 38, "y": 96.9 },
    { "label": "Qwen3 4B base", "x": 41, "y": 71.2 },
    { "label": "Llama 3.2 3B base", "x": 30, "y": 64.5 }
  ],
  "takeaway": "Anything above and left of the line beats everything else on both axes.",
  "source": "Illustrative data, not a real run"
}
```

## Line chart

Change over a continuous x: training steps, data size, time.

```chart
{
  "type": "line",
  "eyebrow": "Learning curve",
  "title": "Two thousand labelled examples get the 4B model to frontier accuracy",
  "subtitle": "Exact match by training-set size",
  "xLabel": "Training examples",
  "yLabel": "Exact match, %",
  "unit": "%",
  "better": "higher",
  "series": [
    { "name": "Qwen3 4B", "points": [[250, 78.0], [500, 86.5], [1000, 92.8], [2000, 97.1], [4000, 97.8]] },
    { "name": "Gemma 3 4B", "points": [[250, 74.2], [500, 83.0], [1000, 90.4], [2000, 95.6], [4000, 96.9]] }
  ],
  "source": "Illustrative data, not a real run"
}
```

## Benchmark table

Real rows, the best value per column in bold, ± error, the model under test marked.

```table
{
  "eyebrow": "Head to head",
  "title": "Same accuracy, 40x cheaper, 16x faster",
  "columns": [
    { "key": "model", "label": "Model" },
    { "key": "acc", "label": "Exact match", "better": "higher", "unit": "%", "decimals": 1 },
    { "key": "cost", "label": "$ / 1M req", "better": "lower", "prefix": "$", "decimals": 0 },
    { "key": "p50", "label": "p50 ms", "better": "lower", "decimals": 0 }
  ],
  "rows": [
    { "model": "Frontier model A", "acc": { "value": 98.1, "error": 0.6 }, "cost": 1620, "p50": 610 },
    { "model": "Qwen3 4B, fine-tuned", "acc": { "value": 97.8, "error": 0.7 }, "cost": 41, "p50": 38 },
    { "model": "Qwen3 4B, base", "acc": { "value": 71.2, "error": 1.9 }, "cost": 41, "p50": 37 }
  ],
  "highlight": ["Qwen3 4B, fine-tuned"],
  "source": "Illustrative data · 500 documents · 3 runs"
}
```

## Plain Markdown still works

| Model | Context | Licence |
| --- | --- | --- |
| Qwen3 4B | 32K | Apache 2.0 |
| Gemma 3 4B | 128K | Gemma terms |

> A blockquote for the one line a reader should remember.

```details
Show the eval command and its output
$ adaptral eval --task invoices --model qwen3-4b-ft
exact_match  0.978 ± 0.007   n=500
```

## FAQ

### Do charts need JavaScript?

No. Every chart is rendered to HTML and SVG on the server, and the hover tooltips are plain CSS. A reader with scripts off, a search crawler and an AI answer engine all see the same numbers, and the data table under each chart carries them in text.

### Where is the full reference?

The authoring reference is in `.claude/skills/adaptral-blog/charts.md`. It lists every field for each block, when to use which chart, and the rules for colour, direction and sources that every chart on the blog has to follow.
