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
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
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
        'text-shine': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        'cta-glow': {
          '0%, 100%': { boxShadow: '0 10px 40px rgba(233,140,11,0.45)', transform: 'translateY(0)' },
          '50%': { boxShadow: '0 18px 60px rgba(233,140,11,0.75)', transform: 'translateY(-2px)' },
        },
        'float-badge': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'shimmer-sweep': {
          '0%': { transform: 'translateX(-120%) skewX(-20deg)' },
          '100%': { transform: 'translateX(220%) skewX(-20deg)' },
        },
      },
      animation: {
        'hero-tagline': 'hero-fade-up 0.75s cubic-bezier(0.22, 1, 0.36, 1) both',
        'hero-title': 'hero-fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both',
        'hero-subtitle': 'hero-fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.22s both',
        'hero-buttons': 'hero-scale-in 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.4s both',
        'text-shine': 'text-shine 4s linear infinite',
        'cta-glow': 'cta-glow 2.6s ease-in-out infinite',
        'float-badge': 'float-badge 3s ease-in-out infinite',
        'shimmer-sweep': 'shimmer-sweep 2.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
