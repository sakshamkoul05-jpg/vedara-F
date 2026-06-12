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
        sand: {
          50: '#fdfbf8', 100: '#f8f3ec', 200: '#efe5d6', 300: '#e3d2b8',
          400: '#d4ba95', 500: '#c5a67a', 600: '#b08d5e', 700: '#93734a',
          800: '#7a5d3e', 900: '#634c34',
        },
        sage: {
          50: '#f4f7f3', 100: '#e3ebe0', 200: '#c7d7c2', 300: '#a2bca0',
          400: '#7d9d7a', 500: '#5e805b', 600: '#486645', 700: '#3a5138',
          800: '#2f422e', 900: '#263625',
        },
        terracotta: {
          50: '#fdf6f2', 100: '#f9e8df', 200: '#f2d0be', 300: '#e8af95',
          400: '#dd8a6b', 500: '#d47351', 600: '#c45d3d', 700: '#a44c33',
          800: '#883f2d', 900: '#6f3627',
        },
        cream: {
          50: '#fefcf9', 100: '#fdf7f0', 200: '#faede0', 300: '#f5dec5',
          400: '#edc9a3', 500: '#e3b382', 600: '#d49a64', 700: '#b87e4d',
          800: '#966540', 900: '#7b5236',
        },
        earth: {
          50: '#f7f5f2', 100: '#ede8e0', 200: '#dbd0c2', 300: '#c4b39f',
          400: '#ad967d', 500: '#9c8064', 600: '#8d6e53', 700: '#745945',
          800: '#5f4a3b', 900: '#4f3d31',
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
        alabaster: '#FBF8F5',
        vedara: {
          900: '#3D2920',
        },
        gold: {
          DEFAULT: '#C49A6C',
          50: '#FBF6ED', 100: '#F2E8D5', 200: '#E5D1B0', 300: '#D8BA8A',
          400: '#CEA668', 500: '#C49A6C', 600: '#A17E4E', 700: '#7D5F38',
          800: '#5C4326', 900: '#3D2B18',
        },
        charcoal: '#2D231F',
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
