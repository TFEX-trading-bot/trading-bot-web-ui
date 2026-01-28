// /Users/tung/Desktop/CE Project/trading-bot-web-ui/tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        kanit: ["var(--font-kanit)", "sans-serif"],
      },
      colors: {
        brand: {
          500: "#A545F2", // Main Purple
          600: "#8029c9", // Darker Purple for Hover
          gold: "#F59E0B",
          dark: "#0F172A", // Slate 900
          card: "#1E293B", // Slate 800
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        marquee: "marquee 20s linear infinite",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
