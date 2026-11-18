import paths from "@/logo/paths.json";

const { mark, word } = paths;

// Same lockup geometry as scripts/build-logos.mjs: mark = 2.4 cap heights, wordmark tucked under the hook.
const MS = (2.4 * word.capH) / mark.h;
const LOCK_H = mark.h * MS;
const WORD_X = Math.round(mark.w * MS * 0.905);
const LOCK_W = WORD_X + word.w;

export function Mark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox={`0 0 ${mark.w} ${mark.h}`} fill="currentColor" aria-hidden="true">
      <path d={mark.d} />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox={`0 0 ${LOCK_W} ${LOCK_H}`} fill="currentColor" role="img" aria-label="Adaptral">
      <path transform={`scale(${MS})`} d={mark.d} />
      <path transform={`translate(${WORD_X} ${(LOCK_H - word.capH) / 2})`} d={word.d} />
    </svg>
  );
}
