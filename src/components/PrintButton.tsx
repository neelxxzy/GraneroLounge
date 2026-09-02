"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 rounded-lg bg-lounge-accent px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-lounge-bg shadow-lg shadow-lounge-accent/20 transition hover:brightness-110 active:scale-[0.98]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-4 w-4"
      >
        <path d="M6 9V2h12v7" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="6" y="14" width="12" height="8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Print Notice Board
    </button>
  );
}
