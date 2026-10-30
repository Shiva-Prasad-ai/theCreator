// ============================================================================
// CreatorOS AI - Tailwind CSS Preset
// ============================================================================
//
// INTEGRATION METHODS BY TAILWIND VERSION:
//
// Option A: Tailwind CSS v3 (Standard Next.js tailwind.config.ts / .js)
// ----------------------------------------------------------------------------
// import type { Config } from "tailwindcss";
// const config: Config = {
//   presets: [require("./design-system/styles/tailwind-preset.js")],
//   content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
// };
// export default config;
//
// Option B: Tailwind CSS v4 (CSS-first engine)
// ----------------------------------------------------------------------------
// In app/globals.css:
//   @import "tailwindcss";
//   @config "../../design-system/styles/tailwind-preset.js";
// (Or alternatively use the @theme definitions provided in shadcn-theme.css)
// ============================================================================

module.exports = {
  darkMode: ['class'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1440px',
      },
    },
    extend: {
      colors: {
        // shadcn/ui dynamic token bindings
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
          950: '#2E1065',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          400: '#22D3EE',
          500: '#06B6D4',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        // Direct brand utility tokens
        brand: {
          bg: '#0B1020',
          surface: '#151C30',
          'surface-subtle': '#111728',
          'surface-elevated': '#1D2640',
          'surface-border': '#263453',
          violet: '#7C3AED',
          'violet-glow': 'rgba(124, 58, 237, 0.45)',
          cyan: '#22D3EE',
          'cyan-glow': 'rgba(34, 211, 238, 0.45)',
          'text-primary': '#F8FAFC',
          'text-muted': '#AAB5CD',
        },
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        display: ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.035em', fontWeight: '700' }],
        h1: ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.025em', fontWeight: '700' }],
        h2: ['2rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
        h3: ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.015em', fontWeight: '600' }],
        h4: ['1.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        h5: ['1.125rem', { lineHeight: '1.35', letterSpacing: '-0.005em', fontWeight: '600' }],
        h6: ['1rem', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '600' }],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      boxShadow: {
        'glow-violet': '0 0 25px -5px rgba(124, 58, 237, 0.5)',
        'glow-cyan': '0 0 25px -5px rgba(34, 211, 238, 0.45)',
        'glow-combined': '0 0 35px -5px rgba(124, 58, 237, 0.35), 0 0 15px -3px rgba(34, 211, 238, 0.3)',
        'surface-card': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #7C3AED 0%, #22D3EE 100%)',
        'surface-gradient': 'linear-gradient(180deg, rgba(21, 28, 48, 0.95) 0%, rgba(11, 16, 32, 0.98) 100%)',
        'radial-violet': 'radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.18) 0%, transparent 75%)',
        'radial-cyan': 'radial-gradient(circle at 100% 100%, rgba(34, 211, 238, 0.12) 0%, transparent 60%)',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite',
      },
    },
  },
};

