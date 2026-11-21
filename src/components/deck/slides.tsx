import type { ReactNode } from "react";
import { Arrow, BigModels, ChatGptLogo, ClaudeLogo, DataLeaving, GrowingBill, SlowReply, Icon, Mark, SmallModels } from "./art";
import { agentUses, crmCase, deckCases, ESTIMATE_NOTE, founders, versusRows, type DeckCase } from "./content";
import { CrmMock } from "./crm-mock";

// The slides, in order. Each entry is one screen; `title` names the slide for screen readers.
// Pictures first, few words: the room reads the slide from the back of a boardroom.

// "https://prorated.io/" is shown as "prorated.io".
const siteName = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

export type Slide = { id: string; title: string; body: ReactNode };

// Every case study is one slide with the same three steps, joined by arrows, and the
// result in a green band underneath: what they do, how it ran before, what we did.
function CaseSlide({ item, picture }: { item: DeckCase; picture?: ReactNode }) {
  return (
    <div className="deck-case" data-wide={picture ? "" : undefined}>
      <p className="deck-kicker"><span className="deck-tag" data-kind={item.kind}>{item.kind}</span></p>
      <h2>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {item.logo && <img className="deck-company-logo" src={item.logo} alt="" />}
        {item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer">{item.company}</a> : item.company}
        {item.url && <a className="deck-site" href={item.url} target="_blank" rel="noopener noreferrer">{siteName(item.url)}</a>}
      </h2>
      <p className="deck-about">{item.about}</p>
      <div className="deck-flow">
        <div className="deck-step">
          <span className="deck-step-name">What it does</span>
          {picture ?? (
            <span className="deck-step-picture">
              <Icon name={item.icons[0]} /><Arrow /><Icon name={item.icons[1]} />
            </span>
          )}
          <span className="deck-step-text">{item.does}</span>
        </div>
        <Arrow />
        <div className="deck-step deck-step-before">
          <span className="deck-step-name">Before</span>
          <span className="deck-step-picture">{item.before.logos === "models" ? <BigModels /> : <Icon name="people" />}</span>
          <strong>{item.before.figure}</strong>
          <ul className="deck-step-points">{item.before.points.map((point) => <li key={point}>{point}</li>)}</ul>
        </div>
        <Arrow />
        <div className="deck-step deck-step-after">
          <span className="deck-step-name">What we did</span>
          <span className="deck-step-picture"><SmallModels /></span>
          <strong>{item.after.figure}</strong>
          <ul className="deck-step-points">{item.after.points.map((point) => <li key={point}>{point}</li>)}</ul>
        </div>
      </div>
      <div className="deck-results">
        {item.results.map((result) => (
          <p key={result.label} className="deck-result"><b>{result.value}</b>{result.label}</p>
        ))}
      </div>
      <p className="deck-elsewhere">{item.elsewhere}</p>
      <p className="deck-source">{item.kind === "Example" ? "An example of work we can take on." : ESTIMATE_NOTE}</p>
    </div>
  );
}

export function buildSlides(calendlyUrl: string): Slide[] {
  return [
    {
      id: "title",
      title: "Adaptral",
      body: (
        <div className="deck-cover">
          <div>
            <p className="deck-cover-brand"><Mark className="deck-cover-mark" />Adaptral</p>
            <h1>Smaller AI.<br />Smaller bills.</h1>
            <p className="deck-lede">Your own AI model, trained for one job, on your own servers. Cheaper, faster and private.</p>
            <p className="deck-cover-backing">Backed by Entrepreneurs First</p>
          </div>
          <div className="deck-cover-art" aria-hidden="true">
            <span className="deck-orb deck-orb-big"><ClaudeLogo /><ChatGptLogo /></span>
            <Arrow />
            <span className="deck-orb-cluster">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <span className="deck-orb"><img src="/models/qwen.svg" alt="" /></span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <span className="deck-orb"><img src="/models/gemma.svg" alt="" /></span>
              <span className="deck-orb"><Mark /></span>
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "problem",
      title: "Three problems with big AI",
      body: (
        <>
          <h2>Three problems with renting big AI.</h2>
          <ul className="deck-panels">
            <li>
              <GrowingBill />
              <strong>The bill keeps growing</strong>
              <span>You pay every time it is used.</span>
            </li>
            <li>
              <DataLeaving />
              <strong>Your data leaves</strong>
              <span>Every document and call goes outside.</span>
            </li>
            <li>
              <SlowReply />
              <strong>Every answer waits</strong>
              <span>Each request travels to a far-away server.</span>
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "idea",
      title: "The idea",
      body: (
        <>
          <h2>You would not hire a senior partner to do data entry.</h2>
          <div className="deck-versus">
            <div className="deck-versus-side">
              <span className="deck-orb deck-orb-big deck-orb-named"><span><ClaudeLogo />Claude</span><span><ChatGptLogo />ChatGPT</span></span>
              <h3>One giant model, rented</h3>
              <ul>
                <li>Costly: you pay for every use</li>
                <li>Exposed: your data goes to them</li>
                <li>Slow: far-away, shared servers</li>
              </ul>
            </div>
            <Arrow />
            <div className="deck-versus-side deck-versus-ours">
              <span className="deck-orb-cluster">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <span className="deck-named"><span className="deck-orb"><img src="/models/qwen.svg" alt="" /></span>Qwen</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <span className="deck-named"><span className="deck-orb"><img src="/models/gemma.svg" alt="" /></span>Gemma</span>
                <span className="deck-named"><span className="deck-orb"><Mark /></span>Your own model</span>
              </span>
              <h3>Small models, yours</h3>
              <ul>
                <li>Cheaper: one fixed monthly cost</li>
                <li>Private: data never leaves you</li>
                <li>Fast: runs next to your software</li>
              </ul>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "how",
      title: "How we work",
      body: (
        <>
          <h2>How we work</h2>
          <ol className="deck-steps">
            <li><Icon name="search" /><strong>Find the job</strong><span>One task your business repeats thousands of times.</span></li>
            <li><Icon name="train" /><strong>Train a small model</strong><span>On examples of that job, from your own work.</span></li>
            <li><Icon name="scales" /><strong>Prove it</strong><span>Side by side with today&rsquo;s way. You compare cost and quality.</span></li>
            <li><Icon name="switch" /><strong>Switch over</strong><span>Step by step, with the old way kept as backup.</span></li>
          </ol>
        </>
      ),
    },
    {
      id: "work",
      title: "Our work",
      body: (
        <>
          <h2>Our work</h2>
          <ul className="deck-work">
            {[crmCase, ...deckCases].map((item) => (
              <li key={item.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {item.logo ? <img className="deck-work-logo" src={item.logo} alt="" /> : <Icon name={item.icons[0]} />}
                <div>
                  <strong>
                    {item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer">{item.company}</a> : item.company}
                    {item.url && <a className="deck-site" href={item.url} target="_blank" rel="noopener noreferrer">{siteName(item.url)}</a>}
                  </strong>
                  <span>{item.built}</span>
                </div>
                <b>{item.results[0].value}<small>{item.results[0].label}</small></b>
              </li>
            ))}
          </ul>
        </>
      ),
    },
    { id: crmCase.id, title: `Case study: ${crmCase.company}`, body: <CaseSlide item={crmCase} picture={<CrmMock />} /> },
    ...deckCases.map((item) => ({ id: item.id, title: `${item.kind}: ${item.company}`, body: <CaseSlide item={item} /> })),
    {
      id: "agents",
      title: "What AI agents can do for your business",
      body: (
        <>
          <h2>What AI agents can do for your business.</h2>
          <ul className="deck-uses">
            {agentUses.map((use) => (
              <li key={use.title}>
                <Icon name={use.icon} />
                <strong>{use.title}</strong>
                <span>{use.text}</span>
                <em>{use.gain}</em>
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      id: "versus",
      title: "Why Adaptral, instead of training your own models",
      body: (
        <>
          <h2>Why Adaptral, instead of training your own models?</h2>
          <table className="deck-table">
            <thead>
              <tr><th /><th>Training and running it yourself</th><th><Mark />With Adaptral</th></tr>
            </thead>
            <tbody>
              {versusRows.map((row) => (
                <tr key={row.topic}>
                  <th><span><Icon name={row.icon} />{row.topic}</span></th>
                  <td><strong>{row.alone[0]}</strong>{row.alone[1]}</td>
                  <td><strong>{row.us[0]}</strong>{row.us[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ),
    },
    {
      id: "where",
      title: "Where it runs",
      body: (
        <>
          <h2>It runs inside your own walls.</h2>
          <div className="deck-where">
            <div className="deck-building">
              <p>Your data centre</p>
              <div className="deck-building-row">
                <span>Your software</span>
                <Arrow />
                <span className="deck-building-model"><SmallModels />Your small model<small>on one GPU server, supplied by Frontier</small></span>
              </div>
            </div>
            <div className="deck-outside">
              <span className="deck-outside-wall" aria-hidden="true" />
              <BigModels />
              <p>Nothing is sent outside.</p>
            </div>
          </div>
          <ul className="deck-chips">
            <li>Private: nothing leaves</li>
            <li>Fast: next to your software</li>
            <li>A fixed cost you can budget</li>
          </ul>
        </>
      ),
    },
    {
      id: "start",
      title: "How we start",
      body: (
        <>
          <h2>Start with one job.</h2>
          <ol className="deck-steps deck-steps-three">
            <li><Icon name="pick" /><strong>Pick one job together</strong><span>One that costs real time or money today.</span></li>
            <li><Icon name="train" /><strong>We train and test</strong><span>Next to the way the job is done now.</span></li>
            <li><Icon name="scales" /><strong>You decide on the numbers</strong><span>If it does not pay, you stop there.</span></li>
          </ol>
          <p className="deck-note">We are a small team, backed by Entrepreneurs First. We would rather prove one job than promise ten.</p>
        </>
      ),
    },
    {
      id: "team",
      title: "The founders",
      body: (
        <>
          <h2>Who you will be working with.</h2>
          <ul className="deck-team">
            {founders.map((person) => (
              <li key={person.name}>
                <span className="deck-avatar" aria-hidden="true">
                  {person.name.split(" ").map((part) => part[0]).join("")}
                  <i style={{ backgroundImage: `url(${person.photo})` }} />
                </span>
                <strong>{person.name}</strong>
                <em>{person.role}</em>
                <ul>{person.points.map((point) => <li key={point}>{point}</li>)}</ul>
                <a href={person.url} target="_blank" rel="noopener noreferrer">{person.url.replace(/^https:\/\/www\./, "").replace(/\/$/, "")}</a>
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      id: "close",
      title: "Which job first?",
      body: (
        <div className="deck-cover deck-close">
          <div>
            <h1>Which job would you<br />hand over first?</h1>
            <p className="deck-lede">Tell us one task your teams repeat every day. We will tell you plainly whether a small model can do it, and what it would cost.</p>
            {calendlyUrl && <a className="deck-cta" href={calendlyUrl} target="_blank" rel="noopener noreferrer">Talk to the founders</a>}
            <p className="deck-cover-brand"><Mark className="deck-cover-mark" />Adaptral</p>
          </div>
        </div>
      ),
    },
  ];
}
