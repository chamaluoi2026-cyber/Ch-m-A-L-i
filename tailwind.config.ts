import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        forest: "#0F5C4A",
        moss: "#6C7A45",
        beige: "#F8F6F2",
        clay: "#B86F3C",
        brown: "#7B5B3E",
        stone: "#ECECEC",
        ink: "#16211E"
      },
      fontFamily: {
        sans: ["Segoe UI", "Roboto", "Helvetica Neue", "Arial", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 24px 80px rgba(15, 92, 74, 0.12)",
        card: "0 16px 44px rgba(22, 33, 30, 0.10)"
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem"
      }
    }
  },
  plugins: [tailwindcssAnimate]
};

export default config;
