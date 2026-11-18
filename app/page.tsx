import Link from "next/link";
import { BookCall } from "./book-call";
import { Logo, Mark } from "./logo";
import { site } from "./site";

const work = [
  {
    term: "Fine-tune infra",
    body: "Fine-tuning infrastructure for any open-weight model, from a low-rank adapter to a full-parameter run. Bring data and a metric. We run the GPUs, the schedulers and the checkpoints.",
  },
  {
    term: "Deploy OSS models",
    body: "Deploy an open-source model once, then serve every adapter trained on it from the same endpoint. Promote and roll back a model the way you ship code.",
  },
  {
    term: "The RLOps platform",
    body: "Reinforcement learning, run as an operating discipline. Production feedback becomes reward, reward becomes the next checkpoint, and every checkpoint is evaluated before it serves traffic.",
  },
  {
    term: "Model adapters",
    body: "The adapter is the unit of work. Each one is versioned, measured against its predecessor, and small enough that training the next is routine.",
  },
];

export default function Home() {
  return (
    <>
      <Mark className="watermark" />
      <div className="page">
        <header className="top">
          <Link href="/" aria-label="Adaptral home" className="brand">
            <Logo />
          </Link>
          <BookCall where="header" className="top-link">
            Book a call <span aria-hidden="true">→</span>
          </BookCall>
        </header>

        <main>
          <h1>
            Adaptral <span className="dash">—</span> the model adaptation platform
          </h1>

          <section className="definition" aria-label="Definition">
            <p className="headword">
              <b>adaptation</b> <i>n.</i> <span className="ipa">/ˌæd.æpˈteɪ.ʃən/</span>
            </p>
            <p>
              The work of turning a general model into one that is measurably better at a single job. Fine-tuned on
              your data, corrected by reward from production, and shipped as an adapter.
            </p>
          </section>

          <p>
            Foundation models are trained once, for everyone. What happens next decides whether they are useful to you.
            Adaptral is the infrastructure for what happens next.
          </p>

          <figure className="equation">
            <div
              className="math"
              role="math"
              aria-label="theta of t equals theta zero plus the integral from zero to t of the gradient of R with respect to theta, d tau"
            >
              <span>
                <i>θ</i>(<i>t</i>)
              </span>
              <span className="op">=</span>
              <span>
                <i>θ</i>
                <sub>0</sub>
              </span>
              <span className="op">+</span>
              <span className="integral">
                <Mark />
                <sup>
                  <i>t</i>
                </sup>
                <sub>0</sub>
              </span>
              <span>
                ∇<sub className="tight">θ</sub>
                <i>R</i>(<i>θ</i>, <i>τ</i>)
              </span>
              <span>
                <i>dτ</i>
              </span>
              <span className="eq-no">(1)</span>
            </div>
            <figcaption>
              where <i>θ</i>
              <sub>0</sub> is the open model you start from, <i>R</i> is the reward your product defines, and{" "}
              <i>t</i> is time in production.
            </figcaption>
          </figure>

          <section>
            <h2>What we build</h2>
            <ol className="work">
              {work.map(({ term, body }) => (
                <li key={term}>
                  <h3>{term}</h3>
                  <p>{body}</p>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2>Why it matters</h2>
            <p>
              The best open models already know almost everything. The distance that remains is between a model that
              knows everything and a model that knows your work. We think closing that distance is the most valuable
              engineering problem of this decade, and Adaptral is the platform built to close it.
            </p>
          </section>

          <section className="cta">
            <h2>Talk to us</h2>
            <p>If you train or serve open models in production, or intend to, we should talk.</p>
            <BookCall where="cta" className="button">
              Book a call with us <span aria-hidden="true">→</span>
            </BookCall>
          </section>

          <section>
            <h2>Elsewhere</h2>
            <ul className="links">
              <li>
                <a href={site.social.linkedin} rel="me noopener" target="_blank">
                  LinkedIn
                </a>{" "}
                <span>company/adaptral</span>
              </li>
              <li>
                <a href={site.social.x} rel="me noopener" target="_blank">
                  X
                </a>{" "}
                <span>@adaptral</span>
              </li>
              <li>
                <a href={site.social.instagram} rel="me noopener" target="_blank">
                  Instagram
                </a>{" "}
                <span>@adaptral</span>
              </li>
            </ul>
          </section>
        </main>

        <footer>
          <Mark />
          <p>© 2026 Adaptral. {site.tagline}.</p>
        </footer>
      </div>
    </>
  );
}
