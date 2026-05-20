import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#f6f4ef",
        foreground: "#1c1917",
        card: "#fffdf8",
        border: "#d6d3d1",
        muted: "#78716c",
        accent: "#0f766e",
        accentForeground: "#f0fdfa",
        danger: "#b91c1c"
      },
      boxShadow: {
        soft: "0 20px 60px rgba(28, 25, 23, 0.08)"
      },
      borderRadius: {
        xl: "1.25rem"
      }
    }
  },
  plugins: []
};

export default config;
