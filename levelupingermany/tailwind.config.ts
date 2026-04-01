import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Logo: dark red (LEVEL UP), orange (U accent), grey (IN GERMANY), black (outline)
        primary: {
          DEFAULT: '#8C1A1A',
          light: '#a82020',
          dark: '#6b1414',
        },
        accent: {
          DEFAULT: '#E98C0B',
          light: '#f0a530',
          dark: '#c77409',
        },
        brand: {
          grey: '#C2C2C2',
          dark: '#1A1A1A',
        },
      },
      fontFamily: {
        sans: ['var(--font-dm)', 'system-ui', 'sans-serif'],
        display: ['var(--font-dm)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'hero-fade-up': {
          '0%': { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'hero-fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'hero-scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'hero-tagline': 'hero-fade-up 0.75s cubic-bezier(0.22, 1, 0.36, 1) both',
        'hero-title': 'hero-fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both',
        'hero-subtitle': 'hero-fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.22s both',
        'hero-buttons': 'hero-scale-in 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.4s both',
      },
    },
  },
  plugins: [],
};

export default config;
