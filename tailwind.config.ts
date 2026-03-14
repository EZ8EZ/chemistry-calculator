import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Chemistry-specific colors
        chem: {
          carbon: "#909090",
          hydrogen: "#FFFFFF",
          oxygen: "#FF4444",
          nitrogen: "#3050F8",
          sulfur: "#FFFF30",
          phosphorus: "#FF8000",
          chlorine: "#1FF01F",
          bromine: "#A62929",
          fluorine: "#90E050",
          iodine: "#940094",
          boron: "#FFB5B5",
          silicon: "#F0C8A0",
          bond: "#8B8B8B",
          warning: "#F59E0B",
          valid: "#10B981",
          invalid: "#EF4444",
          ambiguous: "#8B5CF6",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        chem: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "atom-pulse": "atom-pulse 2s ease-in-out infinite",
        "bond-draw": "bond-draw 0.3s ease-out",
        "panel-slide": "panel-slide 0.2s ease-out",
        "fade-in": "fade-in 0.15s ease-out",
      },
      keyframes: {
        "atom-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "bond-draw": {
          "0%": { strokeDashoffset: "100" },
          "100%": { strokeDashoffset: "0" },
        },
        "panel-slide": {
          "0%": { transform: "translateX(10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
