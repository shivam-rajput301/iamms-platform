/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        DEFAULT: '0.375rem', // 6px industrial radius
        sm: '0.25rem',       // 4px
        md: '0.375rem',      // 6px
        lg: '0.375rem',      // 6px (overridden from default 8px)
        xl: '0.5rem',        // 8px (overridden from default 12px)
        '2xl': '0.5rem',     // 8px
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        // Base Industrial Palette
        industrial: {
          bg: '#0f1420',      // Base dark background
          card: '#1a2130',    // Card & surface background
          surface: '#141a29', // Secondary surface fill
          border: '#2a3242',  // 1px crisp industrial border
          hover: '#222b3d',   // Hover surface state
        },
        // Brand Primary: Maroon (#9E1B1B)
        brand: {
          50: '#fdf2f2',
          100: '#fce4e4',
          200: '#f8c5c5',
          300: '#f39696',
          400: '#e95b5b',
          500: '#d43131',
          600: '#b52020',
          700: '#9E1B1B', // Primary Brand Maroon
          800: '#821919',
          900: '#6c1a1a',
          950: '#3b0909',
          DEFAULT: '#9E1B1B',
        },
        // Brand Secondary: Gold (#D4A72C)
        gold: {
          50: '#fdfbe8',
          100: '#fbf4c3',
          200: '#f7e789',
          300: '#f3d44d',
          400: '#eec223',
          500: '#D4A72C', // Secondary Brand Gold
          600: '#b6831d',
          700: '#915f1b',
          800: '#784b1d',
          900: '#663d1d',
          DEFAULT: '#D4A72C',
        },
        // Neutral Industrial Steel Scale
        steel: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#2a3242', // Aligned to #2a3242 border
          900: '#1a2130', // Aligned to #1a2130 surface
          950: '#0f1420', // Aligned to #0f1420 background
        },
        // Semantically fixed status colors
        status: {
          success: '#10b981', // Active / Operational
          warning: '#f59e0b', // Inspection / Warning
          critical: '#e11d48',// Breakdown / Emergency
          info: '#3b82f6',    // Assigned / In Progress
          neutral: '#64748b', // Closed / Retired
        },
      },
      boxShadow: {
        none: 'none',
        flat: '0 0 0 1px #2a3242',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
