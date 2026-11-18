"use client";

import type { ReactNode } from "react";
import { site } from "./site";

type Tracker = (...args: unknown[]) => void;

// The one conversion on the page: report it to GA4 and Clarity by name, wherever the link sits.
export function BookCall({ where, className, children }: { where: string; className?: string; children: ReactNode }) {
  return (
    <a
      className={className}
      href={site.bookingUrl}
      target="_blank"
      rel="noopener"
      onClick={() => {
        const w = window as unknown as { gtag?: Tracker; clarity?: Tracker };
        w.gtag?.("event", "book_call_click", { location: where });
        w.clarity?.("event", "book_call_click");
      }}
    >
      {children}
    </a>
  );
}
