import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      colors: {
        // Royal blue design system — no purple
        brand: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1b3aa0",
          900: "#1e3a8a",
          950: "#172554",
        },
        surface: {
          DEFAULT: "#ffffff",
          50:  "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          dark: "#0a0f1e",
          "dark-card": "#111827",
          "dark-border": "#1f2937",
        },
      },
      backgroundImage: {
        "gradient-brand":
          "linear-gradient(135deg, #2563eb 0%, #1b3aa0 100%)",
        "gradient-brand-light":
          "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
        "gradient-hero":
          "linear-gradient(135deg, #eff6ff 0%, #f0f9ff 50%, #f8fafc 100%)",
        "gradient-dark":
          "linear-gradient(135deg, #0a0f1e 0%, #111827 50%, #0f172a 100%)",
      },
      boxShadow: {
        brand:    "0 4px 24px rgba(37, 99, 235, 0.25)",
        "brand-lg": "0 8px 40px rgba(37, 99, 235, 0.35)",
        card:     "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 24px rgba(0,0,0,0.10)",
        float:    "0 8px 32px rgba(0,0,0,0.12)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.5rem",
      },
      animation: {
        "fade-in":    "fadeIn 0.5s ease-in-out",
        "slide-up":   "slideUp 0.55s ease-out",
        "float":      "float 4s ease-in-out infinite",
        "float-slow": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
