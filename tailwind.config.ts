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
          50: '#f6f3ef', 100: '#e8e0d4', 200: '#d2c0ab', 300: '#bca07e',
          400: '#ab875f', 500: '#9d7550', 600: '#846045', 700: '#6b4d3b',
          800: '#5a4133', 900: '#4a3728',
        },
        forest: {
          50: '#f2f7f2', 100: '#e0ede0', 200: '#c2dbc3', 300: '#98c09b',
          400: '#6ba170', 500: '#498454', 600: '#376941', 700: '#2d5536',
          800: '#26452d', 900: '#1f3926',
        },
        clay: {
          50: '#fdf6f2', 100: '#f9e8db', 200: '#f2ceb5', 300: '#e9ab86',
          400: '#df8457', 500: '#d76a3c', 600: '#c85731', 700: '#a6442a',
          800: '#853928', 900: '#6c3124',
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
