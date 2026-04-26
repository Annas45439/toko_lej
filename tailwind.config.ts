import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-base)",
        surface: "var(--bg-surface)",
        elevated: "var(--bg-elevated)",
        brand: {
          cyan: "#06b6d4",
          purple: "#8b5cf6",
          green: "#10b981",
          orange: "#f59e0b",
          red: "#ef4444",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        glow: "0 0 20px rgba(6,182,212,0.25)",
        "glow-purple": "0 0 20px rgba(139,92,246,0.25)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(6,182,212,0)" },
          "50%": { boxShadow: "0 0 16px 4px rgba(6,182,212,0.2)" },
        },
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        fadeIn: "fadeIn 0.3s ease",
        slideUp: "slideUp 0.4s ease",
        pulseGlow: "pulseGlow 2s ease-in-out infinite",
      },
      backdropBlur: {
        xs: "4px",
      },
    },
  },
  plugins: [],
};
export default config;
