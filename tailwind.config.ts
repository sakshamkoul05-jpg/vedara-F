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
          50: '#fefcf5', 100: '#fdf8e8', 200: '#faf0cc', 300: '#f5e3a3',
          400: '#eed16f', 500: '#e8bb42', 600: '#daa12a', 700: '#b57d22',
          800: '#906421', 900: '#755320',
        },
        earth: {
          50: '#f5f6f8', 100: '#e4e6ea', 200: '#c9ccd3', 300: '#a6aab5',
          400: '#838897', 500: '#686d7d', 600: '#535764', 700: '#444754',
          800: '#363942', 900: '#2a2c33',
        },
        forest: {
          50: '#f1f7f3', 100: '#dceddf', 200: '#b8dbbf', 300: '#8cbf98',
          400: '#5da070', 500: '#3d8554', 600: '#2d6b42', 700: '#235636',
          800: '#1d462c', 900: '#173a24',
        },
        clay: {
          50: '#fdf8f0', 100: '#faefd8', 200: '#f4ddaf', 300: '#ecc880',
          400: '#e2ae56', 500: '#d9983a', 600: '#c7822e', 700: '#a56827',
          800: '#835222', 900: '#6b421f',
        },
      },
      fontFamily: {
        serif: ['var(--font-libre-caslon)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'fade-up': 'fadeUp 0.8s ease-out',
        'slow-spin': 'spin 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'reveal': 'reveal 1.2s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'wind-sweep': 'windSweep 12s linear infinite',
        'tree-sway': 'treeSway 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeUp: { '0%': { opacity: '0', transform: 'translateY(30px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-20px)' } },
        reveal: { '0%': { clipPath: 'inset(0 100% 0 0)' }, '100%': { clipPath: 'inset(0 0 0 0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        windSweep: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(100vw)' } },
        treeSway: { '0%, 100%': { transform: 'rotate(0deg) skewX(0deg)' }, '25%': { transform: 'rotate(0.3deg) skewX(0.5deg)' }, '75%': { transform: 'rotate(-0.3deg) skewX(-0.5deg)' } },
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
