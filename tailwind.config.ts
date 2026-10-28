import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./admin-portal/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#1C0D05",
        foreground: "#ffffff",
        atelier: {
          bg: "#2A1406",
          dark: "#140702",
          surface: "rgba(0, 0, 0, 0.40)",
          glass: "rgba(0, 0, 0, 0.20)",
          "glass-border": "rgba(255, 255, 255, 0.15)",
          gold: "#E6C280",
          "gold-deep": "#B08D57",
          "gold-light": "#F4E8D0",
          muted: "rgba(255, 255, 255, 0.75)",
          subtle: "rgba(255, 255, 255, 0.55)",
        },
      },
      borderRadius: {
        pill: "9999px",
        card: "14px",
        "card-lg": "20px",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Inter"',
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
        display: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"Inter"',
          "sans-serif",
        ],
      },
      boxShadow: {
        apple: "0 4px 24px -2px rgba(0, 0, 0, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)",
        "apple-hover": "0 12px 36px -4px rgba(0, 0, 0, 0.1), 0 4px 12px -2px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
