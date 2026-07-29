// apps/web/tailwind.config.ts

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // -------------------------------------------------------------------
      // Couleurs WI-LO
      // -------------------------------------------------------------------
      colors: {
        'wi-black': '#0A0A0F',
        'wi-dark': '#111118',
        'wi-card': '#1A1A24',
        'wi-card-hover': '#22222E',
        'wi-border': '#2A2A38',
        'wi-border-light': '#3A3A4A',

        'wi-yellow': {
          DEFAULT: '#F5C518',
          dim: '#B8940F',
          glow: 'rgba(245, 197, 24, 0.15)',
        },

        'wi-text': {
          primary: '#FFFFFF',
          secondary: '#B0B0C0',
          muted: '#6A6A7A',
          disabled: '#4A4A58',
        },

        // Accents sport
        'wi-sport': {
          football: '#00C853',
          basketball: '#FF6D00',
          tennis: '#FFD600',
          rugby: '#D50000',
          formula1: '#FF1744',
          cycling: '#FF9100',
          mma: '#D500F9',
          esports: '#00E5FF',
        },

        // Rareté
        'wi-rarity': {
          bronze: '#CD7F32',
          silver: '#C0C0C0',
          gold: '#FFD700',
          icon: '#00E5FF',
          legend: '#FF4081',
        },

        // États
        'wi-success': '#4CAF50',
        'wi-error': '#EF5350',
        'wi-warning': '#FF9800',
        'wi-info': '#42A5F5',
      },

      // -------------------------------------------------------------------
      // Typographie
      // -------------------------------------------------------------------
      fontFamily: {
        display: ['Teko', 'Impact', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.2' }],
      },

      // -------------------------------------------------------------------
      // Espacement
      // -------------------------------------------------------------------
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },

      // -------------------------------------------------------------------
      // Bordures
      // -------------------------------------------------------------------
      borderRadius: {
        'sm': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.25rem',
      },

      // -------------------------------------------------------------------
      // Ombres
      // -------------------------------------------------------------------
      boxShadow: {
        'wi-sm': '0 1px 2px rgba(0, 0, 0, 0.4)',
        'wi-md': '0 4px 12px rgba(0, 0, 0, 0.5)',
        'wi-lg': '0 8px 24px rgba(0, 0, 0, 0.6)',
        'wi-xl': '0 16px 48px rgba(0, 0, 0, 0.7)',
        'wi-glow': '0 0 20px rgba(245, 197, 24, 0.15)',
        'wi-glow-legend': '0 0 30px rgba(255, 64, 129, 0.35)',
      },

      // -------------------------------------------------------------------
      // Animations
      // -------------------------------------------------------------------
      animation: {
        'fade-in': 'fadeIn 200ms ease',
        'fade-out': 'fadeOut 200ms ease',
        'slide-up': 'slideUp 300ms ease',
        'slide-down': 'slideDown 300ms ease',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(245, 197, 24, 0.1)' },
          '50%': { boxShadow: '0 0 25px rgba(245, 197, 24, 0.3)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;