/**
 * The design tokens for code that cannot read CSS variables: canvas drawing, generated images (Satori),
 * the cover-image prompt. The source of truth is tokens.css; these values must match it.
 */
export const color = {
  bg: "#000",
  surface3: "#0b0d12",
  ink: "#f5f8ff",
  inkSoft: "#c9d1e0",
  inkMuted: "rgba(226, 236, 255, 0.55)",
  line: "rgba(226, 236, 255, 0.13)",
  spectrum: { pink: "#ff91b3", amber: "#f5c582", teal: "#8be8d7", violet: "#989bff" },
} as const;

/** Chart series, in the only order they may be assigned (see tokens.css). */
export const series = ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#008300", "#9085e9", "#e66767"] as const;
export const seriesMuted = "#4a505c";
