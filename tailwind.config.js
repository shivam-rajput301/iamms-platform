/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        DEFAULT: "0.5rem",   // 8px — matching Login Page 10px rounded feel
        sm: "0.25rem",       // 4px
        md: "0.5rem",        // 8px
        lg: "0.625rem",      // 10px — matches Login Page inputs/buttons
        xl: "0.75rem",       // 12px
        "2xl": "1rem",       // 16px
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      colors: {
        // ── Industrial Dark Palette (from Login Page) ──────────────
        industrial: {
          bg:      "#09111F", // Login Page NAVY — page background
          card:    "#0E1628", // Card surface — slightly lighter than bg
          surface: "#0A1626", // Secondary surface / input bg
          border:  "#1C2E4A", // 1px card border (cyan-tinted navy)
          hover:   "#122038", // Hover surface state
        },

        // ── Brand Primary: Cyan (#17C7E8) — Login Page CYAN ────────
        brand: {
          50:  "#f0fdff",
          100: "#ccf7fe",
          200: "#99edfd",
          300: "#5ddffb",
          400: "#2bcdf5",
          500: "#17C7E8", // Login Page CYAN — primary brand
          600: "#0da8c8",
          700: "#0d87a0",
          800: "#116c82",
          900: "#135a6c",
          950: "#073a49",
          DEFAULT: "#17C7E8",
        },

        // ── Neutral Industrial Steel Scale ──────────────────────────
        steel: {
          50:  "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1C2E4A", // Aligned to industrial border
          900: "#0E1628", // Aligned to industrial card
          950: "#09111F", // Aligned to industrial bg (Login Page NAVY)
        },

        // ── Semantically fixed status colors ────────────────────────
        status: {
          success: "#10b981", // Operational / Completed — green
          warning: "#f59e0b", // Pending / Maintenance — amber
          critical: "#ef4444", // Breakdown / Critical — red
          info:    "#17C7E8", // Information / In-Progress — cyan (brand)
          neutral: "#64748b", // Closed / Retired — slate
        },
      },
      boxShadow: {
        none: "none",
        flat: "0 0 0 1px #1C2E4A",
        "card": "0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px rgba(23,199,232,0.08)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.5), 0 0 0 1px rgba(23,199,232,0.14)",
        "cyan-glow": "0 0 12px rgba(23,199,232,0.2)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.2s ease-out",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
