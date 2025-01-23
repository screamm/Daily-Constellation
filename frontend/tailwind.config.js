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
        cosmic: {
          background: '#0A1A2F',
          primary: '#0B3D91',
          secondary: '#1E90FF',
          accent: '#FFD700',
          text: '#FFFFFF'
        }
      }
    },
  },
  plugins: [],
}