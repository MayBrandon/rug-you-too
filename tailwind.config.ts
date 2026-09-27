import type { Config } from "tailwindcss";

// Palette et typos issues de la maquette validée (canvas "Rug You Too — Maquette").
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#120E1C",
          900: "#1B1030",
          800: "#1B1428",
          700: "#241933",
          600: "#322246",
        },
        accent: {
          pink: "#FF3D9A",
          gold: "#FFC94D",
          teal: "#2DE0C4",
          violet: "#7A3DFF",
        },
        ink: {
          light: "#FBF3E7",
          muted: "#C8BFDB",
          faint: "#6B5C82",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"], // Anton
        body: ["var(--font-body)", "sans-serif"], // Barlow Condensed
      },
    },
  },
  plugins: [],
};

export default config;
