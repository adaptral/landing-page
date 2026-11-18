"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { caseStudies } from "./case-studies";
import { LossLandscape } from "./loss-landscape";
import { NeuralNetwork, type NetworkMode } from "./neural-network";

// Paste the Calendly link here; until then the button is deliberately inert.
const BOOK_CALL_URL = "";

function BookCall({ className }: { className: string }) {
  return BOOK_CALL_URL
    ? <a className={className} href={BOOK_CALL_URL} target="_blank" rel="noreferrer">Book a call</a>
    : <button className={className} type="button">Book a call</button>;
}

function StudyImage({ image, company }: { image?: string; company: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return image ? <img src={image} alt={`${company} logo`} /> : <span>Company image</span>;
}

export function Landing() {
  const [mode, setMode] = useState<NetworkMode>("home");
  const [active, setActive] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const visited = useRef(false);
  const lastActive = useRef<number | null>(null);
  const inside = mode === "studies";
  const study = active === null ? null : caseStudies[active];

  const leave = useCallback(() => {
    setActive(null);
    setMode("home");
  }, []);

  // Keep the page still while inside the network, and move focus with the view.
  useEffect(() => {
    document.documentElement.classList.toggle("in-studies", inside);
    if (inside) {
      visited.current = true;
      backRef.current?.focus({ preventScroll: true });
    } else if (visited.current) {
      openerRef.current?.focus({ preventScroll: true });
    }
    return () => document.documentElement.classList.remove("in-studies");
  }, [inside]);

  useEffect(() => {
    if (active !== null) {
      lastActive.current = active;
      closeRef.current?.focus({ preventScroll: true });
    } else if (lastActive.current !== null && inside) {
      cardRefs.current[lastActive.current]?.focus({ preventScroll: true });
      lastActive.current = null;
    }
  }, [active, inside]);

  useEffect(() => {
    if (!inside) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (active !== null) setActive(null);
      else leave();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inside, active, leave]);

  return (
    <main className="landing" data-mode={mode}>
      <LossLandscape />
      <div className="wordmark" aria-label="Adaptral">
        <svg className="brand-symbol" viewBox="0 0 36 46" fill="none" aria-hidden="true">
          <path d="M29 6C15-3 20 49 6 39" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" />
        </svg>
        <span>Adaptral</span>
      </div>

      <div className="composition">
        <div className="introduction" inert={inside}>
          <a className="backing" href="https://www.joinef.com/" target="_blank" rel="noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ef-backing.png" alt="Backed by Entrepreneurs First" width="480" height="86" />
          </a>
          <h1>
            <span className="headline-glow" aria-hidden="true">Intelligence<br />shaped around<br />you.</span>
            <span>Intelligence</span>
            <span>shaped around</span>
            <span>you.</span>
          </h1>
          <p>Better with every iteration.<br />An advantage that compounds over time.</p>
          <div className="actions">
            <BookCall className="cta cta-primary" />
            <button ref={openerRef} className="cta cta-secondary" type="button" onClick={() => setMode("studies")}>
              See our work <span className="cta-arrow" aria-hidden="true">→</span>
            </button>
          </div>
        </div>
        <NeuralNetwork mode={mode} gridRef={gridRef} />
      </div>

      <section className="studies" aria-label="Case studies" inert={!inside}>
        <div className="studies-chrome" inert={study !== null}>
          <button ref={backRef} className="studies-back" type="button" onClick={leave}>
            <span aria-hidden="true">←</span> Back
          </button>
          <p className="studies-hint">Our work · select a node to open its case study</p>
        </div>

        <div ref={gridRef} className="studies-grid" inert={study !== null}>
          {caseStudies.map((item, index) => (
            <button
              key={item.id}
              ref={(element) => { cardRefs.current[index] = element; }}
              className="study"
              type="button"
              data-study=""
              data-layer={Math.floor(index / 2)}
              onClick={() => setActive(index)}
            >
              <span className="study-image"><StudyImage image={item.image} company={item.company} /></span>
              <span className="study-sector">{item.sector}</span>
              <span className="study-company">{item.company}</span>
              <span className="study-brief">{item.brief}</span>
              <span className="study-more">Read case study <span aria-hidden="true">→</span></span>
            </button>
          ))}
        </div>

        {study && (
          <div className="study-backdrop" onClick={() => setActive(null)}>
            <article className="study-detail" role="dialog" aria-modal="true" aria-labelledby="study-title" onClick={(event) => event.stopPropagation()}>
              <button ref={closeRef} className="study-close" type="button" aria-label="Close case study" onClick={() => setActive(null)}>×</button>
              <div className="study-detail-image"><StudyImage image={study.image} company={study.company} /></div>
              <p className="study-sector">{study.sector}</p>
              <h2 id="study-title">{study.company}</h2>
              <p className="study-lead">{study.brief}</p>
              <dl className="study-metrics">
                {study.metrics.map((metric) => (
                  <div key={metric.label}>
                    <dt>{metric.label}</dt>
                    <dd>{metric.value}</dd>
                  </div>
                ))}
              </dl>
              {study.story.map((part) => (
                <section key={part.heading} className="study-part">
                  <h3>{part.heading}</h3>
                  <p>{part.body}</p>
                </section>
              ))}
              <BookCall className="cta cta-primary" />
            </article>
          </div>
        )}
      </section>
    </main>
  );
}
