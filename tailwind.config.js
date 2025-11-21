/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      borderRadius: { sm: '10px', md: '14px', lg: '18px', xl: '24px' },
      fontFamily: { sans: ['var(--font-poppins)', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      boxShadow: {
        soft: '0 10px 30px -10px rgba(0,0,0,0.35)',
        neon: '0 0 20px hsl(var(--brand)/0.55), 0 0 40px hsl(var(--accent)/0.35)',
      },
    },
  },
  plugins: [],
};