---
title: "Signal layout reference: how a dispatch renders"
description: "A draft that shows the Signal template: masthead, body, a chart, numbered sources and the facts rail. It renders in next dev only and never ships."
date: "2026-11-21"
author: "The Adaptral team"
format: "Benchmark"
topic: "Template"
draft: true
sources:
  - label: "llms.txt: a proposal for LLM-readable site indexes"
    url: "https://llmstxt.org/"
  - label: "Google Search Central: Article structured data"
    url: "https://developers.google.com/search/docs/appearance/structured-data/article"
---

A Signal post is a dated dispatch on one thing that changed this week, with one opinion stated in the first 150 words. This draft exists to show the layout; its chart is illustrative.

## What a dispatch carries

Every post carries one original asset: a run we did, a measured number, or a synthesis of at least five cited sources. The sources list below is rendered from frontmatter, numbered, with the host shown so a reader can judge it before clicking.

```chart
{
  "type": "bar",
  "eyebrow": "Example",
  "title": "One chart is usually enough for a dispatch",
  "subtitle": "Tokens per second on one GPU",
  "better": "higher",
  "highlight": ["New release"],
  "data": [
    { "label": "New release", "value": 182 },
    { "label": "Previous version", "value": 131 },
    { "label": "Closest rival", "value": 118 }
  ],
  "source": "Illustrative data, not a real run"
}
```

## Why it is separate from the blog

The blog is evergreen and ranks for years. Signal is fast and dated, so it lives in its own folder and URL space, and any dispatch that earns no search impressions in 30 days can be merged or removed without touching the blog.
