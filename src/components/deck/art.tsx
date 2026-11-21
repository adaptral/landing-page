import type { ReactNode } from "react";

// The deck's pictures: logos, small icons and the larger illustrations. All drawn as SVG
// so they stay sharp on a projector and in print.

export function Mark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 46" fill="none" aria-hidden="true">
      <path d="M29 6C15-3 20 49 6 39" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" />
    </svg>
  );
}

// Claude's spark, drawn by hand as uneven rays. Close to the real mark, not a copy of the file.
const CLAUDE_RAYS = [
  [0, 10.4], [28, 8.6], [57, 10.2], [88, 8.4], [118, 10.6], [150, 8.8],
  [180, 10.2], [212, 8.6], [240, 10.5], [270, 8.5], [300, 10.3], [331, 8.8],
];

export function ClaudeLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" role="img" aria-label="Claude">
      {CLAUDE_RAYS.map(([angle, length]) => {
        const radians = (angle * Math.PI) / 180;
        return (
          <line
            key={angle}
            x1={12 + Math.cos(radians) * 1.6}
            y1={12 + Math.sin(radians) * 1.6}
            x2={12 + Math.cos(radians) * length}
            y2={12 + Math.sin(radians) * length}
            stroke="#d97757"
            strokeWidth="2.3"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

export function ChatGptLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" role="img" aria-label="ChatGPT">
      <path
        fill="#0b0d12"
        d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
      />
    </svg>
  );
}

// The two big models the customers were renting, shown side by side with their names.
export function BigModels() {
  return (
    <span className="deck-logos">
      <span><ClaudeLogo />Claude</span>
      <span><ChatGptLogo />ChatGPT</span>
    </span>
  );
}

// The open small models we train from. Logo files are in /public/models.
export function SmallModels() {
  return (
    <span className="deck-logos deck-logos-small">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <span><img src="/models/qwen.svg" alt="" />Qwen</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <span><img src="/models/gemma.svg" alt="" />Gemma</span>
    </span>
  );
}

export function Arrow({ down }: { down?: boolean }) {
  return (
    <svg className={down ? "deck-arrow deck-arrow-down" : "deck-arrow"} viewBox="0 0 40 24" aria-hidden="true">
      <path d="M2 12h32M25 3l10 9-10 9" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Small line icons, all on a 48 grid.
const ICONS: Record<string, ReactNode> = {
  phone: <path d="M14 6h7l3 9-5 3c2 5 5 8 10 10l3-5 9 3v7c0 3-2 5-5 5C19 37 9 27 9 11c0-3 2-5 5-5z" />,
  notes: <><rect x="10" y="5" width="28" height="38" rx="3" /><path d="M16 14h16M16 21h16M16 28h16M16 35h9" /></>,
  papers: <><path d="M9 14l22-6 7 26-22 6z" /><path d="M16 19l12-3M18 25l12-3M20 31l7-2" /></>,
  table: <><rect x="6" y="9" width="36" height="30" rx="3" /><path d="M6 19h36M6 29h36M19 9v30M31 9v30" /></>,
  chat: <><path d="M6 9h24v16H16l-6 6v-6H6z" /><path d="M34 17h8v16h-4v6l-6-6h-8v-4" /></>,
  trays: <><path d="M5 12h10v8H5zM19 12h10v8H19zM33 12h10v8H33z" /><path d="M10 20v8M24 20v8M38 20v8M4 30h12v9H4zM18 30h12v9H18zM32 30h12v9H32z" /></>,
  bill: <><path d="M11 5h26v38l-4.5-3-4.5 3-4-3-4.5 3-4-3-4.5 3z" /><path d="M18 14h12M18 21h12M18 28h7" /></>,
  flag: <><rect x="8" y="6" width="32" height="36" rx="3" /><path d="M14 16l3 3 5-6M14 30l3 3 5-6" /><path d="M27 17h8M27 31h8" /></>,
  car: <><path d="M5 30v-7l5-2 4-9h18l5 9 6 2v7z" /><path d="M12 21h24" /><circle cx="14" cy="32" r="4" /><circle cx="34" cy="32" r="4" /></>,
  cart: <><path d="M5 9h6l5 21h21l4-14H14" /><circle cx="19" cy="38" r="3" /><circle cx="34" cy="38" r="3" /></>,
  people: <><circle cx="16" cy="15" r="6" /><circle cx="33" cy="17" r="5" /><path d="M5 40c0-8 5-13 11-13s11 5 11 13M30 28c7-1 13 3 13 12" /></>,
  search: <><circle cx="21" cy="21" r="12" /><path d="M30 30l12 12" /></>,
  train: <><path d="M6 38l10-12 8 6 10-16 8 8" /><path d="M6 8v34h36" /></>,
  scales: <><path d="M24 6v36M12 42h24M8 14h32" /><path d="M8 14l-5 12a6 6 0 0 0 10 0zM40 14l-5 12a6 6 0 0 0 10 0z" /></>,
  switch: <><rect x="4" y="14" width="40" height="20" rx="10" /><circle cx="34" cy="24" r="6" /></>,
  pick: <><circle cx="24" cy="24" r="18" /><circle cx="24" cy="24" r="10" /><circle cx="24" cy="24" r="2.5" /></>,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg className={className ?? "deck-icon"} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

// "The bill grows": the same bar, taller each month, and a receipt that keeps getting longer.
export function GrowingBill() {
  const bars = [34, 52, 74, 102, 138];
  return (
    <svg className="deck-art" viewBox="0 0 320 210" role="img" aria-label="A bill that grows every month">
      <path d="M22 186h206" stroke="#0b0d12" strokeWidth="2.5" strokeLinecap="round" />
      {bars.map((height, index) => (
        <rect key={height} x={30 + index * 40} y={186 - height} width="26" height={height} rx="3" fill="#c8323f" opacity={0.35 + index * 0.16} />
      ))}
      <path d="M32 140C80 132 150 104 204 34" fill="none" stroke="#0b0d12" strokeWidth="2.5" strokeDasharray="1 7" strokeLinecap="round" />
      <path d="M192 34h14v14" fill="none" stroke="#0b0d12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <g transform="rotate(5 272 104)">
        <path d="M240 18h62v170l-7.75-6-7.75 6-7.75-6-7.75 6-7.75-6-7.75 6-7.75-6-7.75 6z" fill="#fff" stroke="#0b0d12" strokeWidth="2.5" strokeLinejoin="round" />
        {[38, 56, 74, 92, 110, 128].map((y) => (
          <g key={y}>
            <path d={`M250 ${y}h24`} stroke="#aab0bc" strokeWidth="3" strokeLinecap="round" />
            <path d={`M282 ${y}h10`} stroke="#c8323f" strokeWidth="3" strokeLinecap="round" />
          </g>
        ))}
        <path d="M250 150h42" stroke="#0b0d12" strokeWidth="2" />
        <text x="271" y="172" textAnchor="middle" fontSize="17" fontWeight="700" fill="#c8323f">₹₹₹</text>
      </g>
    </svg>
  );
}

// "Your data leaves": documents travelling from your office to a cloud that is not yours.
export function DataLeaving() {
  return (
    <svg className="deck-art" viewBox="0 0 320 210" role="img" aria-label="Documents leaving your office for someone else's servers">
      <rect x="18" y="62" width="92" height="124" rx="4" fill="#fff" stroke="#0b0d12" strokeWidth="2.5" />
      {[80, 108, 136].map((y) => [32, 56, 80].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="14" height="16" rx="2" fill="#dfe2e8" />))}
      <rect x="54" y="162" width="20" height="24" fill="#0b0d12" />
      <path d="M8 186h112" stroke="#0b0d12" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M118 96C150 40 196 34 232 62" fill="none" stroke="#c8323f" strokeWidth="2.5" strokeDasharray="2 8" strokeLinecap="round" />
      <path d="M220 52l13 10-15 6" fill="none" stroke="#c8323f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {[[134, 62, -18], [164, 38, -6], [196, 34, 10]].map(([x, y, turn]) => (
        <g key={x} transform={`rotate(${turn} ${x + 10} ${y + 13})`}>
          <rect x={x} y={y} width="20" height="26" rx="2.5" fill="#fff" stroke="#0b0d12" strokeWidth="2" />
          <path d={`M${x + 5} ${y + 8}h10M${x + 5} ${y + 14}h10M${x + 5} ${y + 20}h6`} stroke="#0b0d12" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      ))}
      <path d="M226 132a24 24 0 0 1 8-46 30 30 0 0 1 56 6 21 21 0 0 1 2 40z" fill="#f4f5f7" stroke="#0b0d12" strokeWidth="2.5" strokeLinejoin="round" />
      <text x="62" y="204" textAnchor="middle" fontSize="13" fontWeight="600" fill="#0b0d12">Your office</text>
      <text x="258" y="158" textAnchor="middle" fontSize="13" fontWeight="600" fill="#c8323f">Someone else&rsquo;s</text>
      <text x="258" y="175" textAnchor="middle" fontSize="13" fontWeight="600" fill="#c8323f">servers</text>
    </svg>
  );
}

// "Every answer waits": a request going all the way out and back while the clock runs.
export function SlowReply() {
  return (
    <svg className="deck-art" viewBox="0 0 320 210" role="img" aria-label="A request travelling to a far-away server and back while a clock runs">
      <rect x="14" y="92" width="64" height="94" rx="4" fill="#fff" stroke="#0b0d12" strokeWidth="2.5" />
      {[108, 134].map((y) => [26, 50].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="14" height="16" rx="2" fill="#dfe2e8" />))}
      <path d="M6 186h82" stroke="#0b0d12" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M236 150a22 22 0 0 1 7-43 28 28 0 0 1 52 6 19 19 0 0 1 2 37z" fill="#f4f5f7" stroke="#0b0d12" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M84 112C120 60 200 56 240 104" fill="none" stroke="#c8323f" strokeWidth="2.5" strokeDasharray="2 8" strokeLinecap="round" />
      <path d="M228 96l13 9-15 5" fill="none" stroke="#c8323f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M236 160C200 196 124 196 88 160" fill="none" stroke="#c8323f" strokeWidth="2.5" strokeDasharray="2 8" strokeLinecap="round" />
      <path d="M102 164l-15-5 5 15" fill="none" stroke="#c8323f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="162" cy="40" r="28" fill="#fff" stroke="#0b0d12" strokeWidth="2.5" />
      <path d="M162 22v18l12 8" fill="none" stroke="#c8323f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <text x="46" y="204" textAnchor="middle" fontSize="13" fontWeight="600" fill="#0b0d12">Your office</text>
      <text x="266" y="176" textAnchor="middle" fontSize="13" fontWeight="600" fill="#c8323f">Far-away server</text>
    </svg>
  );
}
