/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17212b',
        paper: '#f7f5ef',
        coral: '#e56b5d',
        sea: '#277c7a',
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
        sans: ['Inter', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}