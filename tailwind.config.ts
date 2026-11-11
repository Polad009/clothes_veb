import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0A0A0A",
          900: "#0A0A0A",
          850: "#111111",
          800: "#161616",
          700: "#1F1F1F",
          600: "#2A2A2A",
          500: "#3A3A3A",
        },
        bone: {
          DEFAULT: "#EDEAE3",
          dim: "#A8A49C",
          faint: "#6E6B66",
        },
        sale: "#FF4D3D",
        tile: "#E6E3DC",
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
        grotesk: ["var(--font-archivo)", '"Helvetica Neue"', "Arial", "sans-serif"],
        sans: [
          "var(--font-jakarta)",
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          '"Inter"',
          "sans-serif",
        ],
        display: [
          '"Instrument Serif"',
          '"EB Garamond"',
          "Georgia",
          "serif",
        ],
        serif: [
          '"Instrument Serif"',
          '"EB Garamond"',
          "Georgia",
          "serif",
        ],
        body: [
          "var(--font-jakarta)",
          "-apple-system",
          "BlinkMacSystemFont",
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
