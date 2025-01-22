/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}', // Inkludera alla JS/TS/JSX/TSX-filer i src-mappen
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          primary: '#0B3D91', // Mörkblå (som natthimlen)
          secondary: '#1E90FF', // Ljusblå (som stjärnor)
          accent: '#FFD700', // Guld (för accent)
          background: '#0A1A2F', // Mörkblå (bakgrund)
          text: '#FFFFFF', // Vit (för text)
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Använd Inter som standardtypsnitt
      },
      spacing: {
        72: '18rem', // Lägg till anpassade spacing-värden
        84: '21rem',
        96: '24rem',
      },
      borderRadius: {
        xl: '1rem', // Lägg till anpassade border-radius-värden
        '2xl': '2rem',
        '3xl': '3rem',
      },
      boxShadow: {
        cosmic: '0 4px 14px 0 rgba(0, 0, 0, 0.25)', // Anpassad skugga
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Plugin för bättre form-stilar (om du behöver det)
    require('@tailwindcss/typography'), // Plugin för bättre typografi (om du behöver det)
  ],
};