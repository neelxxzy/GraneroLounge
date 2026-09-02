import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        lounge: {
          bg: "#0f1115",
          panel: "#171a21",
          panel2: "#1e222b",
          border: "#2a2f3a",
          accent: "#f2c14e",
          good: "#22c55e",
          bad: "#ef4444",
          text: "#f5f5f4",
          muted: "#9ca3af",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Arial Narrow", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
