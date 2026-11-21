import { CRM_ADDRESS, CRM_NAME } from "./content";

// An illustration of the recruiting CRM in the first case study: the AI assistant moves a
// candidate to the interview stage while its activity list fills in. The motion is all CSS
// (see deck.css), on one ten-second loop. Names and roles are invented.

const COLUMNS = [
  { stage: "Applied", people: [["Arjun Mehta", "Backend engineer"], ["Sara Thomas", "Product designer"], ["Vikram Rao", "Data analyst"]] },
  { stage: "Screening", people: [["Neha Kulkarni", "Backend engineer"], ["Priya Nair", "Product designer"], ["Rohan Das", "Sales lead"]] },
  { stage: "Interview", people: [["Imran Sheikh", "Data analyst"]] },
  { stage: "Offer", people: [["Kavya Reddy", "Sales lead"]] },
];

// The card the assistant moves: second in Screening.
const MOVING = "Priya Nair";

const ACTIVITY = [
  "Opened Priya Nair's profile",
  "Moved her to Interview",
  "Sent the interview invite",
  "Updated the hiring manager",
];

export function CrmMock() {
  return (
    <div className="deck-crm" role="img" aria-label={`Illustration: an AI assistant operating the ${CRM_NAME} recruiting CRM, moving a candidate to the interview stage.`}>
      <div className="deck-crm-chrome" aria-hidden="true">
        <span className="deck-crm-lights"><i /><i /><i /></span>
        <span className="deck-crm-address">{CRM_ADDRESS}</span>
      </div>
      <div className="deck-crm-app" aria-hidden="true">
        <div className="deck-crm-side">
          <span className="deck-crm-brand"><b>{CRM_NAME.charAt(0)}</b>{CRM_NAME}</span>
          <span data-active="">Pipeline</span>
          <span>Candidates</span>
          <span>Jobs</span>
          <span>Interviews</span>
          <span>Reports</span>
        </div>
        <div className="deck-crm-main">
          <div className="deck-crm-board">
            {COLUMNS.map((column) => (
              <div key={column.stage} className="deck-crm-column">
                <span className="deck-crm-stage">{column.stage}<i>{column.people.length}</i></span>
                {column.people.map(([name, role]) => (
                  <span key={name} className={name === MOVING ? "deck-crm-card deck-crm-card-moving" : "deck-crm-card"}>
                    <b>{name}</b>
                    <small>{role}</small>
                    {name === MOVING && <em>Invite sent</em>}
                  </span>
                ))}
              </div>
            ))}
            <svg className="deck-crm-cursor" viewBox="0 0 20 22">
              <path d="M2 1.5v16l4.4-4.1 2.9 6.6 2.7-1.2-2.9-6.5h6.1z" fill="#0b0d12" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="deck-crm-agent">
            <span className="deck-crm-agent-title">AI assistant</span>
            {ACTIVITY.map((line) => <span key={line} className="deck-crm-line">{line}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}
