/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Prompt', 'Outfit', 'Inter', 'sans-serif'],
        display: ['Montserrat', 'Chakra Petch', 'sans-serif'],
        marvel: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        rank: ['"Chakra Petch"', 'Prompt', 'sans-serif'],
        num: ['"Chakra Petch"', 'Montserrat', 'Outfit', 'monospace', 'sans-serif'],
      },
      colors: {
        // Crystal theme colors
        ruby: { DEFAULT: '#e63946', dark: '#9b1c28', glow: '#ff6b7a' },
        sapphire: { DEFAULT: '#4895ef', dark: '#1a4f8c', glow: '#74b4ff' },
        emerald: { DEFAULT: '#2dc653', dark: '#156b2a', glow: '#5afa85' },
        obsidian: { DEFAULT: '#6b4c9a', dark: '#3d2060', glow: '#a87be8' },
        topaz: { DEFAULT: '#f4a261', dark: '#8c4a10', glow: '#ffd09a' },
        amethyst: { DEFAULT: '#e040fb', dark: '#7b1fa2', glow: '#f287ff' },
        gold: { DEFAULT: '#ffd700', dark: '#a07800', glow: '#ffe566' },
        // UI surfaces
        surface: {
          900: '#0a0b14',
          800: '#111225',
          700: '#181a35',
          600: '#1f2248',
          500: '#252860',
        },
      },
      boxShadow: {
        ruby: '0 0 20px #e63946aa',
        sapphire: '0 0 20px #4895efaa',
        emerald: '0 0 20px #2dc653aa',
        obsidian: '0 0 20px #6b4c9aaa',
        topaz: '0 0 20px #f4a261aa',
        amethyst: '0 0 20px #e040fbaa',
        gold: '0 0 20px #ffd700aa',
        card: '0 4px 24px rgba(0,0,0,0.5)',
        'card-hover': '0 8px 40px rgba(99,102,241,0.4)',
        glass: 'inset 0 1px 0 rgba(255,255,255,0.1)',
      },
      backgroundImage: {
        'glass-card': 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        'hero-gradient': 'radial-gradient(ellipse at 50% 0%, #1e0050 0%, #0a0b14 70%)',
        'board-gradient': 'radial-gradient(ellipse at 50% 50%, #0d1030 0%, #060810 100%)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.16,1,0.3,1)',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
