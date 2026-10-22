import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: 'rgb(var(--bg-base) / <alpha-value>)',
          surface: 'rgb(var(--bg-surface) / <alpha-value>)',
          elevated: 'rgb(var(--bg-elevated) / <alpha-value>)'
        },
        fg: {
          DEFAULT: 'rgb(var(--fg-default) / <alpha-value>)',
          muted: 'rgb(var(--fg-muted) / <alpha-value>)',
          subtle: 'rgb(var(--fg-subtle) / <alpha-value>)'
        },
        border: 'rgb(var(--border) / <alpha-value>)',
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95'
        },
        accent: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2'
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#f43f5e',
        info: '#3b82f6'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
      },
      borderRadius: {
        '4xl': '2rem'
      },
      boxShadow: {
        glow: '0 0 40px -10px rgb(139 92 246 / 0.6)',
        'glow-accent': '0 0 40px -10px rgb(34 211 238 / 0.6)'
      },
      backgroundImage: {
        'hero-glow':
          'radial-gradient(ellipse at top, rgba(139,92,246,0.25), transparent 60%), radial-gradient(ellipse at bottom right, rgba(34,211,238,0.18), transparent 60%)',
        'grid-fade':
          'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)'
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' }
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out both',
        'slide-up': 'slide-up 300ms ease-out both',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        shimmer: 'shimmer 1.8s infinite'
      }
    }
  },
  plugins: []
} satisfies Config;
