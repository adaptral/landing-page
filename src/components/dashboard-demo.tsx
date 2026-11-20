"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

// A mock of the product dashboard, playing one recommendation through to live
// traffic. Every figure in it is sample data.

const LOOP = 19;
const STEP_STARTS = [0, 3, 6.5, 11];
const STEP_END = LOOP - 2.5;
const SPLIT_FROM = 13;
const LIVE_FROM = 16.5;
// Where each step rests when motion is reduced, or when it is opened by hand then.
const STILL_FRAMES = [1, 5.6, 9.6, 12];
const EXAMPLES = 12000;

// Each step of the journey has its own tab inside the window.
const STEPS = [
  { name: "Identified", tab: "Recommendations", note: "Our AI agents identify the tasks where you can swap." },
  { name: "Synthetic data", tab: "Data", note: "Generated automatically. Nothing leaves your system, and you own the data." },
  { name: "Fine-tuning", tab: "Fine-tuning jobs", note: "Start fine-tuning on your cloud or on Adaptral." },
  { name: "Split traffic", tab: "Traffic", note: "Move traffic over slowly, at your own pace." },
];

const ROWS = [
  { workflow: "Call summarisation", volume: "410k calls / day", swap: "Fine-tuned Qwen3 0.6B", cost: "$6,400", after: "$900", saving: "−86%" },
  { workflow: "Intent classification", volume: "1.2M calls / day", swap: "Fine-tuned ModernBERT, on CPU", cost: "$3,100", after: "$250", saving: "−92%" },
  { workflow: "Entity extraction", volume: "260k calls / day", swap: "Fine-tuned Gemma 3 270M", cost: "$2,300", after: "$400", saving: "−83%" },
];

const span = (time: number, start: number, end: number) => Math.max(0, Math.min(1, (time - start) / (end - start)));
const count = (value: number) => Math.round(value).toLocaleString("en-US");

function stepAt(time: number) {
  return time < STEP_STARTS[1] ? 0 : time < STEP_STARTS[2] ? 1 : time < STEP_STARTS[3] ? 2 : 3;
}

// Everything the views show, read off the clock.
function progressAt(time: number) {
  return {
    data: span(time, STEP_STARTS[1], STEP_STARTS[2]),
    tuning: span(time, STEP_STARTS[2], STEP_STARTS[3]),
    ready: time >= STEP_STARTS[3],
    splitting: time >= SPLIT_FROM,
    share: time < SPLIT_FROM ? 0 : time < 14 ? 10 : time < 15.2 ? 50 : 100,
    live: time >= LIVE_FROM,
  };
}

function Mark() {
  return (
    <svg className="dash-mark" viewBox="0 0 36 46" fill="none" aria-hidden="true">
      <path d="M29 6C15-3 20 49 6 39" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" />
    </svg>
  );
}

function Bar({ value, good }: { value: number; good?: boolean }) {
  return <span className={good ? "dash-bar dash-bar-good" : "dash-bar"}><span style={{ width: `${value * 100}%` }} /></span>;
}

function Recommendations({ time }: { time: number }) {
  const now = progressAt(time);
  let state: ReactNode;
  let action: ReactNode;
  if (time < STEP_STARTS[1]) {
    state = <span className="dash-pill dash-pill-warn">Expensive for the task</span>;
    action = <span className="dash-button dash-button-primary" data-pressed={time > 2.5 ? "" : undefined}>Generate synthetic data</span>;
  } else if (!now.ready) {
    state = <span className="dash-pill">{time < STEP_STARTS[2] ? "Generating data" : "Fine-tuning"}</span>;
    action = <span className="dash-working">Working</span>;
  } else if (!now.splitting) {
    state = <span className="dash-pill dash-pill-good">Evals passed</span>;
    action = <span className="dash-button dash-button-primary" data-pressed={time > 12.5 ? "" : undefined}>Split traffic</span>;
  } else {
    state = <span className={now.live ? "dash-pill dash-pill-good" : "dash-pill"}>{now.share}% on tuned model</span>;
    action = now.live ? <span className="dash-pill dash-pill-good">Live</span> : <span className="dash-working">Ramping</span>;
  }

  return (
    <>
      <p className="dash-title">Recommendations</p>
      <p className="dash-summary">Agents audited 14 workflows over the last 7 days. 3 are high-volume, narrow tasks that don’t need a frontier model.</p>
      <div className="dash-table">
        <div className="dash-row dash-row-head">
          <span>Workflow</span><span>Recommended swap</span><span>Cost</span><span>Status</span><span />
        </div>
        {ROWS.map((row, index) => (
          <div className="dash-row" key={row.workflow} data-active={index === 0 ? "" : undefined}>
            <span className="dash-cell-workflow"><strong>{row.workflow}</strong><small>{row.volume}</small></span>
            <span className="dash-cell-swap"><small>Frontier LLM →</small>{row.swap}</span>
            <span className="dash-cell-cost">
              {index === 0 && now.live ? <><s>{row.cost}</s> <b>{row.after}</b></> : <>{row.cost} <i>→ {row.after}</i></>}
              <small>per month · {row.saving}</small>
            </span>
            <span className="dash-cell-state">{index === 0 ? state : <span className="dash-pill dash-pill-warn">Expensive for the task</span>}</span>
            <span className="dash-cell-action">{index === 0 ? action : <span className="dash-button">Generate synthetic data</span>}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function Data({ time }: { time: number }) {
  const now = progressAt(time);
  const started = time >= STEP_STARTS[1];
  const done = now.data >= 1;
  return (
    <>
      <p className="dash-title">Data</p>
      <p className="dash-summary">Synthetic training and eval sets, generated for each task you approve.</p>
      <div className="dash-panel">
        <div className="dash-panel-head">
          <span><strong>Call summarisation</strong><small>Synthetic dataset</small></span>
          {done ? <span className="dash-pill dash-pill-good">Dataset ready</span>
            : started ? <span className="dash-working">Generating</span>
            : <span className="dash-button dash-button-primary" data-pressed={time > 2.5 ? "" : undefined}>Generate synthetic data</span>}
        </div>
        <Bar value={now.data} good={done} />
        <div className="dash-tiles">
          <span><small>Training examples</small><b>{count(now.data * EXAMPLES)}</b><small>of {count(EXAMPLES)}</small></span>
          <span><small>Held out for evals</small><b>{count(now.data * EXAMPLES * 0.1)}</b><small>of {count(EXAMPLES * 0.1)}</small></span>
          <span><small>Where it lives</small><b>Your system</b><small>nothing leaves it</small></span>
          <span><small>Owner</small><b>You</b><small>the dataset is yours</small></span>
        </div>
      </div>
    </>
  );
}

function Jobs({ time }: { time: number }) {
  const now = progressAt(time);
  const started = time >= STEP_STARTS[2];
  const epoch = Math.min(3, 1 + Math.floor(now.tuning * 3));
  return (
    <>
      <p className="dash-title">Fine-tuning jobs</p>
      <p className="dash-summary">Run each job on your own cloud or on Adaptral.</p>
      <div className="dash-panel">
        <div className="dash-panel-head">
          <span><strong>Qwen3 0.6B</strong><small>for call summarisation</small></span>
          {now.ready ? <span className="dash-pill dash-pill-good">Evals passed</span>
            : started ? <span className="dash-working">Epoch {epoch} of 3</span>
            : <span className="dash-pill">Waiting for data</span>}
        </div>
        <Bar value={now.tuning} good={now.ready} />
        <div className="dash-job-body">
          <div className="dash-loss">
            <small>Training loss</small>
            <svg viewBox="0 0 300 90" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 8C30 46 54 60 92 67S168 77 214 80S276 83 300 84" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - now.tuning} />
            </svg>
          </div>
          <div className="dash-runs-on">
            <small>Runs on</small>
            <span className="dash-segment"><b>Your cloud</b><i>Adaptral</i></span>
            <small>Base model: open-source, swapped as better ones are released.</small>
          </div>
        </div>
      </div>
    </>
  );
}

function Traffic({ time }: { time: number }) {
  const now = progressAt(time);
  const row = ROWS[0];
  return (
    <>
      <p className="dash-title">Traffic</p>
      <p className="dash-summary">Move calls to the tuned model in stages, and watch it before going further.</p>
      <div className="dash-panel">
        <div className="dash-panel-head">
          <span><strong>Call summarisation</strong><small>{row.volume}</small></span>
          {now.live ? <span className="dash-pill dash-pill-good">Live</span>
            : now.splitting ? <span className="dash-working">Ramping</span>
            : now.ready ? <span className="dash-button dash-button-primary" data-pressed={time > 12.5 ? "" : undefined}>Split traffic</span>
            : <span className="dash-button" data-disabled="">Split traffic</span>}
        </div>
        <div className="dash-routes">
          <span>Frontier LLM</span><Bar value={1 - now.share / 100} /><b>{100 - now.share}%</b>
          <span>Fine-tuned Qwen3 0.6B</span><Bar value={now.share / 100} good /><b>{now.share}%</b>
        </div>
        <div className="dash-ramp">
          <small>Ramp</small>
          {[10, 50, 100].map((stage) => <span key={stage} data-reached={now.share >= stage ? "" : undefined}>{stage}%</span>)}
          <span className="dash-cell-cost dash-ramp-cost">
            {now.live ? <><s>{row.cost}</s> <b>{row.after}</b></> : <>{row.cost} <i>→ {row.after}</i></>} <small>per month</small>
          </span>
        </div>
        {!now.ready && <p className="dash-hint">Available once the fine-tuned model passes its evals.</p>}
      </div>
    </>
  );
}

const VIEWS = [Recommendations, Data, Jobs, Traffic];

export function DashboardDemo() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reducedRef = useRef(false);
  const [time, setTime] = useState(0);
  // A tab opened by hand stays open until the story moves on to its next step.
  const [pinned, setPinned] = useState<{ tab: number; step: number } | null>(null);
  const step = stepAt(time);
  const tab = pinned && pinned.step === step ? pinned.tab : step;
  const View = VIEWS[tab];

  const seek = useCallback((index: number) => {
    setPinned(null);
    setTime(reducedRef.current ? STILL_FRAMES[index] : STEP_STARTS[index]);
  }, []);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer = 0;
    let inViewport = false;
    let previous = 0;

    const sync = () => {
      window.clearInterval(timer);
      previous = 0;
      reducedRef.current = motion.matches;
      if (motion.matches) {
        setTime(STILL_FRAMES[3]);
      } else if (inViewport && !document.hidden) {
        timer = window.setInterval(() => {
          const now = performance.now();
          const delta = previous ? Math.min((now - previous) / 1000, 0.25) : 0;
          previous = now;
          setTime((value) => (value + delta) % LOOP);
        }, 90);
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting;
      sync();
    }, { threshold: 0.25 });
    observer.observe(element);
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    sync();

    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <section id="how-it-works" className="dashboard" aria-labelledby="dashboard-title">
      <p className="workflow-eyebrow">The dashboard</p>
      <h2 id="dashboard-title">Our agents recommend.<br />You decide.</h2>
      <p className="workflow-lede">Every swap shows up with what it costs today and what could replace it. You choose when to generate data, fine-tune and move traffic.</p>

      <div ref={sectionRef}>
        <ol className="dash-steps">
          {STEPS.map((item, index) => {
            const progress = span(time, STEP_STARTS[index], index < 3 ? STEP_STARTS[index + 1] : STEP_END);
            return (
              <li key={item.name}>
                <button type="button" data-active={index === step ? "" : undefined} aria-current={index === step ? "step" : undefined} onClick={() => seek(index)}>
                  <span className="dash-step-line"><span style={{ transform: `scaleX(${progress})` }} /></span>
                  <span className="dash-step-index">0{index + 1}</span>
                  <span className="dash-step-name">{item.name}</span>
                  <span className="dash-step-note">{item.note}</span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="dash-window">
          <div className="dash-chrome" aria-hidden="true">
            <span className="dash-lights"><i /><i /><i /></span>
            <span className="dash-address">Adaptral · {STEPS[tab].tab}</span>
          </div>
          <div className="dash-body">
            <div className="dash-head">
              <span className="dash-brand"><Mark />Adaptral</span>
              <div className="dash-tabs" role="tablist" aria-label="Dashboard views">
                {STEPS.map((item, index) => (
                  <button key={item.tab} type="button" role="tab" aria-selected={index === tab} data-active={index === tab ? "" : undefined} onClick={() => setPinned({ tab: index, step })}>
                    {item.tab}
                  </button>
                ))}
              </div>
              <span className="dash-sample">Sample data</span>
            </div>
            <div className="dash-view" role="tabpanel" aria-label={STEPS[tab].tab}>
              <View time={time} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
