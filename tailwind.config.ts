import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        cream: {
          50: '#fdfaf5', 100: '#faf3e6', 200: '#f4e5c8', 300: '#edd2a3',
          400: '#e5ba7a', 500: '#d9a154', 600: '#c48a3b', 700: '#a36e31',
          800: '#845b2d', 900: '#6c4b27',
        },
        earth: {
          50: '#f5f5f6', 100: '#e6e6e9', 200: '#cdced2', 300: '#aaacb3',
          400: '#868990', 500: '#6b6e75', 600: '#55585d', 700: '#46484c',
          800: '#3a3c40', 900: '#2d2e31',
        },
        forest: {
          50: '#f2f6f3', 100: '#e0ece3', 200: '#c1d8c6', 300: '#98bb9f',
          400: '#6e9a77', 500: '#4f7e59', 600: '#3b6444', 700: '#2f4f36',
          800: '#26402c', 900: '#1d3323',
        },
        clay: {
          50: '#fdf7f1', 100: '#faeedd', 200: '#f4dab5', 300: '#ecc288',
          400: '#e2a65a', 500: '#d98e3a', 600: '#c5752e', 700: '#a35d27',
          800: '#834c23', 900: '#6b3f1f',
        },
        alabaster: '#FDFBF7',
        vedara: {
          900: '#1A3026',
        },
        gold: {
          DEFAULT: '#C5A059',
          50: '#FAF5EB', 100: '#F2E8CC', 200: '#E5D1A0', 300: '#D8BA75',
          400: '#CEAA58', 500: '#C5A059', 600: '#A17E3E', 700: '#7D5F2F',
          800: '#5C4322', 900: '#3D2B16',
        },
        charcoal: '#2A2A2A',
      },
      fontFamily: {
        serif: ['var(--font-cormorant-garamond)', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out',
        'fade-up': 'fadeUp 1s ease-out',
        'slow-spin': 'spin 12s linear infinite',
        'float': 'float 8s ease-in-out infinite',
        'reveal': 'reveal 1.5s ease-out',
        'shimmer': 'shimmer 3s infinite',
        'wind-sweep': 'windSweep 15s linear infinite',
        'tree-sway': 'treeSway 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeUp: { '0%': { opacity: '0', transform: 'translateY(30px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        reveal: { '0%': { clipPath: 'inset(0 100% 0 0)' }, '100%': { clipPath: 'inset(0 0 0 0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        windSweep: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(100vw)' } },
        treeSway: { '0%, 100%': { transform: 'rotate(0deg) skewX(0deg)' }, '25%': { transform: 'rotate(0.2deg) skewX(0.3deg)' }, '75%': { transform: 'rotate(-0.2deg) skewX(-0.3deg)' } },
      },
      backgroundImage: {
        'vintage-paper': "url('/images/textures/paper-bg.jpg')",
        'wood-texture': "url('/images/textures/wood-bg.jpg')",
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
};

export default config;
