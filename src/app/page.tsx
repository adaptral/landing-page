import { WeightMatrix } from "@/components/weight-matrix";
import { LossLandscape } from "@/components/loss-landscape";

export default function Home() {
  return (
    <main className="landing">
      <LossLandscape />
      <div className="wordmark" aria-label="Adaptral">
        <svg className="brand-symbol" viewBox="0 0 36 46" fill="none" aria-hidden="true">
          <path d="M29 6C15-3 20 49 6 39" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" />
        </svg>
        <span>Adaptral</span>
      </div>

      <div className="composition">
        <div className="introduction">
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
        </div>
        <WeightMatrix />
      </div>
    </main>
  );
}
