import { WeightMatrix } from "@/components/weight-matrix";

export default function Home() {
  return (
    <main className="landing">
      <div className="wordmark" aria-label="Adaptral">
        <svg className="brand-symbol" viewBox="0 0 36 46" fill="none" aria-hidden="true">
          <path d="M29 6C15-3 20 49 6 39" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" />
        </svg>
        <span>Adaptral</span>
      </div>

      <div className="composition">
        <div className="introduction">
          <h1>Own Your<br />Intelligence<span className="period">.</span></h1>
          <p>Intelligence, shaped around you.</p>
        </div>
        <WeightMatrix />
      </div>
    </main>
  );
}
