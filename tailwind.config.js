/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: { base: '#060912', card: '#0b1120', elevated: '#101a2e' },
        brand: { DEFAULT: '#1e7cf0', light: '#3b9eff', dark: '#155cc0' },
        line: 'rgba(59, 158, 255, 0.12)',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: { glow: '0 0 24px rgba(30, 124, 240, 0.35)' },
    },
  },
  plugins: [],
}