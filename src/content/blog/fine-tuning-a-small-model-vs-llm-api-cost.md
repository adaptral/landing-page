---
title: "Fine-tuning a small model vs an LLM API: when the cost math works"
seoTitle: "Fine-tuning a small model vs an LLM API: the cost math"
description: "Fine-tuning a small model beats a flagship LLM API on cost from about 365,000 requests a month. Real list prices, the break-even math, and when to skip it."
date: "2026-11-25"
author: "Divyanshu Shekhar"
tag: "Guide"
tldr:
  - "At list prices, a flagship API costs about $16,000 per million requests of 1,000 tokens in and 200 out."
  - "A fine-tuned 8B model on one always-on H100 costs about $5,840 a month, so it wins on cost above roughly 365,000 requests a month."
  - "The vendors' small tiers cost about $200 per million requests. Against them, the case for fine-tuning rests on accuracy."
  - "Training is the cheap part: an 18M-token run costs under $7. Building the data and the eval set takes the time."
primary_keyword: "fine-tuning a small model"
secondary_keywords: ["small language model", "LoRA", "frontier model", "break-even", "LLM cost"]
inclusion_tier: "CONTEXTUAL"
---

Your app sends the same narrow request to a frontier model thousands of times an hour, such as pulling six fields out of an invoice. Fine-tuning a small model for that one job is the usual way to cut the LLM cost. Here is that claim checked against list prices read on November 25, 2026, with the request volume where it starts to hold.

Against a flagship model, fine-tuning pays back fast. Against the vendors' own small tiers it mostly doesn't, on cost alone.

```stats
{
  "items": [
    { "label": "Flagship API", "value": "$16,000", "note": "per 1M requests, GPT-6.2 Astra list price" },
    { "label": "Fine-tuned 8B", "value": "$5,840", "note": "per month on one always-on H100, Fireworks list price" },
    { "label": "Break-even", "value": "365K", "note": "requests a month against the flagship" },
    { "label": "Small API tier", "value": "$200", "note": "per 1M requests, GPT-6 Luna or Claude Haiku 5.5" }
  ]
}
```

## What a narrow LLM call costs at volume

Per-token prices hide the number you pay, so convert them to cost per million requests. The examples below assume a typical extraction or classification call: 1,000 input tokens (instructions, a few examples, the document) and 200 output tokens (a JSON object). Your mix will differ; the method holds.

Prices are standard-tier list prices with no batch or caching discount, taken from the [OpenAI](https://developers.openai.com/api/docs/pricing), [Anthropic](https://platform.claude.com/docs/en/about-claude/pricing) and [Google](https://aistudio.google.com/docs/pricing) price pages, plus [Together AI](https://www.together.ai/pricing) and [DeepInfra](https://deepinfra.com/pricing) for open models.

```table
{
  "eyebrow": "List prices, November 25, 2026",
  "title": "A flagship call costs 80x what a small tier does for the same request",
  "subtitle": "USD per 1M tokens, and per 1M requests of 1,000 input and 200 output tokens",
  "columns": [
    { "key": "model", "label": "Model" },
    { "key": "kind", "label": "Kind" },
    { "key": "in", "label": "Input / 1M tok", "prefix": "$", "decimals": 2 },
    { "key": "out", "label": "Output / 1M tok", "prefix": "$", "decimals": 2 },
    { "key": "req", "label": "Per 1M requests", "better": "lower", "prefix": "$", "decimals": 0 }
  ],
  "rows": [
    { "model": "GPT-6.2 Astra", "kind": "Flagship API", "in": 8, "out": 40, "req": 16000 },
    { "model": "Claude Fable 5.2", "kind": "Flagship API", "in": 8, "out": 40, "req": 16000 },
    { "model": "Claude Opus 5.5", "kind": "Large API", "in": 4, "out": 20, "req": 8000 },
    { "model": "Gemini 4 Carbon", "kind": "Flagship API", "in": 4, "out": 20, "req": 8000 },
    { "model": "Gemini 3.5 Flash-Lite", "kind": "Small API", "in": 0.3, "out": 2.5, "req": 800 },
    { "model": "GPT-6 Luna", "kind": "Small API", "in": 0.1, "out": 0.5, "req": 200 },
    { "model": "Claude Haiku 5.5", "kind": "Small API", "in": 0.1, "out": 0.5, "req": 200 },
    { "model": "Gemini 2.5 Flash-Lite", "kind": "Small API", "in": 0.1, "out": 0.4, "req": 180 },
    { "model": "Qwen3.5 9B (Together)", "kind": "Open, base", "in": 0.17, "out": 0.25, "req": 220 },
    { "model": "Llama 3.1 8B (DeepInfra)", "kind": "Open, base", "in": 0.02, "out": 0.04, "req": 28 }
  ],
  "takeaway": "The spread between the top row and the bottom row is about 570x for the same request shape.",
  "source": "Provider price pages, read 2026-11-25. Gemini 4 Carbon at its list price from December 1, 2026 ($2 / $10 until November 30)."
}
```

The flagship rows are where the bill comes from. A workflow that sends 3 million of these requests a month to GPT-6.2 Astra costs about $48,000 a month, every month.

## What fine-tuning a small model costs

Two costs matter for a small language model of about 8 billion parameters: training it once, and serving it every month.

Training is cheap. Together AI lists $0.34 to $0.38 per million training tokens for Llama 3.1 8B and Qwen3.5 9B fine-tuning, and counts tokens as "training dataset size × number of epochs", with a [$4 minimum per job](https://docs.together.ai/docs/fine-tuning/pricing.md).

Take 5,000 labelled examples of about 1,200 tokens, trained for 3 epochs: 18 million tokens, so $6.12 to $6.84. Even ten retraining rounds cost less than a team lunch.

Serving costs more, and it is billed by the hour. Together's docs say "serverless inference can't serve post-training adapters", so a fine-tuned [LoRA](https://arxiv.org/abs/2106.09685) adapter runs on a [dedicated deployment billed per replica-minute](https://docs.together.ai/docs/post-training/multi-lora-deployment). Fireworks bills a trained model's deployment "by the GPU-second", and offers per-token serverless LoRA only as a [preview, on request](https://docs.fireworks.ai/fine-tuning/deploying-loras).

So the honest unit is a GPU-month. At Fireworks' listed $8.00 an hour for an H100 80 GB, one GPU running all month (730 hours) costs $5,840. Several adapters can share it: Together says attaching one "adds nothing to the deployment's cost".

## Where the break-even point sits

A dedicated GPU is a fixed monthly cost; an API bill grows with every request. The lines cross where the GPU's monthly cost equals the API's cost for that many requests.

```chart
{
  "type": "line",
  "eyebrow": "Monthly cost by request volume",
  "title": "One fine-tuned GPU beats the flagship API from about 365,000 requests a month",
  "subtitle": "USD per month: GPT-6.2 Astra, a fine-tuned 8B model on one always-on H100, and GPT-6 Luna. 1,000 input and 200 output tokens per request; both axes log scale",
  "xLabel": "Requests per month",
  "yLabel": "Cost per month, USD",
  "xScale": "log",
  "yScale": "log",
  "prefix": "$",
  "better": "lower",
  "series": [
    { "name": "Flagship API", "points": [[100000, 1600], [300000, 4800], [1000000, 16000], [3000000, 48000], [10000000, 160000], [30000000, 480000], [100000000, 1600000]] },
    { "name": "Fine-tuned 8B", "points": [[100000, 5840], [300000, 5840], [1000000, 5840], [3000000, 5840], [10000000, 5840], [30000000, 5840], [100000000, 5840]] },
    { "name": "Small API tier", "points": [[100000, 20], [300000, 60], [1000000, 200], [3000000, 600], [10000000, 2000], [30000000, 6000], [100000000, 20000]] }
  ],
  "takeaway": "Against the flagship the GPU wins early. Against the small tier it only wins past about 29 million requests a month.",
  "source": "Computed from the list prices above; the GPU line assumes one H100 keeps up with the traffic"
}
```

The arithmetic is short:

- Against a flagship at $16,000 per million requests: $5,840 ÷ $16,000 × 1M = 365,000 requests a month, about one request every seven seconds. Against Claude Opus 5.5 or Gemini 4 Carbon at $8,000, it is 730,000.
- Against a small API tier at $200 per million requests: $5,840 ÷ $200 × 1M = 29.2 million requests a month.

The GPU line stays flat only while one GPU keeps up with your peak traffic. Measure your own throughput before you assume it does; past that point you add a GPU and the line steps up by $5,840.

## Can a small fine-tuned model match a frontier model?

Cost only matters if the small model gets the answers right. On narrow tasks the published evidence says it often does, and the biggest study is the [LoRA Land paper](https://arxiv.org/abs/2405.00732) from Predibase.

```table
{
  "eyebrow": "LoRA Land (Zhao et al., 2024)",
  "title": "Fine-tuned small models beat GPT-4 on 224 of 310 task-model pairs",
  "subtitle": "4-bit LoRA fine-tunes of 10 base models on 31 tasks, compared with gpt-4-0613",
  "columns": [
    { "key": "result", "label": "Result" },
    { "key": "value", "label": "Number" }
  ],
  "rows": [
    { "result": "Fine-tuned models trained", "value": "310 (10 base models × 31 tasks)" },
    { "result": "Beat their own base model", "value": "301 of 310" },
    { "result": "Beat GPT-4", "value": "224 of 310" },
    { "result": "Average lead over GPT-4", "value": "10 points" },
    { "result": "Tasks where GPT-4 still won", "value": "6 of 31 (e.g. Python coding, MMLU)" },
    { "result": "Fine-tuned Mistral-7B models served on one A100 80 GB", "value": "25" }
  ],
  "source": "Zhao et al., LoRA Land, arXiv 2405.00732",
  "sourceUrl": "https://arxiv.org/abs/2405.00732"
}
```

Two older results point the same way. In [Distilling Step-by-Step](https://arxiv.org/abs/2305.02301), a fine-tuned 770M-parameter T5 beat few-shot PaLM 540B on a benchmark using 80% of the training data, a model about 700 times smaller. Anyscale's [Llama 2 case study](https://www.anyscale.com/blog/fine-tuning-llama-2-a-comprehensive-case-study-for-tailoring-models-to-unique-applications) took a 13B model from 42% to 89% on SQL generation by fine-tuning.

LoRA Land has limits. Its GPT-4 baseline is from 2023, the tasks are mostly classification, and GPT-4 kept its lead on open-ended work like coding. Your task is the only benchmark that counts, which is why the eval set comes before the training run.

## When fine-tuning is the wrong call

- Your volume is low. Under a few hundred thousand requests a month, a flagship API is cheaper than a dedicated GPU, and far less work.
- A small API tier is good enough. If GPT-6 Luna, Claude Haiku 5.5 or Gemini 2.5 Flash-Lite already passes your eval, use it: at about $200 per million requests it beats a dedicated GPU until roughly 29 million requests a month.
- The task keeps changing. A fine-tune learns last month's labels. If the schema or policy moves weekly, you will spend your time retraining.
- The task is open-ended. LoRA Land's losses were on coding and broad knowledge. Narrow, checkable outputs (a label, a JSON object, a route) are where small models win.
- You have no labelled data. You need a few thousand good examples and a held-out test set. If you have neither, start by logging your current model's inputs and outputs.

## How to test it on one workflow

1. Pick one call with high volume and a checkable answer. Count its monthly requests and its average input and output tokens.
2. Price it with the table above, at your own token mix.
3. Build the eval set first: 300 to 500 held-out examples with the right answers, scored the same way for every model.
4. Try the cheap API tiers on that eval. If one passes, you may be done.
5. If none passes, fine-tune an 8B model on a few thousand logged examples, score it on the same eval, and compare against the flagship.
6. Route traffic gradually and keep the frontier model as a fallback for inputs the small model is unsure about.

## If you would rather not run it yourself

Adaptral does this loop as a service: it audits your LLM calls, finds the ones worth moving, builds the data and evals, fine-tunes the small model and serves it. You pay per token, so the GPU-month in this post becomes our problem rather than yours.

## Fun fact

The [LoRA paper](https://arxiv.org/abs/2106.09685) shrank a fine-tuned GPT-3 175B checkpoint from 350GB to 35MB, about 10,000 times smaller, because only the small adapter matrices change. Storing 100 task-specific versions then takes about 354GB instead of 35TB. That is why one GPU can serve many fine-tunes at once.

## Conclusion

Fine-tuning a small model pays for itself against a flagship API surprisingly early, around 365,000 requests a month at today's list prices, because training costs a few dollars and a dedicated GPU costs a fixed $5,840. Against the vendors' small tiers the price gap is small, so accuracy decides.

Start with the eval set. Score the cheap tiers on it, fine-tune only if they miss, and run the break-even math above with your own token counts and volume.

## FAQ

### Is fine-tuning a small model cheaper than using a frontier LLM API?

Fine-tuning a small model is cheaper than a flagship LLM API above roughly 365,000 requests a month, using list prices from November 2026 and 1,000 input and 200 output tokens per request. Below that, a dedicated GPU costs more than the API calls. Against small API tiers, the break-even volume is near 29 million requests a month.

### How much does it cost to fine-tune an 8B model?

Fine-tuning an 8B model costs a few dollars of compute. Together AI lists $0.34 to $0.38 per million training tokens for Llama 3.1 8B and Qwen3.5 9B, with a $4 minimum per job. Five thousand examples of 1,200 tokens trained for three epochs is 18 million tokens, so about $6 to $7.

### Can a fine-tuned small model beat GPT-4?

A fine-tuned small model can beat GPT-4 on narrow tasks. In the LoRA Land study, 224 of 310 LoRA fine-tuned models outperformed GPT-4, by 10 points on average across 31 tasks. GPT-4 still won 6 tasks, mostly open-ended ones such as Python coding and broad knowledge, so test on your own task.

### Can I serve a fine-tuned LoRA model and pay per token?

Usually not yet. Together AI says serverless inference cannot serve post-training adapters, so a fine-tuned model runs on a deployment billed per replica-minute. Fireworks bills deployments per GPU-second and offers per-token serverless LoRA only as a preview on request. Several adapters can share one deployment, which spreads the cost.
