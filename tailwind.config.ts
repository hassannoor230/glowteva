import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F8F5F0',
        'muted-cream': '#EEE9E1',
        'soft-border': '#DED7CC',
        gold: '#C5A46E',
        forest: '#2C3E2D',
        'soft-green': '#4A5D4E',
        'dark-text': '#243027',
        white: '#FFFFFF',
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        elegant: '0 4px 24px rgba(36, 48, 39, 0.06)',
        soft: '0 2px 12px rgba(36, 48, 39, 0.04)',
        gold: '0 4px 20px rgba(197, 164, 110, 0.15)',
      },
      borderRadius: {
        soft: '0.5rem',
        elegant: '0.75rem',
      },
      spacing: {
        section: '6rem',
        'section-sm': '4rem',
      },
      transitionTimingFunction: {
        elegant: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out',
        'slide-up': 'slide-up 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
