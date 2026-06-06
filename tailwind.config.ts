import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/context/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#f5f8fc",
        ink: "#101827",
        muted: "#64748b",
        line: "#dbe5ef",
        "line-strong": "#c4d3e1",
        primary: {
          DEFAULT: "#183954",
          2: "#2a648d",
          3: "#0a2337",
        },
        gold: "#d5b36a",
        success: "#1d9e67",
        danger: "#d45c5c",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Georgia", "Times New Roman", "serif"],
      },
      borderRadius: {
        xl2: "22px",
        xl3: "26px",
      },
      boxShadow: {
        soft: "0 20px 50px rgba(8, 20, 34, 0.1)",
        lift: "0 30px 70px rgba(6, 15, 26, 0.16)",
      },
      maxWidth: {
        container: "1180px",
      },
      keyframes: {
        floatHero: {
          "0%,100%": { transform: "translateY(8px) rotate(-4deg)" },
          "50%": { transform: "translateY(-6px) rotate(-2deg)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        floatHero: "floatHero 5.5s ease-in-out infinite",
        fadeUp: "fadeUp 0.4s ease forwards",
      },
    },
  },
  plugins: [],
};

export default config;
