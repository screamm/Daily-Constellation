// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cosmic-background': 'var(--color-cosmic-background)',
        'cosmic-primary': 'var(--color-cosmic-primary)',
        'cosmic-accent': 'var(--color-cosmic-accent)',
        'cosmic-text': 'var(--color-cosmic-text)',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'inner-light': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.06)',
      },
      backgroundImage: {
        'stars-pattern': "url('/stars-bg.png')",
      },
    },
  },
  plugins: [],
}