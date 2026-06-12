import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "aed-pink": "#E88A92",
        "aed-pink-deep": "#C66670",
        "aed-pink-mist": "#F9E4E6",
        "aed-pink-blush": "#FDF4F5",
        "aed-cream": "#FBF6EC",
        "aed-bg": "#FFFDF9",
        "aed-surface": "#FFFFFF",
        "aed-surface-2": "#FAF8F4",
        "aed-fg1": "#3C2A2D",
        "aed-fg2": "#6B5A5C",
        "aed-fg3": "#9B8B8D",
        "aed-success": "#7FB28A",
        "aed-warning": "#E8A961",
        "aed-danger": "#D97068",
      },
      fontFamily: {
        display: ["Cormorant Garamond", "Playfair Display", "Georgia", "serif"],
        body: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "20px",
        pill: "999px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(60,42,45,.04)",
        md: "0 4px 12px rgba(60,42,45,.06)",
        lg: "0 12px 32px rgba(60,42,45,.10)",
      },
    },
  },
  plugins: [],
};
export default config;
