// Everything the pitch deck says that you are likely to change lives here.

// The hiring case study. Prorated (prorated.io) finds engineers and tests them on real work.
// The name also appears inside the CRM picture on that slide.
export const CRM_NAME = "Prorated";
export const CRM_ADDRESS = "prorated.io";

// Shown under every case study's numbers.
export const ESTIMATE_NOTE = "Cost and speed are estimates from public price lists, November 2026. Training and setup are a one-time cost on top.";

// How much faster the small model answers. An estimate, not a measurement: a small model
// on its own machine typically replies in about half the time of a large rented one.
// Replace with the measured figure for each customer when you have it.
const SPEED = "2× faster";

// The CRM cost example: estimates from public list prices, not the customer's measured bill.
// Change the inputs and the slide follows.
const RUPEES_PER_DOLLAR = 93;
const TASKS_PER_MONTH = 30000;
// Large model: about 60,000 tokens read and 1,500 written per task, at $2 and $10 per million.
const LARGE_MODEL_DOLLARS_PER_TASK = 0.135;
// Small model: one rented GPU machine (AWS L4), or two larger ones (AWS A10G) for backup.
const SMALL_MODEL_DOLLARS_LOW = 588;
const SMALL_MODEL_DOLLARS_HIGH = 1468;

const lakh = (dollars: number) => {
  const value = (dollars * RUPEES_PER_DOLLAR) / 100000;
  return value.toFixed(value < 1 ? 2 : 1);
};
const largeMonthly = TASKS_PER_MONTH * LARGE_MODEL_DOLLARS_PER_TASK;
// Rounded to the nearest five so the slide does not claim more precision than an estimate has.
const percentOff = (small: number) => Math.round(((1 - small / largeMonthly) * 100) / 5) * 5;

export type DeckCase = {
  id: string;
  // "Case study" for delivered work. "Example" for work shown as an illustration.
  kind: "Case study" | "Example";
  // The customer's name, shown as the slide's heading. All three are real companies.
  company: string;
  // Their website and logo (a file under /public/logos). Leave out for a placeholder.
  url?: string;
  logo?: string;
  // Under the heading: what the company builds and what it wanted. Two lines at most.
  about: string;
  // The "Our work" list: what they do and what we built, in two lines.
  built: string;
  // Step 1, what the product does. `icons` are the two pictures (what goes in, what comes out).
  does: string;
  icons: [string, string];
  // Step 2, how it ran before: cost, privacy, speed. Keep each point under 25 characters.
  before: { logos: "models" | "people"; figure: string; points: string[] };
  // Step 3, what we did: the same three, answered.
  after: { figure: string; points: string[] };
  // The three results in the green band: cost, speed, privacy.
  results: { value: string; label: string }[];
  elsewhere: string;
};

// The privacy result is the same shape on every slide; only what stays inside changes.
const privateResult = (what: string) => ({ value: "Private", label: `${what} stay on their servers` });

export const crmCase: DeckCase = {
  id: "crm",
  kind: "Case study",
  company: CRM_NAME,
  url: "https://prorated.io/",
  logo: "/logos/prorated.svg",
  about: "Prorated builds hiring software that finds engineers and tests them on real work. An AI assistant runs its recruiting CRM, and they wanted it cheaper, faster and private.",
  built: "Hiring software run by an AI assistant. We replaced Claude and ChatGPT with a small model on their own machines: lower cost, faster replies, and candidate data stays inside.",
  does: "An AI assistant moves candidates, updates records, sends follow-ups and books interviews.",
  icons: ["people", "table"],
  before: { logos: "models", figure: `₹${lakh(largeMonthly)} lakh a month`, points: ["Charged for every task", "Candidate data sent out", "Slow, step by step"] },
  after: { figure: `₹${lakh(SMALL_MODEL_DOLLARS_LOW)} to ${lakh(SMALL_MODEL_DOLLARS_HIGH)} lakh a month`, points: ["Fixed monthly cost", "Data stays inside", "Replies in half the time"] },
  results: [
    { value: `${percentOff(SMALL_MODEL_DOLLARS_HIGH)} to ${percentOff(SMALL_MODEL_DOLLARS_LOW)}%`, label: "lower running cost" },
    { value: SPEED, label: "on every task" },
    privateResult("Candidate records"),
  ],
  elsewhere: `At ${TASKS_PER_MONTH.toLocaleString("en-IN")} tasks a month. The same idea works for any software your staff click through all day.`,
};

// The other case studies. Every company here is real; nothing in this list is invented.
// Neither has a cost percentage, because there is no volume to base one on yet.
export const deckCases: DeckCase[] = [
  {
    // Bayvis (bayvis.co) makes estimating software for collision repair shops. No cost
    // percentage here: there is no volume to base one on yet.
    id: "repair-estimates",
    kind: "Case study",
    company: "Bayvis",
    url: "https://bayvis.co/",
    logo: "/logos/bayvis.svg",
    about: "Bayvis builds estimating software for car repair shops. From damage photos it writes the full repair estimate. They wanted every line checked faster, with customer data kept in-house.",
    built: "Estimating software for car repair shops. We trained a small model that checks every line of a repair estimate against the rule books, without sending photos outside.",
    does: "Every line is checked against the car maker's repair rules.",
    icons: ["car", "flag"],
    before: { logos: "models", figure: "Paid for every estimate", points: ["A fee on each estimate", "Photos sent outside", "Shops waited for the draft"] },
    after: { figure: "One fixed monthly cost", points: ["Same cost at any volume", "Photos stay inside", "Draft ready sooner"] },
    results: [
      { value: "Fixed cost", label: "not a fee per estimate" },
      { value: SPEED, label: "estimates ready sooner" },
      privateResult("Customer photos"),
    ],
    elsewhere: "The same job: any document checked against a rule book. Insurance claims, contractor bills, audits.",
  },
  {
    // SquareUp (joinsquareup.com) builds AI-run online stores for consumer brands: an AI
    // seller that recommends, bundles, negotiates within a floor price and closes the sale,
    // on web chat, WhatsApp and voice.
    id: "ai-salesperson",
    kind: "Case study",
    company: "SquareUp",
    url: "https://joinsquareup.com/",
    logo: "/logos/squareup.svg",
    about: "SquareUp builds online stores with an AI salesperson that talks to every shopper and closes the sale, on chat, WhatsApp and voice. They wanted each conversation faster and cheaper.",
    built: "Online stores with an AI salesperson for every shopper. We trained a small model that answers product questions and recommends what to buy, fast enough to keep the shopper, at a fixed cost.",
    does: "Every shopper gets a salesperson who answers, recommends and closes.",
    icons: ["chat", "cart"],
    before: { logos: "models", figure: "Paid for every conversation", points: ["A fee on each shopper chat", "Shopper chats sent outside", "Slow replies lose the sale"] },
    after: { figure: "One fixed monthly cost", points: ["Same cost in peak season", "Chats stay inside", "Answers while they browse"] },
    results: [
      { value: "Fixed cost", label: "not a fee per conversation" },
      { value: SPEED, label: "replies while the shopper waits" },
      privateResult("Shopper conversations"),
    ],
    elsewhere: "The same job: any business that sells or serves by chat. Bank helpdesks, ticket counters, dealer enquiries.",
  },
];

// What AI agents can do for a business. Each title is an outcome an executive would ask
// for; the text says how it works in one or two plain sentences; `gain` is the payoff.
export const agentUses = [
  {
    icon: "table",
    title: "Automate your CRM",
    text: "An AI agent updates records, sends follow-ups and books meetings, so your sales team sells instead of typing.",
    gain: "Lower cost for every customer served",
  },
  {
    icon: "phone",
    title: "Take support calls without hiring",
    text: "An AI agent answers customer calls day and night, in Hindi and English, and hands only the hard ones to your staff.",
    gain: "No waiting, no extra headcount",
  },
  {
    icon: "chat",
    title: "Answer every customer in seconds",
    text: "Complaints, order questions and service requests are sorted and answered the moment they arrive.",
    gain: "No backlog, even in peak season",
  },
  {
    icon: "papers",
    title: "Stop entering invoices by hand",
    text: "Supplier invoices, bills and forms are read and entered into your accounting system automatically.",
    gain: "Fewer errors, faster month end",
  },
  {
    icon: "bill",
    title: "Catch wrong bills before you pay",
    text: "Every vendor bill and claim is checked against its contract or purchase order before money goes out.",
    gain: "Overbilling stopped at the door",
  },
  {
    icon: "search",
    title: "Give every employee an expert",
    text: "Staff ask a question in plain language and get the answer from your own policies, manuals and records.",
    gain: "Less time lost searching and asking",
  },
];

// Training and running your own models, against having us do it. Each cell is a short
// headline and one line of detail (keep the detail under about 90 characters).
export const versusRows = [
  {
    icon: "papers",
    topic: "Training data",
    alone: ["Months of collecting and labelling", "Your staff must hand-label thousands of examples before training can even start."],
    us: ["We generate it for you", "Our system creates the training examples from a small sample of your own work."],
  },
  {
    icon: "people",
    topic: "AI engineers",
    alone: ["A scarce, costly team to hire", "Specialists in training models are hard to find and expensive to keep."],
    us: ["Our team is your team", "You get the specialists from day one, without adding headcount."],
  },
  {
    icon: "scales",
    topic: "Knowing it works",
    alone: ["No proof it is good enough", "You have to build your own tests before trusting it with customers."],
    us: ["Proven side by side", "It is tested against how the job is done today before any work moves."],
  },
  {
    icon: "train",
    topic: "Keeping it current",
    alone: ["Goes stale as your business changes", "New products, forms and rules mean retraining, again and again."],
    us: ["We watch it and retrain it", "Quality is monitored, and the model is updated as your work changes."],
  },
  {
    icon: "pick",
    topic: "Your risk",
    alone: ["Money spent before any result", "Team, servers and months of work are paid for whether or not it succeeds."],
    us: ["One job at a time", "You see cost, speed and quality on your own numbers, then decide."],
  },
];

// The founders. Edit freely: only the lines below were confirmed from public profiles.
// Photos are the square pictures at each `photo` path under /public; initials show if one is missing.
export const founders = [
  {
    name: "Divyanshu Shekhar",
    role: "CEO",
    points: ["Startup founder, most recently Reticle", "Hult Prize campus winner, 2022", "Entrepreneurs First"],
    url: "https://www.linkedin.com/in/dshekhar17/",
    photo: "/team/divyanshu.jpg",
  },
  {
    name: "Abhinav Vashisht",
    role: "CTO",
    points: ["Software engineer at Amazon for over four years", "Entrepreneurs First"],
    url: "https://www.linkedin.com/in/abhinav-vashisht-305128131/",
    photo: "/team/abhinav.jpg",
  },
];
